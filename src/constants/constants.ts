// 認証アクション情報をセッションストレージに格納する際のキー
export const AUTH_ACTION_KEY = 'auth-action';

// 追加利用する認証プロバイダ
// Email & Password および Google は組み込み
// Facebook, Twitter, GitHub の追加選択設定(使わない場合は空配列)
export const AUTH_AVAILABLE_PROVIDERS = ['Facebook', 'Twitter', 'GitHub'];

// Firebase Authentication 更新系処理後に行う認証情報再取得待ち時間(ms)
export const AUTH_RELOAD_TIMEOUT = 2000;

// Email Verify の是非
export const AUTH_EMAIL_VERIFICATION_REQUIRED = false;

// @gmail.com への アカウント Email 変更時 Email Verify メール送信の是非
export const AUTH_SEND_EMAIL_VERIFICATION_AT_EMAIL_UPDATED = false;

// パスワードリセットメール送信時の user not found メッセージ表示の是非
export const AUTH_SHOW_USER_NOT_FOUND_AT_SEND_PASSWORD_RESET_EMAIL = true;
