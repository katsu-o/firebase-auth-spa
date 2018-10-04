import { Action } from 'typescript-fsa'; // Note: not from 'redux'
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { appActions } from '../actions';
import { AppError } from '../models/AppError';

export interface IAppState {
  errors: AppError[];
}
const INITIAL_APP_STATE: IAppState = {
  errors: [] as AppError[],
};

export const reducer = reducerWithInitialState(INITIAL_APP_STATE)
  .caseWithAction(appActions.clearErrors, (state: IAppState, action: Action<undefined>) => {
    return {
      ...state,
      errors: [],
    };
  })
  .caseWithAction(appActions.pushErrors, (state: IAppState, action: Action<AppError[]>) => {
    return {
      ...state,
      errors: state.errors.concat(action.payload),
    };
  })
  .caseWithAction(appActions.initialize, (state: IAppState, action: Action<undefined>) => {
    return INITIAL_APP_STATE;
  });

export default reducer;
