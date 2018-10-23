import { ActionCreator } from 'typescript-fsa'; // Note: not from 'redux'
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { authActions } from '../actions';
import { UserInfo } from '../models/UserInfo';

export interface IAuthState {
  user: UserInfo;
  submitting: boolean;
  timestamp: number;
}
const INITIAL_AUTH_STATE: IAuthState = {
  user: null,
  submitting: true,
  timestamp: 0,
};

// async:
//   signUp, signIn, signOut, (syncState),
//   addLink, removeLink, updateEmail, updateProfile, updatePassword,
//   sendPasswordResetEmail, withDraw
// sync:
//   stateChanged, initialize
export const reducer = reducerWithInitialState(INITIAL_AUTH_STATE)
  .cases(
    [
      authActions.signUp.started as ActionCreator<any>,
      authActions.signIn.started as ActionCreator<any>,
      authActions.signOut.started as ActionCreator<any>,
      authActions.addLink.started as ActionCreator<any>,
      authActions.removeLink.started as ActionCreator<any>,
      authActions.updateEmail.started as ActionCreator<any>,
      authActions.updateProfile.started as ActionCreator<any>,
      authActions.updatePassword.started as ActionCreator<any>,
      authActions.sendPasswordResetEmail.started as ActionCreator<any>,
      authActions.withdraw.started as ActionCreator<any>,
    ],
    (state, action) => {
      return { ...state, submitting: true };
    }
  )
  .cases(
    [
      authActions.signUp.done as ActionCreator<any>,
      authActions.signUp.failed as ActionCreator<any>,
      authActions.signIn.done as ActionCreator<any>,
      authActions.signIn.failed as ActionCreator<any>,
      authActions.signOut.done as ActionCreator<any>,
      authActions.signOut.failed as ActionCreator<any>,
      authActions.addLink.done as ActionCreator<any>,
      authActions.addLink.failed as ActionCreator<any>,
      authActions.removeLink.done as ActionCreator<any>,
      authActions.removeLink.failed as ActionCreator<any>,
      authActions.updateEmail.done as ActionCreator<any>,
      authActions.updateEmail.failed as ActionCreator<any>,
      authActions.updateProfile.done as ActionCreator<any>,
      authActions.updateProfile.failed as ActionCreator<any>,
      authActions.updatePassword.done as ActionCreator<any>,
      authActions.updatePassword.failed as ActionCreator<any>,
      authActions.sendPasswordResetEmail.done as ActionCreator<any>,
      authActions.sendPasswordResetEmail.failed as ActionCreator<any>,
      authActions.withdraw.done as ActionCreator<any>,
      authActions.withdraw.failed as ActionCreator<any>,
    ],
    (state, action) => {
      return { ...state, submitting: false };
    }
  )
  .cases(
    [
      /* substantially unnec. */
      // authActions.syncState.started as ActionCreator<any>,
      // authActions.syncState.done as ActionCreator<any>,
      // authActions.syncState.failed as ActionCreator<any>,
    ],
    (state, action) => {
      return { ...state };
    }
  )
  .caseWithAction(authActions.stateChanged, (state, action) => {
    return {
      ...state,
      user: action.payload,
      submitting: false,
      timestamp: Date.now(),
    };
  })
  .case(authActions.initialize, state => {
    return INITIAL_AUTH_STATE;
  });

export default reducer;
