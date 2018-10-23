import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core';
import withRoot from '../utilities/withRoot';
import { withSnackbar, InjectedNotistackProps, VariantType, OptionsObject } from 'notistack';
import fire from '../Fire';
import { appActions, authActions } from '../actions';
import { IAppState, IAuthState } from '../reducers';
import { UserInfo } from '../models/UserInfo';
import { IAppError, AppError, isIAppError } from '../models/AppError';
import { AppInfo } from '../models/AppInfo';
import { isIAuthError } from '../models/AuthError';
import { Severity } from '../models/Severity';
import { InfoLevel } from '../models/InfoLevel';
import AppErrorUtil from '../utilities/AppErrorUtil';
import AppInfoUtil from '../utilities/AppInfoUtil';
import SessionStorageAccessor from '../utilities/SessionStorageAccessor';
import { isGmail } from '../utilities/misc';

import { AUTH_EMAIL_VERIFICATION_REQUIRED } from '../constants/constants';

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
interface IOwnProps extends WithStyles<typeof styles>, RouteComponentProps<{}>, InjectedNotistackProps {}

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
    pushInfos: (errors: AppInfo[]) => void;
    clearInfos: () => void;
    stateChanged: (userInfo: UserInfo) => void;
    signOut: () => void;
  };
}

// entire props of this component
type Props = IStateProps & IDispatchProps & IOwnProps;

// local state of this component
interface State {}

const mapStateToProps = (state: IStateProps, ownProps: IOwnProps): IStateProps => ({
  app: state.app,
  auth: state.auth,
});

const mapDispatchToProps = (dispatch: Redux.Dispatch, ownProps: IOwnProps): IDispatchProps => {
  return {
    actions: {
      pushErrors: (errors: AppError[]) => dispatch(appActions.pushErrors(errors)),
      clearErrors: () => dispatch(appActions.clearErrors()),
      pushInfos: (infos: AppInfo[]) => dispatch(appActions.pushInfos(infos)),
      clearInfos: () => dispatch(appActions.clearInfos()),
      stateChanged: (userInfo: UserInfo) => dispatch(authActions.stateChanged(userInfo)),
      signOut: () => dispatch(authActions.signOut.started()),
    },
  };
};

class ApplicationManager extends React.Component<Props, State> {
  public state: State = {};

  // 強制サインアウトフラグ
  private forceSignOut: boolean = false;

  public componentDidMount() {
    this.mountFirebaseObservers();
  }

  public componentWillReceiveProps(props: Props) {
    // AppError や AppInfo を Snackbar として表示する

    const items: { message: string; options?: OptionsObject }[] = [];

    if (props.app.errors.length > 0) {
      props.app.errors.forEach((appError: AppError) => {
        if (isIAppError(appError)) {
          let variant: VariantType = 'default';
          let autoHideDuration: number | undefined = 8000;
          switch (appError.severity) {
            case Severity.FATAL:
              variant = 'error';
              autoHideDuration = undefined;
              break;
            case Severity.WARNING:
              variant = 'warning';
              break;
            case Severity.NONE:
            default:
              break;
          }
          items.push({
            message: `[${appError.code}]: ${appError.message}`,
            options: {
              variant: variant,
              autoHideDuration: autoHideDuration,
            },
          });
        }
      });
    }

    if (props.app.infos.length > 0) {
      props.app.infos.forEach((appInfo: AppInfo) => {
        if (appInfo) {
          let variant: VariantType = 'default';
          let autoHideDuration: number | undefined = 5000;
          switch (appInfo.level) {
            case InfoLevel.INFO:
              variant = 'info';
              break;
            case InfoLevel.SUCCESS:
              variant = 'success';
              break;
            case InfoLevel.WARNING:
              variant = 'warning';
              break;
            case InfoLevel.ERROR:
              variant = 'error';
              autoHideDuration = undefined;
              break;
            case InfoLevel.NONE:
            default:
              break;
          }
          items.push({
            message: `[${appInfo.title}]: ${appInfo.message}`,
            options: {
              variant: variant,
              autoHideDuration: autoHideDuration,
            },
          });
        }
      });
    }

    // Snackbar 表示
    items.forEach(item => {
      // 複数個存在する場合、ちょっと間を開けないとダメ
      setTimeout(() => {
        props.enqueueSnackbar(item.message, item.options);
      }, 100);
    });

    // 出し終わったら store から削除
    if (props.app.errors.length > 0) {
      this.props.actions.clearErrors(); // 出したら消す
    }
    if (props.app.infos.length > 0) {
      this.props.actions.clearInfos(); // 出したら消す
    }
  }

  public render() {
    return null;
  }

  // アプリケーションエラーのセット
  private setAppError = (error: any, option?: { name?: string; stack?: string; severity?: Severity }) => {
    const appError: IAppError = AppErrorUtil.toAppError(error, option);
    this.props.actions.pushErrors([appError]);
  };

  // アプリケーションインフォのセット
  private setAppInfo = (info: { level?: InfoLevel; title: string; message: string }) => {
    const appInfo = AppInfoUtil.createAppInfo({
      level: info.level || InfoLevel.INFO,
      title: info.title,
      message: info.message,
    });
    this.props.actions.pushInfos([appInfo]);
  };

