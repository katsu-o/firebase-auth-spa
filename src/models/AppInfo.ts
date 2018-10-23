import { InfoLevel } from './InfoLevel';

export interface IAppInfo {
  level: InfoLevel;
  title: string;
  message: string;
}
export type AppInfo = IAppInfo | null;
