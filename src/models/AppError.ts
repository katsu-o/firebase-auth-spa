import { Severity } from './Severity';

export interface IAppError {
  severity: Severity;
  code: string;
  message: string;
  name: string;
  stack?: string;
}
export type AppError = IAppError | null;
export const isIAppError = (obj: any): obj is IAppError => {
  return 'severity' in obj && 'code' in obj && 'message' in obj && 'name' in obj;
};
