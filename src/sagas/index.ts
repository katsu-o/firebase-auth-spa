import { takeEvery, takeLatest } from 'redux-saga/effects';
import { ActionTypes } from '../actions';
import appSaga from './app';
import authSaga from './auth';

export default function* rootSaga(): IterableIterator<any> {
  yield [
    takeLatest(ActionTypes.APP_INITIALIZE, appSaga.initialize),
    takeLatest('@@router/LOCATION_CHANGE', appSaga.locationChange),

    takeEvery(`${ActionTypes.AUTH_SIGN_UP}_STARTED`, authSaga.signUp),
    takeEvery(`${ActionTypes.AUTH_SIGN_IN}_STARTED`, authSaga.signIn),
    takeEvery(`${ActionTypes.AUTH_SIGN_OUT}_STARTED`, authSaga.signOut),
  ];
}
