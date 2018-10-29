// tslint:disable no-else-after-return
import { Action } from 'typescript-fsa';
import { delay } from 'redux-saga';
import { put, call, fork, join } from 'redux-saga/effects';
import fire, { authProviders, emailAuthProvider } from '../Fire';
import { appActions, authActions } from '../actions';
import { SigningInfo } from '../models/SigningInfo';
import { UserInfo } from '../models/UserInfo';
import { Profile } from '../models/Profile';
import { IAppInfo } from '../models/AppInfo';
import { isIAuthError } from '../models/AuthError';
import { Severity } from '../models/Severity';
import { InfoLevel } from '../models/InfoLevel';
import { toAuthProviderId } from '../models/AuthProvider';
import SessionStorageAccessor from '../utilities/SessionStorageAccessor';
import AppErrorUtil from '../utilities/AppErrorUtil';
import AppInfoUtil from '../utilities/AppInfoUtil';
import {
  AUTH_EMAIL_VERIFICATION_REQUIRED,
  AUTH_SEND_EMAIL_VERIFICATION_AT_EMAIL_UPDATED,
  AUTH_SHOW_USER_NOT_FOUND_AT_SEND_PASSWORD_RESET_EMAIL,
  AUTH_RELOAD_TIMEOUT,
} from '../constants/constants';

