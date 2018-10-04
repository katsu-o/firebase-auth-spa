export interface IUserInfo extends firebase.UserInfo {
  providerData: () => (firebase.UserInfo | null)[];
}
export type UserInfo = IUserInfo | null;

export const toProviderIds = (providerIds: (firebase.UserInfo | null)[]): string[] => {
  return providerIds
    .filter<firebase.UserInfo>((pd: firebase.UserInfo | null): pd is firebase.UserInfo => pd !== null)
    .map((pd: firebase.UserInfo) => {
      return pd.providerId;
    });
};
