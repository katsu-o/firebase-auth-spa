import { AUTH_ACTION_KEY } from '../constants/constants';

export type AuthAction = 'SignUp' | 'SignIn' | 'AddLink';
export default class SessionStorageAccessor {
  public static getAuthAction(): {
    action: AuthAction;
    provider: string;
  } | null {
    const json = sessionStorage.getItem(AUTH_ACTION_KEY);
    return json ? JSON.parse(json) : null;
  }
  public static setAuthAction(
    value: {
      action: AuthAction;
      provider: string;
    } | null
  ) {
    if (value !== null) {
      sessionStorage.setItem(AUTH_ACTION_KEY, JSON.stringify(value));
    } else {
      sessionStorage.removeItem(AUTH_ACTION_KEY);
    }
  }
}
