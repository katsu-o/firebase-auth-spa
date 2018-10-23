import { IAppInfo } from '../models/AppInfo';
import { InfoLevel } from '../models/InfoLevel';

export default class AppInfoUtil {
  public static createAppInfo = (obj: { level?: InfoLevel; title: string; message: string }): IAppInfo => {
    const appInfo: IAppInfo = {
      title: obj.title,
      message: obj.message,
      level: obj.level || InfoLevel.INFO,
    };
    return appInfo;
  };
}
