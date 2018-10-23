export interface ILinkInfo {
  email: string;
  password?: string;
  credential: firebase.auth.AuthCredential;
}
export type LinkInfo = ILinkInfo | null;
