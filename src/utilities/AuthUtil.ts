import { AuthProvider, toAuthProvider } from '../models/AuthProvider';
import { UserInfo, toProviderIds } from '../models/UserInfo';

export default class AuthUtil {
  public static getAuthProviderUserInfo = (authenticatedUser: UserInfo, authProvider: AuthProvider): UserInfo => {
    return (
      (authenticatedUser && authenticatedUser.providerData
        ? authenticatedUser.providerData.find(data => {
            return !!data && authProvider === toAuthProvider(data.providerId);
          })
        : null) || null
    );
  };

  public static isLinkedAuthProvider = (authenticatedUser: UserInfo, authProvider: AuthProvider): boolean => {
    let flag = false;
    if (authenticatedUser && authenticatedUser.providerData) {
      const linkedProviderIds = toProviderIds(authenticatedUser.providerData);
      flag = linkedProviderIds.some(linkedProviderId => toAuthProvider(linkedProviderId) === authProvider);
    } else {
      flag = false;
    }
    return flag;
  };
}
