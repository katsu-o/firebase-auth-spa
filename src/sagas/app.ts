import { Action } from 'typescript-fsa';
import { put } from 'redux-saga/effects';
import { appActions, authActions } from '../actions';

const appSaga = {
  initialize: function*(action: Action<undefined>): IterableIterator<any> {
    yield put(authActions.initialize());
    yield put(appActions.clearErrors());
  },
  locationChange: function*(): IterableIterator<any> {
    yield put(appActions.clearErrors());
  },
};

export default appSaga;
