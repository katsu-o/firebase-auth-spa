import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Snackbar, IconButton, Theme, createStyles, WithStyles, withStyles } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';
import withRoot from '../utilities/withRoot';
import fire, { authProviders } from '../Fire';
import { appActions, authActions } from '../actions';
import { IAppState, IAuthState } from '../reducers';
import { UserInfo } from '../models/UserInfo';
import { IAppError, AppError, isIAppError } from '../models/AppError';
import { IAuthError, isIAuthError } from '../models/AuthError';
import { isIPendingCredentialError } from '../models/PendingCredentialError';
import { ILinkInfo } from '../models/LinkInfo';
import { toProvider } from '../models/Provider';
import { Severity } from '../models/Severity';
import ErrorUtil from '../utilities/ErrorUtil';
import { linkToExistingAccount } from '../utilities/linkProvider';
import SessionStorageAccessor from '../utilities/SessionStorageAccessor';
import { ERROR_CODE } from '../constants/constants';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    grow: {
      flexGrow: 1,
    },
  });

// props from parent
interface IOwnProps extends WithStyles<typeof styles>, RouteComponentProps<{}> {}

// props of this component extracted from Store
interface IStateProps {
  app: IAppState;
  auth: IAuthState;
}

// props set to Dispatcher
interface IDispatchProps {
  actions: {
    pushErrors: (errors: AppError[]) => void;
    clearErrors: () => void;
    authStateChanged: (userInfo: UserInfo) => void;
    signOut: () => void;
  };
}

// entire props of this component
type Props = IStateProps & IDispatchProps & IOwnProps;

// local state of this component
interface State {
  snackbarOpen: boolean;
  snackbarMessage: JSX.Element | null;
}

const mapStateToProps = (state: IStateProps, ownProps: IOwnProps): IStateProps => ({
  app: state.app,
  auth: state.auth,
});

const mapDispatchToProps = (dispatch: Redux.Dispatch, ownProps: IOwnProps): IDispatchProps => {
  return {
    actions: {
      pushErrors: (errors: AppError[]) => dispatch(appActions.pushErrors(errors)),
      clearErrors: () => dispatch(appActions.clearErrors()),
      authStateChanged: (userInfo: UserInfo) => dispatch(authActions.stateChanged(userInfo)),
      signOut: () => dispatch(authActions.signOut.started()),
    },
  };
};

class ApplicationManager extends React.Component<Props, State> {
  public state: State = {
    snackbarOpen: false,
    snackbarMessage: null,
  };

  public componentDidMount() {
    this.mountFirebaseObservers();
  }

  public componentWillReceiveProps(props: Props) {
    if (props.app.errors.length > 0) {
      // とりあえずエラーを１個取り出す。
      // TODO: 複数個ある場合など
      const appError: AppError = props.app.errors[0];
      if (isIAppError(appError)) {
        this.setState({
          ...this.state,
          snackbarOpen: true,
          snackbarMessage: this.buildSnackbarMessage(appError),
        });
      }
      // 画面遷移時の Snackbar 消去については、
      // ※ Saga で "@@router/LOCATION_CHANGE" で hook 掛けて対処
      // this.props.actions.clearErrors();
    }
  }