const authSaga = {
  signUp: function*(action: Action<SigningInfo>): IterableIterator<any> {
    console.log('authSaga: signUp start.');
    try {
      const signing = action.payload;
      if (!signing) {
        throw { code: 'no signing information', message: `signing information is not set.` };
      }

      // Email & Password / Provider
      switch (signing.authProvider) {
        case 'Google': // TODO: Facebook/Twitter/GitHub を SignUp 対象とするかどうか
        case 'Facebook':
        case 'Twitter':
        case 'GitHub': {
          console.log(`${signing.authProvider} signUp start`);

          // プロバイダチェック
          const authProvider = authProviders.get(signing.authProvider);
          if (!authProvider) {
            throw { code: 'not registered provider', message: `provider [${signing.authProvider}] is not registered.` };
          }

          // リダイレクト前に、これから行う処理が SignUp であることを sessionStorage に持たせておく。
          SessionStorageAccessor.setAuthAction({ action: 'SignUp', provider: signing.authProvider });

          // 行ってこい(Redirect)
          yield fire.auth().signInWithRedirect(authProvider);
          break;
        }

        case 'Password':
        default: {
          console.log(`${signing.authProvider} signUp start`);

          // ユーザ新規作成
          const newUser: firebase.auth.UserCredential = yield fire
            .auth()
            .createUserWithEmailAndPassword(signing.email || '', signing.password || '');
          console.log(newUser);

          // ユーザ名をセットする
          if (newUser && newUser.user) {
            // ※以下の処理では、onAuthStateChanged イベントは発火されない
            yield newUser.user.updateProfile({ displayName: signing.userName, photoURL: null });

            // Firebase 側と同期(更新内容がカレントユーザに反映されるまで多少時間がかかる)
            // 暫く待ってからカレントユーザを再取得し、store(redux) に認証情報を再セット
            const task = yield fork(authSaga.syncState, authActions.syncState.started(AUTH_RELOAD_TIMEOUT));
            yield join(task);

            if (AUTH_EMAIL_VERIFICATION_REQUIRED) {
              console.log('sent a verification email.');
              yield newUser.user.sendEmailVerification();
            }
          } else {
            // 具体的なパスが見えないが、念のため
            throw { code: 'user creation failed', message: `failed to craete a new user.` };
          }

          // 処理完了を通知(成功)
          yield put(authActions.signUp.done({ params: action.payload, result: true }));
        }
      }
    } catch (err) {
      yield put(authActions.signUp.failed({ params: action.payload, error: err }));
      const appError = AppErrorUtil.toAppError(err, {
        name: 'signUp',
        stack: JSON.stringify(err),
        severity: isIAuthError(err) ? Severity.WARNING : Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: signUp end.');
    }
  },

  signIn: function*(action: Action<SigningInfo>): IterableIterator<any> {
    console.log('authSaga: signIn start.');
    try {
      const signing = action.payload;
      if (!signing) {
        throw { code: 'no signing information', message: `signing information is not set.` };
      }

      // Email & Password / Provider
      switch (signing.authProvider) {
        case 'Google':
        case 'Facebook':
        case 'Twitter':
        case 'GitHub': {
          console.log(`${signing.authProvider} signIn start`);

          // プロバイダチェック
          const authProvider = authProviders.get(signing.authProvider);
          if (!authProvider) {
            throw { code: 'not registered provider', message: `provider [${signing.authProvider}] is not registered.` };
          }

          // リダイレクト前に、これから行う処理が SignUp であることを sessionStorage に持たせておく。
          SessionStorageAccessor.setAuthAction({ action: 'SignIn', provider: signing.authProvider });

          // 行ってこい(Redirect)
          yield fire.auth().signInWithRedirect(authProvider);
          break;
        }

        case 'Password':
        default: {
          if (signing.email && signing.password) {
            console.log(`${signing.authProvider} signIn start`);

            // サインイン
            const user: firebase.auth.UserCredential = yield fire
              .auth()
              .signInWithEmailAndPassword(signing.email, signing.password);
            console.log(user);

            // 処理完了
            yield put(authActions.signIn.done({ params: action.payload, result: true }));
            break;
          }
        }
      }
    } catch (err) {
      yield put(authActions.signIn.failed({ params: action.payload, error: err }));
      const appError = AppErrorUtil.toAppError(err, {
        name: 'signIn',
        stack: JSON.stringify(err),
        severity: isIAuthError(err) ? Severity.WARNING : Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: signIn end.');
    }
  },

  signOut: function*(action: Action<undefined>): IterableIterator<any> {
    console.log('authSaga: signOut start.');
    try {
      // サインアウト
      yield fire.auth().signOut();

      // 処理完了
      yield put(authActions.signOut.done({ params: action.payload, result: true }));
    } catch (err) {
      yield put(authActions.signOut.failed({ params: action.payload, error: err }));
      const appError = AppErrorUtil.toAppError(err, {
        name: 'signOut',
        stack: JSON.stringify(err),
        severity: isIAuthError(err) ? Severity.WARNING : Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: signOut end.');
    }
  },

  syncState: function*(action: Action<number | undefined>): IterableIterator<any> {
    console.log('authSaga: syncState start.');
    try {
      // timeout 値が指定されていれば、その間待ってから処理実行
      const timeout = action.payload;
      if (timeout) {
        yield call(delay, timeout);
      }

      // カレントユーザを取得して、認証状態として再セット
      const user = fire.auth().currentUser;
      console.dir(user);
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
      yield put(authActions.stateChanged(userInfo));

      // 処理完了
      yield put(authActions.syncState.done({ params: action.payload, result: true }));
    } catch (err) {
      yield put(authActions.syncState.failed({ params: action.payload, error: err }));
      const appError = AppErrorUtil.toAppError(err, {
        name: 'syncState',
        stack: JSON.stringify(err),
        severity: isIAuthError(err) ? Severity.WARNING : Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: syncState end.');
    }
  },

  addLink: function*(action: Action<SigningInfo>): IterableIterator<any> {
    console.log('authSaga: addLink start.');
    try {
      const signing = action.payload;
      const currentUser = fire.auth().currentUser;
      if (!signing) {
        throw { code: 'no signing information', message: `signing information is not set.` };
      }
      if (!currentUser) {
        throw { code: 'user not signed in', message: 'this operation requires user to be signed in.' };
      }

      // Email & Password / Provider
      switch (signing.authProvider) {
        case 'Google':
        case 'Facebook':
        case 'Twitter':
        case 'GitHub': {
          console.log(`${signing.authProvider} addLink start`);

          // プロバイダチェック
          const authProvider = authProviders.get(signing.authProvider);
          if (!authProvider) {
            throw { code: 'not registered provider', message: `provider [${signing.authProvider}] is not registered.` };
          }

          // リダイレクト前に、これから行う処理が Link であることを sessionStorage に持たせておく。
          SessionStorageAccessor.setAuthAction({ action: 'AddLink', provider: signing.authProvider });

          // 行ってこい(Redirect)
          yield currentUser.linkWithRedirect(authProvider);
          // ※以下の処理では、onAuthStateChanged イベントは発火されない
          // yield currentUser.linkWithPopup(authProvider);

          break;
        }

        case 'Password':
        default: {
          if (signing.email && signing.password) {
            console.log(`${signing.authProvider} addLink start`);

            const credential = emailAuthProvider.credential(signing.email, signing.password);

            // ※以下の処理では、onAuthStateChanged イベントは発火されない
            yield currentUser.linkAndRetrieveDataWithCredential(credential);

            // Firebase 側と同期(更新内容がカレントユーザに反映されるまで多少時間がかかる)
            // 暫く待ってからカレントユーザを再取得し、store(redux) に認証情報を再セット
            const task = yield fork(authSaga.syncState, authActions.syncState.started(AUTH_RELOAD_TIMEOUT));
            yield join(task);

            // 成功時のメッセージ
            yield put(
              appActions.pushInfos([
                AppInfoUtil.createAppInfo({
                  level: InfoLevel.SUCCESS,
                  title: 'Success',
                  message: `Sign-in method by ${signing.authProvider} added successfully.`,
                }),
              ])
            );

            // 処理完了
            yield put(authActions.addLink.done({ params: action.payload, result: true }));
            break;
          }
        }
      }
    } catch (err) {
      yield put(authActions.addLink.failed({ params: action.payload, error: err }));
      const appError = AppErrorUtil.toAppError(err, {
        name: 'addLink',
        stack: JSON.stringify(err),
        severity: isIAuthError(err) ? Severity.WARNING : Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: addLink end.');
    }
  },

  removeLink: function*(action: Action<SigningInfo>): IterableIterator<any> {
    console.log('authSaga: removeLink start.');
    try {
      const signing = action.payload;
      const currentUser = fire.auth().currentUser;
      if (!signing) {
        throw { code: 'no signing information', message: `signing information is not set.` };
      }
      if (!currentUser) {
        throw { code: 'user not signed in', message: 'this operation requires user to be signed in.' };
      }

      if (signing.authProvider) {
        console.log(`${signing.authProvider} removeLink start`);

        // プロバイダチェック
        const providerId = toAuthProviderId(signing.authProvider);
        if (providerId === 'unknown') {
          throw { code: 'not registered provider', message: `provider [${signing.authProvider}] is not registered.` };
        }

        // リンク解除
        // ※以下の処理では、onAuthStateChanged イベントは発火されない
        yield currentUser.unlink(providerId);

        // Firebase 側と同期(更新内容がカレントユーザに反映されるまで多少時間がかかる)
        // 暫く待ってからカレントユーザを再取得し、store(redux) に認証情報を再セット
        const task = yield fork(authSaga.syncState, authActions.syncState.started(AUTH_RELOAD_TIMEOUT));
        yield join(task);

        // 成功時のメッセージ
        yield put(
          appActions.pushInfos([
            AppInfoUtil.createAppInfo({
              level: InfoLevel.SUCCESS,
              title: 'Success',
              message: `Sign-in method by ${signing.authProvider} removed successfully.`,
            }),
          ])
        );

        // 処理完了
        yield put(authActions.removeLink.done({ params: action.payload, result: true }));
      }
    } catch (err) {
      yield put(authActions.removeLink.failed({ params: action.payload, error: err }));
      const appError = AppErrorUtil.toAppError(err, {
        name: 'removeLink',
        stack: JSON.stringify(err),
        severity: isIAuthError(err) ? Severity.WARNING : Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: removeLink end.');
    }
  },

  updateEmail: function*(action: Action<string>): IterableIterator<any> {
    console.log('authSaga: updateEmail start.');
    try {
      const email = action.payload;
      const currentUser = fire.auth().currentUser;
      if (!email) {
        throw { code: 'email not set', message: 'email is empty.' };
      }
      if (!currentUser) {
        throw { code: 'user not signed in', message: 'this operation requires user to be signed in.' };
      }

      console.log(`updateEmail start`);

      const appInfos: IAppInfo[] = [];

      // Email 更新
      // ※以下の処理では、onAuthStateChanged イベントは発火されない
      yield currentUser.updateEmail(email);

      // Email 更新に成功した情報を一旦格納
      appInfos.push(
        AppInfoUtil.createAppInfo({
          level: InfoLevel.SUCCESS,
          title: 'Success',
          message: `Email changed successfully.`,
        })
      );

      // Email verify が必要な場合、メール送って一旦サインアウト
      // (※@gmailの場合でも必要)
      if (AUTH_EMAIL_VERIFICATION_REQUIRED) {
        console.log('sent a verification email.');
        yield currentUser.sendEmailVerification();

        // EmailVerification の送信に成功した情報を一旦格納
        appInfos.push(
          AppInfoUtil.createAppInfo({
            level: InfoLevel.INFO,
            title: 'Email verification required',
            message: 'We sent a email to your new account for verification. Check it and sign-in again.',
          })
        );

        // ※待つ必要ないのだが、ちょっと待ってからサインアウト
        yield call(delay, AUTH_RELOAD_TIMEOUT);
        yield fire.auth().signOut();
      } else {
        // AUTH_EMAIL_VERIFICATION_REQUIRED ではなくても
        // AUTH_SEND_EMAIL_VERIFICATION_WHEN_EMAIL_UPDATED であった場合、
        // sendEmailVerification() をして、一応 verify しておくよう促す(emailVerified が false となるため)
        if (AUTH_SEND_EMAIL_VERIFICATION_AT_EMAIL_UPDATED) {
          console.log('sent a verification email.');
          yield currentUser.sendEmailVerification();

          // EmailVerification の送信に成功した情報を一旦格納
          appInfos.push(
            AppInfoUtil.createAppInfo({
              level: InfoLevel.WARNING,
              title: 'Sent email verification',
              message: 'We sent a email to your new account for verification. Check it(STRONGLY RECOMMEND).',
            })
          );
        }

        // Firebase 側と同期(更新内容がカレントユーザに反映されるまで多少時間がかかる)
        // 暫く待ってからカレントユーザを再取得し、store(redux) に認証情報を再セット
        const task = yield fork(authSaga.syncState, authActions.syncState.started(AUTH_RELOAD_TIMEOUT));
        yield join(task);
      }

      // 成功処理メッセージをセット
      yield put(appActions.pushInfos(appInfos));

      // 処理完了
      yield put(authActions.updateEmail.done({ params: action.payload, result: true }));
    } catch (err) {
      yield put(authActions.updateEmail.failed({ params: action.payload, error: err }));
      const appError = AppErrorUtil.toAppError(err, {
        name: 'updateEmail',
        stack: JSON.stringify(err),
        severity: isIAuthError(err) ? Severity.WARNING : Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: updateEmail end.');
    }
  },

  updateProfile: function*(action: Action<Profile>): IterableIterator<any> {
    console.log('authSaga: updateProfile start.');
    try {
      const profile = action.payload;
      const currentUser = fire.auth().currentUser;
      if (!profile) {
        throw { code: 'profile not set', message: 'profile is empty.' };
      }
      if (!currentUser) {
        console.log(`user not signed in`);
        throw { code: 'user not signed in', message: 'this operation requires user to be signed in.' };
      }

      console.log(`updateProfile start`);

      // プロフィール更新
      // ※以下の処理では、onAuthStateChanged イベントは発火されない
      yield currentUser.updateProfile(profile);

      // Firebase 側と同期(更新内容がカレントユーザに反映されるまで多少時間がかかる)
      // 暫く待ってからカレントユーザを再取得し、store(redux) に認証情報を再セット
      const task = yield fork(authSaga.syncState, authActions.syncState.started(AUTH_RELOAD_TIMEOUT));
      yield join(task);

      // 成功時のメッセージ
      yield put(
        appActions.pushInfos([
          AppInfoUtil.createAppInfo({
            level: InfoLevel.SUCCESS,
            title: 'Success',
            message: 'Profile changed successfully.',
          }),
        ])
      );

      // 処理完了
      yield put(authActions.updateProfile.done({ params: action.payload, result: true }));
    } catch (err) {
      yield put(authActions.updateProfile.failed({ params: action.payload, error: err }));
      const appError = AppErrorUtil.toAppError(err, {
        name: 'updateProfile',
        stack: JSON.stringify(err),
        severity: isIAuthError(err) ? Severity.WARNING : Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: updateProfile end.');
    }
  },

  updatePassword: function*(action: Action<string>): IterableIterator<any> {
    console.log('authSaga: updatePassword start.');
    try {
      const password = action.payload;
      const currentUser = fire.auth().currentUser;
      if (!password) {
        throw { code: 'password not set', message: 'password is empty.' };
      }
      if (!currentUser) {
        console.log(`user not signed in`);
        throw { code: 'user not signed in', message: 'this operation requires user to be signed in.' };
      }
      console.log(`updatePassword start`);

      // パスワード変更
      // ※以下の処理では、onAuthStateChanged イベントは発火されない
      yield currentUser.updatePassword(password);

      // Firebase 側と同期(更新内容がカレントユーザに反映されるまで多少時間がかかる)
      // 暫く待ってからカレントユーザを再取得し、store(redux) に認証情報を再セット
      const task = yield fork(authSaga.syncState, authActions.syncState.started(AUTH_RELOAD_TIMEOUT));
      yield join(task);

      // 成功時のメッセージ
      yield put(
        appActions.pushInfos([
          AppInfoUtil.createAppInfo({
            level: InfoLevel.SUCCESS,
            title: 'Success',
            message: `Password changed successfully.`,
          }),
        ])
      );

      // 処理完了
      yield put(authActions.updatePassword.done({ params: action.payload, result: true }));
    } catch (err) {
      yield put(authActions.updatePassword.failed({ params: action.payload, error: err }));
      const appError = AppErrorUtil.toAppError(err, {
        name: 'updatePassword',
        stack: JSON.stringify(err),
        severity: isIAuthError(err) ? Severity.WARNING : Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: updatePassword end.');
    }
  },

  sendPasswordResetEmail: function*(action: Action<string>): IterableIterator<any> {
    console.log('authSaga: sendPasswordResetEmail start.');
    try {
      const email = action.payload;
      if (!email) {
        throw { code: 'email not set', message: 'email is empty.' };
      }

      console.log(`sendPasswordResetEmail start`);

      // パスワード変更メール送信
      try {
        yield fire.auth().sendPasswordResetEmail(email);
      } catch (err) {
        if (
          isIAuthError(err) &&
          err.code === 'auth/user-not-found' &&
          !AUTH_SHOW_USER_NOT_FOUND_AT_SEND_PASSWORD_RESET_EMAIL
        ) {
          // 握りつぶす
          console.log('crushsing exception');
        } else {
          throw err;
        }
      }

      // 成功時のメッセージ
      yield put(
        appActions.pushInfos([
          AppInfoUtil.createAppInfo({
            level: InfoLevel.INFO,
            title: 'Done',
            message: `Sent password reset email to ${email}${
              !AUTH_SHOW_USER_NOT_FOUND_AT_SEND_PASSWORD_RESET_EMAIL ? '(if account exists)' : ''
            }.`,
          }),
        ])
      );

      // 処理完了
      yield put(authActions.sendPasswordResetEmail.done({ params: action.payload, result: true }));
    } catch (err) {
      yield put(authActions.sendPasswordResetEmail.failed({ params: action.payload, error: err }));
      const appError = AppErrorUtil.toAppError(err, {
        name: 'sendPasswordResetEmail',
        stack: JSON.stringify(err),
        severity: isIAuthError(err) ? Severity.WARNING : Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: sendPasswordResetEmail end.');
    }
  },

  withdraw: function*(action: Action<undefined>): IterableIterator<any> {
    console.log('authSaga: withdraw start.');
    try {
      const currentUser = fire.auth().currentUser;
      if (!currentUser) {
        console.log(`user not signed in`);
        throw { code: 'user not signed in', message: 'this operation requires user to be signed in.' };
      }

      console.log(`withdraw start`);

      // ユーザ削除
      // ※以下の処理では、onAuthStateChanged イベントは発火される
      yield currentUser.delete();

      // 成功時のメッセージ
      yield put(
        appActions.pushInfos([
          AppInfoUtil.createAppInfo({
            level: InfoLevel.SUCCESS,
            title: 'Success',
            message: `Account deleted successfully.`,
          }),
        ])
      );

      // 処理完了
      yield put(authActions.withdraw.done({ params: action.payload, result: true }));
    } catch (err) {
      yield put(authActions.withdraw.failed({ params: action.payload, error: err }));
      const appError = AppErrorUtil.toAppError(err, {
        name: 'withdraw',
        stack: JSON.stringify(err),
        severity: isIAuthError(err) ? Severity.WARNING : Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: withdraw end.');
    }
  },
};
export default authSaga;
