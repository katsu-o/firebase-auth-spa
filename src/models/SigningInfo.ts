import { Provider } from './Provider';

export interface ISigningInfo {
  email: string;
  password: string;
  provider: Provider | '';
}
export type SigningInfo = ISigningInfo | null;