  public render() {
    const { snackbarOpen, snackbarMessage } = this.state;
    return (
      <React.Fragment>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={snackbarOpen}
          onClose={this.handleCloseSnackbar}
          autoHideDuration={undefined}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={snackbarMessage}
          action={[
            <IconButton key="close" aria-label="Close" color="inherit" onClick={this.handleCloseSnackbar}>
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </React.Fragment>
    );
  }

  // Snackar メッセージ(エラー)の作成
  private buildSnackbarMessage = (appError: IAppError): JSX.Element => {
    return (
      <div id="message-id">
        <div>{appError.code}</div>
        <div>{appError.message}</div>
      </div>
    );
  };

  // Snackar メッセージのクローズ
  private handleCloseSnackbar = (event: React.MouseEvent) => {
    this.setState({
      ...this.state,
      snackbarOpen: false,
      // snackbarMessage: null, // ここで消すと閉じる時にのっぺらぼうになる
    });
  };

  // アプリケーションエラーのセット
  private setAppError = (error: any, option?: { name?: string; stack?: string; severity?: Severity }) => {
    const appError: IAppError = ErrorUtil.toAppError(error, option);
    this.props.actions.pushErrors([appError]);
  };

  // Firebase オブザーバ(認証関連)のマウント
  private mountFirebaseObservers = () => {
    // onAuthStateChanged
    // 公式: signInWithRedirect を使用する場合、onAuthStateChanged オブザーバーは getRedirectResult が解決された後にトリガーされます。
    // - つまり認証状態はここで見ていればよい。
    fire.auth().onAuthStateChanged(
      (user: firebase.User) => {
        console.log(user ? 'User is signed in.' : 'User is NOT signed in.');
        console.log('onAuthStateChanged: success cb', user);

        // 強制 Sign out が指定されている場合
        if (SessionStorageAccessor.getForceSignOut()) {
          console.log('sign out forcibly. skipping notifying auth info to Store.');
          SessionStorageAccessor.setForceSignOut(false); // 強制 Sign out フラグを降ろす
          this.props.actions.signOut();
          return;
        }

        // ペンディング認証情報が存在するか、
        // Sign in 継続中なら、何も処理しない。
        if (SessionStorageAccessor.getAuthPendingInfo() || SessionStorageAccessor.getOngoingSignIn()) {
          console.log('sign in is ongoing. skipping notifying auth info to Store.');
          SessionStorageAccessor.setOngoingSignIn(false); // Sign in 継続中フラグを降ろす
          return;
        }

        // Store に認証状態を通知
        const userInfo: UserInfo = user
          ? {
              displayName: user.displayName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              photoURL: user.photoURL,
              providerId: user.providerId,
              uid: user.uid,
              providerData: () => user.providerData,
            }
          : user;
        this.props.actions.authStateChanged(userInfo);
      },
      (err: firebase.auth.Error) => {
        console.log('onAuthStateChanged: error cb', err);
        this.setAppError(err, { name: 'onAuthStateChanged', stack: JSON.stringify(err), severity: Severity.FATAL });
      }
    );

    // getRedirectResult
    // 前画面からリダイレクト系処理(signInWithRedirect() や linkWithRedirect() など)を経てきた場合、
    // onAuthStateChanged() に先んじて、この処理が実行される。
    // ※条件分岐が多く then/catch ではハンドリングがキビシイので、async 化して await を使っています。
    (async () => {
      // sessionStorage からペンディングしている認証情報を取得
      const pending = SessionStorageAccessor.getAuthPendingInfo();

      try {
        // getRedirectResult() の戻り値：
        // 1). signInWithRedirect() から
        //   - 前画面から signInWithRedirect(provider) として指定された provider による認証を経てここに来る。
        //     - success -> そのまま Sign in 可能だった場合
        //       a). 当該 email のユーザ新規作成時：
        //           指定された provider による認証で返された email が firebase authentication のユーザリストに存在しなかった。
        //           この場合、当該 email アカウントが指定された provider 認証でユーザが新規作成され、そのユーザが返される。
        //       b). 当該 email のユーザは既存だが既にその provider は紐付け済だった：
        //           指定された provider による認証で返された email が firebase authentication のユーザリストに存在し、
        //           その provider による認証は当該ユーザに紐付け済だった場合、そのユーザが返される。
        //     - error -> そのままでは Sign in 不可能(既存でその provider に紐づけが無い)だった場合
        //       a). 当該 email のユーザは既存だが、まだその provider の紐付けが無かった：
        //           指定された provider による認証で返された email が firebase authentication のユーザリストに存在し、
        //           その provider による認証は当該ユーザに紐付けが無かった場合、エラー情報とともにペンディングされた
        //           credential 情報が返される(※以降、これを利用して、当該 email のユーザへの認証方法の紐付けを行う)。
        //       b). それ以外：
        //           アプリケーション側でエラーとして処理
        // 2). linkWithRedirect() から
        //   - 前画面から サインイン済のユーザに対する linkWithRedirect(provider) として、指定された provider による認証を
        //     経てここに来る。
        //     - success -> 処理に成功した場合
        //       指定された provider による認証が新たに追加紐付けされたユーザが返される。
        //     - error -> 処理に失敗した場合
        //       アプリケーション側でエラーとして処理
        const cred = await fire.auth().getRedirectResult();
        console.log('getRedirectResult: success cb', cred);
        // そのまま Sign in 可能(新規 or 既存だが既にその provider は紐づけ済)

        if (cred && cred.user) {
          if (pending) {
            console.log('pending credential exists.');

            if (pending.email !== cred.user.email) {
              // ペンディング認証情報とこれから Sign in されるユーザの email が違う場合
              // ※外部プロバイダで認証する際に当初認証しようとしていたユーザとは別のユーザが指定されてきた場合
              console.log('pending email does not match current email.');

              // 意図しないユーザで認証を進めようとしているため、後続処理は止めて強制ログアウトの方向で進める。
              SessionStorageAccessor.setForceSignOut(true);

              // ペンディング認証情報を削除する。
              SessionStorageAccessor.setAuthPendingInfo(null);
              console.log('removed pending credential from session storage.');

              // 後始末：
              // email が違うので後続処理は進めないが、認証されたのが新規ユーザだった場合は削除する。
              if (cred.additionalUserInfo && cred.additionalUserInfo.isNewUser) {
                console.log('unintended user created. deleting start.');
                await cred.user.delete();
                console.log('unintended user deleted.');
              }

              // 処理を中断する旨のエラーをセット
              this.setAppError(
                {
                  code: "account's email address does not match",
                  message: "authenticated account's email address does not match to you want to link.",
                },
                {
                  name: 'getRedirectResult',
                }
              );
            } else {
              // ペンディング認証情報とこれから Sign in されるユーザの email が一致した場合
              console.log('pending email matches to current email.');

              // ペンディング認証情報からプロバイダ情報を取得
              const pendingProvider = toProvider(pending.credential.providerId);
              if (pendingProvider === 'Unknown') {
                throw { code: 'unknown provider', message: 'unknown provider detected.' };
              }

              // これから認証方法として追加するプロバイダ情報を取得
              // spoke: 自転車の車輪(hub/spoke)
              const spokeProvider = authProviders.get(pendingProvider);
              if (!spokeProvider) {
                throw { code: 'not registered provider', message: `provider [${pendingProvider}] is not registered.` };
              }

              // 以下の処理で、ペンディング認証情報の紐づけが開始されるので、
              // ここでペンディング認証情報を削除する。
              SessionStorageAccessor.setAuthPendingInfo(null);
              console.log('removed pending credential from session storage.');

              if (pendingProvider === 'Password') {
                await cred.user.updatePassword(pending.password || '');
              } else {
                // この後に処理される onAuthStateChanged() では、この段階で Sign in しているユーザが渡されてくるため、
                // 再度リダイレクトが開始されるまで Sign in 完了と表示される。これを避けるため、Sign in 継続中のフラグを立てて回避する。
                SessionStorageAccessor.setOngoingSignIn(true);

                // このユーザに、ペンディング認証情報をリンクするよう redirect する。
                await cred.user.linkWithRedirect(spokeProvider);
              }
            }
          } else {
            console.log('no pending credentials.');
          }
        }
      } catch (err) {
        console.log('getRedirectResult: error cb', err);
        if (
          isIAuthError(err) &&
          isIPendingCredentialError(err) &&
          err.code === ERROR_CODE.AUTH_ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL
        ) {
          if (pending && pending.email !== err.email) {
            // ここに到達するケース：
            // 0). 初期状態
            //   - abc@gmail.com (Google) <- ※この email で GitHub アカウントを持っている。
            //   - xyz@hoge.com (GitHub)
            // 1). Sign Up で xyz@hoge.com について、パスワード認証の追加を実行。
            // 2). プロバイダ選択ダイアログが表示され、GitHub に連携を促される。
            // 3). GitHub の連携を abc@gmail.com の方の GitHub アカウントで進める。
            //
            // x). 結果
            // - getRedirectResult() に来るが、このアカウントは abc@gmail.com (Google) として既に存在しているところに、
            //   未認証のプロバイダ abc@gmail.com (GitHub) で認証を進めようとすることになるため、
            //   AUTH_ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL となる。
            //
            // - また このスコープの if 文の条件で、念のため email の不一致判定をしているが、pending が存在するという条件
            //   だけでよいはず。
            //   なぜなら既存の email へ pending 状態のプロバイダを追加するために、一旦当該 email の既存のプロバイダで
            //   Sign in するようリダイレクトされて、再度起動時に getRedirectResult() に処理されるのだが、
            //   pending の email と Sign in の email が一致しているなら、そもそも Sign in は成功するはずである。
            //   つまり Sign in に失敗して、AUTH_ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL であるということは、
            //   pending の email と Sign in の email が不一致であるはず、ということ。

            console.log('pending email does not match to current email.');
            // ペンディング認証情報と今エラー対象となったもので email が違うので、認証方法の紐付け処理は続行できない。
            // また、エラー対象は既存のハズなので削除できない。

            // 意図しないユーザで認証を進めようとしているため、後続処理は止めて強制ログアウトの方向で進める。
            SessionStorageAccessor.setForceSignOut(true);

            // ペンディング認証情報を削除する。
            SessionStorageAccessor.setAuthPendingInfo(null);
            console.log('removed pending credential from session storage.');

            // 処理を中断する旨のエラーをセット
            // - 紐づけしようとしているユーザとは別の email アカウントとなる形でプロバイダ認証を行い、
            //   そこで認証された email アカウントにそのプロバイダの認証がまだ存在しなかった場合
            // つまり：
            // - 見当はずれのユーザでプロバイダ認証をしたが、そのユーザは既にユーザリストに既存し、
            //   なおかつたった今行ったプロバイダ認証がそのユーザに紐付けられていなかった場合
            this.setAppError(
              {
                code: "account's email address does not match",
                message:
                  "authenticated account's email address(already exists, but the provider you selected has not be included yet) does not match to you want to link.",
              },
              {
                name: 'getRedirectResult',
                stack: JSON.stringify(err),
                severity: Severity.FATAL,
              }
            );
          } else {
            // エラー情報に含まれるペンディング認証 credential を利用して、
            // 既存アカウントへのリンク処理を開始
            await linkToExistingAccount(
              err as IAuthError & ILinkInfo,
              this.props.actions.pushErrors,
              this.props.actions.clearErrors
            ).catch(err => {
              console.log(err);
              this.setAppError(err, {
                name: 'getRedirectResult/linkToExistingAccount',
                stack: JSON.stringify(err),
                severity: Severity.FATAL,
              });
            });
          }
        } else {
          // エラー処理
          // ここに来るということは、getRedirectResult() が完全にコケている。

          // 後始末:
          // 後続処理は止めて強制ログアウトの方向で進める。
          SessionStorageAccessor.setForceSignOut(true);

          // ペンディング認証情報を削除する。
          SessionStorageAccessor.setAuthPendingInfo(null);
          console.log('removed pending credential from session storage.');

          const severity = !isIAuthError(err) ? Severity.FATAL : Severity.WARNING;
          this.setAppError(err, { name: 'getRedirectResult', stack: JSON.stringify(err), severity: severity });
        }
      }
    })();
  };
}

export default withRouter(
  withRoot(
    withStyles(styles)(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(ApplicationManager)
    )
  )
);
