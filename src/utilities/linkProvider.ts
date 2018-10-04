import firebase from 'firebase';
import fire, { authProviders } from '../Fire';
import { AppError } from '../models/AppError';
import { IAuthError, isIAuthError } from '../models/AuthError';
import { toProvider } from '../models/Provider';
import { ILinkInfo } from '../models/LinkInfo';
import ErrorUtil from './ErrorUtil';
import SessionStorageAccessor from './SessionStorageAccessor';

import { promptProviderSelection } from '../components/ProviderSelectionDialog';
import { MAX_PASSWORD_RETRY_COUNT } from '../constants/constants';

export const linkToExistingAccount = async (
  authError: IAuthError & ILinkInfo,
  pushErrors: (errors: AppError[]) => void,
  clearErrors: () => void
) => {
  try {
    // email/credential を取得
    const email = authError.email; // バッティングしている email アカウント
    const password = authError.password; // パスワードで登録しようとした場合にセットされている。
    const pendingCredential = authError.credential; // ペンディングしている credential (当該 email のアカウントが既存)

    // 当該アカウントの認証方法を取得
    const methods = await fire.auth().fetchSignInMethodsForEmail(email);

    // 当該アカウントの認証方法に、ペンディングしている認証方法が既に含まれている場合、
    // 当初エラー通りの扱いとして終了。
    // 例) すでにパスワード認証が認証方法に含まれている状態で、パスワード認証を追加しようとしている場合など
    if (methods.some(method => method === pendingCredential.signInMethod)) {
      console.log(`method[${pendingCredential.signInMethod}] is already exists in this account.`);
      const credentialAlreadyInUseError: IAuthError = {
        code: 'auth/credential-already-in-use',
        message: 'The credential is already in use by this account.',
      };
      throw credentialAlreadyInUseError;
    }

    // 認証方法を追加する場合、対象となるアカウントに一旦サインインする必要がある。
    // そのため、ここでプロンプトを出して、どの認証方法で対象アカウントにサインインするか選択する。
    // 選択した認証方法で対象アカウントにサインインを試み、ペンディングしている credential を紐付けする。
    // ※但しポップアップ方式を用いないため、必要な場合はリダイレクトする。
    //
    // この処理は、パスワード間違いのリトライもあるので、while loop としている。
    // この while loop は、下記条件を満たせば抜ける：
    // a). プロンプトでキャンセル(諦めた)
    // b). パスワード認証で規定回失敗する
    // c). パスワード認証を選択して認証成功し、ペンディングしている credential の紐付けに成功する
    // d). プロバイダ認証を選択し、signInWithRedirect() した後(※redirect による離脱)
    // e). 想定外の例外
    let retryCount = 0;
    while (true) {
      let exit = false;
      let wrongPassword = false;

      // プロバイダ選択ダイアログをプロンプト表示(Promise)
      const promptResult = await promptProviderSelection(methods, email, toProvider(pendingCredential.providerId));

      // エラーをクリア
      clearErrors();

      // プロンプト：キャンセル
      if (null === promptResult) {
        // a). プロンプトでキャンセル(諦めた)
        // 当初エラー通りの扱いとする
        exit = true;
        throw authError;
      }

      // プロンプト：パスワード認証を選択
      if (promptResult && promptResult.linkProvider === 'Password') {
        const existingUser = await fire
          .auth()
          .signInWithEmailAndPassword(email, promptResult.password || '')
          .catch(err => {
            console.log(err);

            // パスワード間違いの場合、規定回数までリトライ
            // その他のエラーの場合、エラーセットして while loop から抜ける
            if (isIAuthError(err) && err.code === 'auth/wrong-password') {
              wrongPassword = true;
              retryCount = retryCount + 1;

              if (MAX_PASSWORD_RETRY_COUNT <= retryCount) {
                // b). パスワード認証で規定回失敗する
                // 例外スローして、末尾の catch ブロックへ(while loop から抜ける)
                throw {
                  code: 'existing provider sign in failed',
                  message: `sign in to provider [password] failed(specified number of times has been exceeded).`,
                };
              } else {
                // ここで例外スローすると while loop から抜けてしまうので、
                // 引数で渡されたエラープッシュ用コールバックを叩いてエラー表示する。
                pushErrors([ErrorUtil.toAppError(err)]);
              }
              console.log(`retry (${retryCount})`);
            } else {
              // e). 想定外の例外
              exit = true; // exit from while loop
              throw err;
            }
          });
        if (wrongPassword) {
          continue; // プロンプトからやり直し
        }
        if (!existingUser || !existingUser.user) {
          // このパスないかも知れないが、念のため。
          throw {
            code: 'existing provider sign in failed',
            message: `sign in to provider [password] failed.`,
          };
        }

        // パスワード認証したアカウントに、ペンディングしている credential を紐付け
        const user = await existingUser.user.linkAndRetrieveDataWithCredential(pendingCredential);
        if (user) {
          // c). パスワード認証を選択して認証成功し、ペンディングしている credential の紐付けに成功する
          exit = true; // exit from while loop
          console.log('link to existing account(password) success.');
        }
      }

      // プロンプト：プロバイダ認証
      if (promptResult && promptResult.linkProvider && promptResult.linkProvider !== 'Password') {
        if (promptResult.linkProvider === 'Unknown') {
          throw { code: 'unknown provider', message: 'unknown provider detected.' };
        }
        const authProvider = authProviders.get(promptResult.linkProvider);
        if (!authProvider) {
          throw {
            code: 'not registered provider',
            message: `provider [${promptResult.linkProvider}] is not registered.`,
          };
        }

        // リダイレクトして、その後 getRedirectResult() からの処理継続となる。
        // 処理継続のための情報を、sessionStorage にセットしておく。
        SessionStorageAccessor.setAuthPendingInfo({ email: email, password: password, credential: pendingCredential });

        // 選択されたプロバイダが Google の場合、対象 email アカウントをヒントとしてセットする。
        // こうすると、Google による認証の際にこの email アカウントが初期状態となる。
        // ※ただしあくまで初期状態であり、Google の認証画面で変更はできる。つまり強制はできない。
        //   しかし意図していないユーザによる認証はある程度防げる。
        if (promptResult.linkProvider === 'Google') {
          (authProvider as firebase.auth.GoogleAuthProvider_Instance).setCustomParameters({
            login_hint: email,
          });
        }

        // 選択したプロバイダで一旦サインインするため、リダイレクトする(getRedirectResult() から処理続行)
        fire.auth().signInWithRedirect(authProvider);
        exit = true; // exit from while loop
      }

      // ループ離脱条件を満たせば離脱
      if (exit) {
        break;
      }
    }

    // 処理終了
    return;
  } catch (err) {
    // リンク処理中のエラー
    throw err;
  }
};
