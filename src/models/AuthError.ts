export interface IAuthError extends firebase.auth.Error {}
export type AuthError = IAuthError | null;
export const isIAuthError = (obj: any): obj is IAuthError => {
  return 'code' in obj && 'message' in obj;
};
