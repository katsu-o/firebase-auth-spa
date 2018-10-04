import { IAuthError } from './AuthError';

export interface IPendingCredentialError extends IAuthError {
  email: string;
  credential: firebase.auth.AuthCredential;
}
export type PendingCredentialError = IPendingCredentialError | null;
export const isIPendingCredentialError = (obj: any): obj is IPendingCredentialError => {
  return 'code' in obj && 'message' in obj && 'email' in obj && 'credential' in obj;
};
