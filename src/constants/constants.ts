// ペンディング認証情報をセッションストレージに格納する際のキー
export const AUTH_PENDING_INFO_KEY: string = 'auth-pending-info';

// 強制サインアウト実行判定情報をセッションストレージに格納する際のキー
export const AUTH_FORCE_SIGN_OUT_KEY: string = 'auth-forece-sign-out';

// サインイン継続中判定情報をセッションストレージに格納する際のキー
export const AUTH_ONGOING_SIGN_IN_KEY: string = 'auth-ongoing-sign-in';

// 認証状況判定用エラーコード
export const ERROR_CODE = {
  AUTH_ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL: 'auth/account-exists-with-different-credential',
  AUTH_EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
};

// パスワードリトライ
export const MAX_PASSWORD_RETRY_COUNT: number = 3;