  // Firebase オブザーバ(認証関連)のマウント
  private mountFirebaseObservers = () => {
    // onAuthStateChanged
    // 公式: signInWithRedirect を使用する場合、onAuthStateChanged オブザーバーは getRedirectResult が解決された後にトリガーされます。
    // - つまり認証状態はここで見ていればよい。
    // fire.auth().onIdTokenChanged(
    fire.auth().onAuthStateChanged(
      (user: firebase.User) => {
        console.log(user ? 'User is signed in.' : 'User is NOT signed in.');
        console.log('onAuthStateChanged: success cb', user);

        if (AUTH_EMAIL_VERIFICATION_REQUIRED) {
          // emailVerified では無かった場合、verify を促し、強制サインアウトする。
          if (user && !user.emailVerified) {
            // その旨のメッセージを表示し、強制サインアウト
            this.setAppInfo({
              title: 'Email verification required',
              message: 'We sent a email to your account for verification. Check it and sign-in again.',
            });

            this.forceSignOut = true; // 強制 Sign out フラグを立てる
          }
        }

        if (this.forceSignOut) {
          console.log('sign out forcibly. skipping notifying auth info to Store.');
          this.forceSignOut = false; // 強制 Sign out フラグを降ろす
          this.props.actions.signOut();
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
              providerData: user.providerData,
              emailVerified: user.emailVerified,
            }
          : user;
        this.props.actions.stateChanged(userInfo);
      },
      (err: firebase.auth.Error) => {
        console.log('onAuthStateChanged: error cb', err);
        this.setAppError(err, { name: 'onAuthStateChanged', stack: JSON.stringify(err), severity: Severity.FATAL });
      }
    );

    // getRedirectResult
    // 前画面からリダイレクト系処理(signInWithRedirect() や linkWithRedirect() など)を経てきた場合、
    // onAuthStateChanged() に先んじて、この処理が実行される。
    (async () => {
      // sessionStorage から ridirect 前の認証アクションを取得(その後クリア)
      const authAction = SessionStorageAccessor.getAuthAction();
      SessionStorageAccessor.setAuthAction(null);

      try {
        const cred = await fire.auth().getRedirectResult();
        console.log('getRedirectResult: success cb', cred);

        if (cred && cred.user) {
          if (authAction) {
            switch (authAction.action) {
              case 'SignUp': {
                // 新規作成時のチェック
                // 1. 新規ユーザではなかった場合
                if (cred.additionalUserInfo && !cred.additionalUserInfo.isNewUser) {
                  console.log('new user not created.');

                  // その旨のエラーを表示し、強制サインアウト
                  this.setAppError(
                    {
                      code: 'new user not created',
                      message: 'you intended to create a new user, but user not created.',
                    },
                    {
                      name: 'getRedirectResult',
                    }
                  );

                  // 強制サインアウトフラグを立てる
                  this.forceSignOut = true;
                }

                // 2. 新規ユーザで Google 認証以外で @gmail.com の場合、削除して作成失敗とする
                if (
                  cred.additionalUserInfo &&
                  cred.additionalUserInfo.isNewUser &&
                  authAction.provider !== 'Google' &&
                  cred.user.email &&
                  isGmail(cred.user.email)
                ) {
                  console.log(
                    'unintended user created(account email address @gmail.com is not allowed other than provider Google). deleting start.'
                  );

                  // その旨のエラーを表示し、強制サインアウト
                  this.setAppError(
                    {
                      code: 'unintended user created',
                      message:
                        'unintended user created(account email address @gmail.com is not allowed other than provider Google).',
                    },
                    {
                      name: 'getRedirectResult',
                    }
                  );

                  // 強制サインアウトフラグを立てる
                  this.forceSignOut = true;

                  // 削除対象ユーザを削除
                  await cred.user.delete();

                  console.log('unintended user deleted.');
                }

                if (AUTH_EMAIL_VERIFICATION_REQUIRED) {
                  // もし emailVerified でなければ、verify メールを送信
                  if (!this.forceSignOut && !cred.user.emailVerified) {
                    console.log('sent a verification email.');
                    await cred.user.sendEmailVerification();
                  }
                }

                break;
              }

              case 'SignIn':
              default: {
                // サインイン時のチェック
                // 1. アカウントが新規作成されていた場合、削除してサインイン失敗とする
                if (cred.additionalUserInfo && cred.additionalUserInfo.isNewUser) {
                  console.log('unintended user created(in phase sign-in). deleting start.');

                  // その旨のエラーを表示し、強制サインアウト
                  this.setAppError(
                    {
                      code: 'unintended user created',
                      message: 'unintended user created(in phase sign-in).',
                    },
                    {
                      name: 'getRedirectResult',
                    }
                  );

                  // 強制サインアウトフラグを立てる
                  this.forceSignOut = true;

                  // 削除対象ユーザを削除
                  await cred.user.delete();

                  console.log('unintended user deleted.');
                }
                break;
              }

              case 'AddLink': {
                // 成功時のメッセージ
                this.props.actions.pushInfos([
                  AppInfoUtil.createAppInfo({
                    level: InfoLevel.SUCCESS,
                    title: 'Success',
                    message: `Sign-in method by ${authAction.provider} added successfully.`,
                  }),
                ]);
              }
            }
          }
        }
      } catch (err) {
        console.log('getRedirectResult: error cb', err);
        const severity = !isIAuthError(err) ? Severity.FATAL : Severity.WARNING;
        this.setAppError(err, { name: 'getRedirectResult', stack: JSON.stringify(err), severity: severity });
      }
    })();
  };
}

export default withRouter(
  withRoot(
    withSnackbar(
      withStyles(styles)(
        connect(
          mapStateToProps,
          mapDispatchToProps
        )(ApplicationManager)
      )
    )
  )
);
