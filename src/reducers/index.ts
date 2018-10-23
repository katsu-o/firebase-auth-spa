import { combineReducers } from 'redux';
import app from './app';
import auth from './auth';

// tslint:disable object-shorthand-properties-first
const reducers = combineReducers({
  app,
  auth,
});

export { IAppState } from './app';
export { IAuthState } from './auth';
export default reducers;
