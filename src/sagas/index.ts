import { takeEvery, takeLatest } from 'redux-saga/effects';
import { ActionTypes } from '../actions';
import appSaga from './app';
import authSaga from './auth';

export default function* rootSaga(): IterableIterator<any> {
  yield [
    takeLatest(ActionTypes.APP_INITIALIZE, appSaga.initialize),

    takeEvery(`${ActionTypes.AUTH_SIGN_UP}_STARTED`, authSaga.signUp),
    takeEvery(`${ActionTypes.AUTH_SIGN_IN}_STARTED`, authSaga.signIn),
    takeEvery(`${ActionTypes.AUTH_SIGN_OUT}_STARTED`, authSaga.signOut),
    takeEvery(`${ActionTypes.AUTH_SYNC_STATE}_STARTED`, authSaga.syncState),

    takeEvery(`${ActionTypes.AUTH_ADD_LINK}_STARTED`, authSaga.addLink),
    takeEvery(`${ActionTypes.AUTH_REMOVE_LINK}_STARTED`, authSaga.removeLink),
    takeEvery(`${ActionTypes.AUTH_UPDATE_EMAIL}_STARTED`, authSaga.updateEmail),
    takeEvery(`${ActionTypes.AUTH_UPDATE_PROFILE}_STARTED`, authSaga.updateProfile),
    takeEvery(`${ActionTypes.AUTH_UPDATE_PASSWORD}_STARTED`, authSaga.updatePassword),
    takeEvery(`${ActionTypes.AUTH_SEND_PASSWORD_RESET_EMAIL}_STARTED`, authSaga.sendPasswordResetEmail),
    takeEvery(`${ActionTypes.AUTH_WITHDRAW}_STARTED`, authSaga.withdraw),
  ];
}
