/**
 * flux-standard-action
 * {
 *   type: FOO_TYPE,                          // must
 *   payload: {object},                       // optional
 *   meta: {object},                          // optional
 *   error: false, true, undefined, null, ... // optional
 * }
 */
import actionCreatorFactory from 'typescript-fsa';
import { AppError } from '../models/AppError';
import { SigningInfo } from '../models/SigningInfo';
import { UserInfo } from '../models/UserInfo';

const actionCreator = actionCreatorFactory();

export enum ActionTypes {
  APP_INITIALIZE = 'APP/INITIALIZE',
  APP_PUSH_ERRORS = 'APP/PUSH_ERRORS',
  APP_CLEAR_ERRORS = 'APP/CLEAR_ERRORS',

  AUTH_SIGN_UP = 'AUTH/SIGN_UP',
  AUTH_SIGN_IN = 'AUTH/SIGN_IN',
  AUTH_SIGN_OUT = 'AUTH/SIGN_OUT',
  AUTH_STATE_CHANGED = 'AUTH/STATE_CHANGED',
  AUTH_INITIALIZE = 'AUTH/INITIALIZE',
}

// app
export const appActions = {
  initialize: actionCreator(ActionTypes.APP_INITIALIZE),
  pushErrors: actionCreator<AppError[]>(ActionTypes.APP_PUSH_ERRORS),
  clearErrors: actionCreator(ActionTypes.APP_CLEAR_ERRORS),
};

// auth
export const authActions = {
  signUp: actionCreator.async<
    SigningInfo, // parameter type
    boolean, // success type
    any // error type
  >(ActionTypes.AUTH_SIGN_UP),

  signIn: actionCreator.async<SigningInfo, boolean, any>(ActionTypes.AUTH_SIGN_IN),

  signOut: actionCreator.async<undefined, boolean, any>(ActionTypes.AUTH_SIGN_OUT),

  stateChanged: actionCreator<UserInfo>(ActionTypes.AUTH_STATE_CHANGED),

  initialize: actionCreator(ActionTypes.AUTH_INITIALIZE),
};
