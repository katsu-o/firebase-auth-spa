import { Action } from 'typescript-fsa';
import { put } from 'redux-saga/effects';
import fire, { authProviders } from '../Fire';
import { appActions, authActions } from '../actions';
import { SigningInfo } from '../models/SigningInfo';
import { isIAuthError } from '../models/AuthError';
import { Severity } from '../models/Severity';
import ErrorUtil from '../utilities/ErrorUtil';
import { linkToExistingAccount } from '../utilities/linkProvider';
import { ERROR_CODE } from '../constants/constants';

const authSaga = {
  signUp: function*(action: Action<SigningInfo>): IterableIterator<any> {
    console.log('authSaga: signUp start.');
    try {
      const signingInfo = action.payload;
      if (signingInfo) {
        try {
          const response = yield fire
            .auth()
            .createUserAndRetrieveDataWithEmailAndPassword(signingInfo.email, signingInfo.password);
          console.log(response);
          yield put(authActions.signUp.done({ params: action.payload, result: true }));
        } catch (err) {
          // Sign up しようとしたら、その email が既に存在した場合
          if (isIAuthError(err) && err.code === ERROR_CODE.AUTH_EMAIL_ALREADY_IN_USE) {
            console.log('signUp: target email already in use. start link process.');
            // 既存アカウントへのリンク処理を開始
            yield linkToExistingAccount(
              {
                ...err,
                email: signingInfo.email,
                password: signingInfo.password,
                credential: { providerId: 'password', signInMethod: 'password' },
              },
              appActions.pushErrors,
              appActions.clearErrors
            ).catch(err => {
              console.log(err);
              throw err;
            });
          }
        }
      }
    } catch (err) {
      yield put(authActions.signUp.failed({ params: action.payload, error: err }));
      const appError = ErrorUtil.toAppError(err, {
        name: 'signUp',
        stack: JSON.stringify(err),
        severity: Severity.FATAL,
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
      if (signing) {
        switch (signing.provider) {
          case 'Google':
          case 'Facebook':
          case 'Twitter':
          case 'GitHub': {
            console.log(`${signing.provider} sign-in start`);
            const authProvider = authProviders.get(signing.provider);
            if (!authProvider) {
              throw { code: 'not registered provider', message: `provider [${signing.provider}] is not registered.` };
            }
            yield fire.auth().signInWithRedirect(authProvider);
            break;
          }
          case 'Password':
          default: {
            console.log(`${signing.provider} sign-in start`);
            const response = yield fire.auth().signInWithEmailAndPassword(signing.email, signing.password);
            console.log(response);
            yield put(authActions.signUp.done({ params: action.payload, result: true }));
            break;
          }
        }
      }
    } catch (err) {
      yield put(authActions.signIn.failed({ params: action.payload, error: err }));
      const appError = ErrorUtil.toAppError(err, {
        name: 'signIn',
        stack: JSON.stringify(err),
        severity: Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: signIn end.');
    }
  },

  signOut: function*(action: Action<undefined>): IterableIterator<any> {
    console.log('authSaga: signOut start.');
    try {
      yield fire.auth().signOut();
      yield put(authActions.signOut.done({ params: action.payload, result: true }));
    } catch (err) {
      yield put(authActions.signOut.failed({ params: action.payload, error: err }));
      const appError = ErrorUtil.toAppError(err, {
        name: 'signOut',
        stack: JSON.stringify(err),
        severity: Severity.FATAL,
      });
      yield put(appActions.pushErrors([appError]));
    } finally {
      console.log('authSaga: signOut end.');
    }
  },
};
export default authSaga;
