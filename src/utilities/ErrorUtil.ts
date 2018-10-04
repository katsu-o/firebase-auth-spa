import { IAppError } from '../models/AppError';
import { isIAuthError } from '../models/AuthError';
import { Severity } from '../models/Severity';

export default class ErrorUtil {
  public static createAppError = (
    obj: { code: string; message: string; name?: string; stack?: string },
    severity: Severity = Severity.WARNING
  ): IAppError => {
    const appError: IAppError = {
      code: obj.code,
      message: obj.message,
      name: obj.name || '',
      stack: obj.stack,
      severity: severity,
    };
    return appError;
  };

  public static toAppError = (
    error: any,
    option?: { name?: string; stack?: string; severity?: Severity }
  ): IAppError => {
    const code = isIAuthError(error) ? error.code : 'unknown';
    const message = isIAuthError(error) ? error.message : 'unexpected error occurred.';
    const appError: IAppError = ErrorUtil.createAppError(
      {
        code: code,
        message: message,
        name: option && option.name ? option.name : '',
        stack: option && option.stack ? option.stack : '',
      },
      option && option.severity ? option.severity : undefined
    );
    return appError;
  };
}
