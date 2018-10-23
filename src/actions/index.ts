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
import { AppInfo } from '../models/AppInfo';
import { SigningInfo } from '../models/SigningInfo';
import { Profile } from '../models/Profile';
import { UserInfo } from '../models/UserInfo';

const actionCreator = actionCreatorFactory();

export enum ActionTypes {
  APP_INITIALIZE = 'APP/INITIALIZE',
  APP_PUSH_ERRORS = 'APP/PUSH_ERRORS',
  APP_CLEAR_ERRORS = 'APP/CLEAR_ERRORS',
  APP_PUSH_INFOS = 'APP/PUSH_INFOS',
  APP_CLEAR_INFOS = 'APP/CLEAR_INFOS',

  AUTH_SIGN_UP = 'AUTH/SIGN_UP',
  AUTH_SIGN_IN = 'AUTH/SIGN_IN',
  AUTH_SIGN_OUT = 'AUTH/SIGN_OUT',
  AUTH_SYNC_STATE = 'AUTH/SYNC_STATE',

  AUTH_ADD_LINK = 'AUTH/ADD_LINK',
  AUTH_REMOVE_LINK = 'AUTH/REMOVE_LINK',
  AUTH_UPDATE_EMAIL = 'AUTH/UPDATE_EMAIL',
  AUTH_UPDATE_PROFILE = 'AUTH/UPDATE_PROFILE',
  AUTH_UPDATE_PASSWORD = 'AUTH/UPDATE_PASSWORD',
  AUTH_SEND_PASSWORD_RESET_EMAIL = 'AUTH/SEND_PASSWORD_RESET_EMAIL',
  AUTH_WITHDRAW = 'AUTH/WITHDRAW',

  AUTH_STATE_CHANGED = 'AUTH/STATE_CHANGED',
  AUTH_INITIALIZE = 'AUTH/INITIALIZE',
}

// app
export const appActions = {
  initialize: actionCreator(ActionTypes.APP_INITIALIZE),
  pushErrors: actionCreator<AppError[]>(ActionTypes.APP_PUSH_ERRORS),
  clearErrors: actionCreator(ActionTypes.APP_CLEAR_ERRORS),
  pushInfos: actionCreator<AppInfo[]>(ActionTypes.APP_PUSH_INFOS),
  clearInfos: actionCreator(ActionTypes.APP_CLEAR_INFOS),
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

  syncState: actionCreator.async<number | undefined, boolean, any>(ActionTypes.AUTH_SYNC_STATE),

  addLink: actionCreator.async<SigningInfo, boolean, any>(ActionTypes.AUTH_ADD_LINK),

  removeLink: actionCreator.async<SigningInfo, boolean, any>(ActionTypes.AUTH_REMOVE_LINK),

  updateEmail: actionCreator.async<string, boolean, any>(ActionTypes.AUTH_UPDATE_EMAIL),

  updateProfile: actionCreator.async<Profile, boolean, any>(ActionTypes.AUTH_UPDATE_PROFILE),

  updatePassword: actionCreator.async<string, boolean, any>(ActionTypes.AUTH_UPDATE_PASSWORD),

  sendPasswordResetEmail: actionCreator.async<string, boolean, any>(ActionTypes.AUTH_SEND_PASSWORD_RESET_EMAIL),

  withdraw: actionCreator.async<undefined, boolean, any>(ActionTypes.AUTH_WITHDRAW),

  stateChanged: actionCreator<UserInfo>(ActionTypes.AUTH_STATE_CHANGED),

  initialize: actionCreator(ActionTypes.AUTH_INITIALIZE),
};
