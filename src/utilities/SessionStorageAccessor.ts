import { AUTH_PENDING_INFO_KEY, AUTH_FORCE_SIGN_OUT_KEY, AUTH_ONGOING_SIGN_IN_KEY } from '../constants/constants';

export default class SessionStorageAccessor {
  public static getAuthPendingInfo(): {
    email: string;
    password?: string;
    credential: firebase.auth.AuthCredential;
  } | null {
    const json = sessionStorage.getItem(AUTH_PENDING_INFO_KEY);
    return json ? JSON.parse(json) : null;
  }

  public static setAuthPendingInfo(
    value: {
      email: string;
      password?: string;
      credential: firebase.auth.AuthCredential;
    } | null
  ) {
    if (value !== null) {
      sessionStorage.setItem(AUTH_PENDING_INFO_KEY, JSON.stringify(value));
    } else {
      sessionStorage.removeItem(AUTH_PENDING_INFO_KEY);
    }
  }

  public static getForceSignOut(): boolean {
    const json = sessionStorage.getItem(AUTH_FORCE_SIGN_OUT_KEY);
    return json ? JSON.parse(json) === true : false;
  }
  public static setForceSignOut(value: boolean) {
    if (value) {
      sessionStorage.setItem(AUTH_FORCE_SIGN_OUT_KEY, JSON.stringify(value));
    } else {
      sessionStorage.removeItem(AUTH_FORCE_SIGN_OUT_KEY);
      // remove OngoingSignIn together
      sessionStorage.removeItem(AUTH_ONGOING_SIGN_IN_KEY);
    }
  }

  public static getOngoingSignIn(): boolean {
    const json = sessionStorage.getItem(AUTH_ONGOING_SIGN_IN_KEY);
    return json ? JSON.parse(json) === true : false;
  }
  public static setOngoingSignIn(value: boolean) {
    if (value) {
      sessionStorage.setItem(AUTH_ONGOING_SIGN_IN_KEY, JSON.stringify(value));
    } else {
      sessionStorage.removeItem(AUTH_ONGOING_SIGN_IN_KEY);
    }
  }
}
