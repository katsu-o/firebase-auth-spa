export type AuthProvider = 'Unknown' | 'Password' | 'Google' | 'GitHub' | 'Facebook' | 'Twitter';
export const isAuthProvider = (obj: any): obj is AuthProvider => {
  return (
    'Unknown' === obj ||
    'Password' === obj ||
    'Google' === obj ||
    'GitHub' === obj ||
    'Facebook' === obj ||
    'Twitter' === obj
  );
};
export const toAuthProvider = (authProviderId: string): AuthProvider => {
  let authProvider: AuthProvider;
  switch (authProviderId) {
    case 'password': {
      authProvider = 'Password';
      break;
    }
    case 'google.com': {
      authProvider = 'Google';
      break;
    }
    case 'github.com': {
      authProvider = 'GitHub';
      break;
    }
    case 'facebook.com': {
      authProvider = 'Facebook';
      break;
    }
    case 'twitter.com': {
      authProvider = 'Twitter';
      break;
    }
    default:
      authProvider = 'Unknown';
      break;
  }
  return authProvider;
};
export const toAuthProviderId = (authProvider: AuthProvider): string => {
  let authProviderId: string;
  switch (authProvider) {
    case 'Password': {
      authProviderId = 'password';
      break;
    }
    case 'Google': {
      authProviderId = 'google.com';
      break;
    }
    case 'GitHub': {
      authProviderId = 'github.com';
      break;
    }
    case 'Facebook': {
      authProviderId = 'facebook.com';
      break;
    }
    case 'Twitter': {
      authProviderId = 'twitter.com';
      break;
    }
    default:
      authProviderId = 'unknown';
      break;
  }
  return authProviderId;
};
