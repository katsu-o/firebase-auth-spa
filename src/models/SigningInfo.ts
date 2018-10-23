import { AuthProvider } from './AuthProvider';

export interface ISigningInfo {
  userName: string | null;
  email: string | null;
  password: string | null;
  authProvider: AuthProvider | null;
}
export type SigningInfo = ISigningInfo | null;
