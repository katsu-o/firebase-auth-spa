import { Action, Success, Failure } from 'typescript-fsa'; // Note: not from 'redux'
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { authActions } from '../actions';
import { SigningInfo } from '../models/SigningInfo';
import { UserInfo } from '../models/UserInfo';

export interface IAuthState {
  user: UserInfo;
  submitting: boolean;
}
const INITIAL_AUTH_STATE: IAuthState = {
  user: null,
  submitting: true,
};

export const reducer = reducerWithInitialState(INITIAL_AUTH_STATE)
  .caseWithAction(authActions.signUp.done, (state: IAuthState, action: Action<Success<SigningInfo, boolean>>) => {
    return { ...state, submitting: false };
  })
  .caseWithAction(authActions.signIn.done, (state: IAuthState, action: Action<Success<SigningInfo, boolean>>) => {
    return { ...state, submitting: false };
  })
  .caseWithAction(authActions.signOut.done, (state: IAuthState, action: Action<Success<undefined, boolean>>) => {
    return { ...state, submitting: false };
  })
  .caseWithAction(authActions.stateChanged, (state: IAuthState, action: Action<UserInfo>) => {
    return {
      ...state,
      user: action.payload,
      submitting: false,
    };
  })
  .casesWithAction(
    [authActions.signUp.started, authActions.signIn.started, authActions.signOut.started],
    (state: IAuthState, action: Action<SigningInfo>) => {
      return {
        ...state,
        submitting: true,
      };
    }
  )
  .casesWithAction(
    [authActions.signUp.failed, authActions.signIn.failed],
    (state: IAuthState, action: Action<Failure<SigningInfo, any>>) => {
      console.log(action.payload.error);
      return {
        ...state,
        submitting: false,
      };
    }
  )
  .casesWithAction([authActions.signOut.failed], (state: IAuthState, action: Action<Failure<undefined, any>>) => {
    console.log(action.payload.error);
    return {
      ...state,
      submitting: false,
    };
  })
  .caseWithAction(authActions.initialize, (state: IAuthState, action: Action<null>) => {
    return INITIAL_AUTH_STATE;
  });

export default reducer;
