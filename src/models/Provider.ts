export type Provider = 'Unknown' | 'Password' | 'Google' | 'GitHub' | 'Facebook' | 'Twitter';
export const isProvider = (obj: any): obj is Provider => {
  return (
    'Unknown' === obj ||
    'Password' === obj ||
    'Google' === obj ||
    'GitHub' === obj ||
    'Facebook' === obj ||
    'Twitter' === obj
  );
};
export const toProvider = (providerId: string): Provider => {
  let provider: Provider;
  switch (providerId) {
    case 'password': {
      provider = 'Password';
      break;
    }
    case 'google.com': {
      provider = 'Google';
      break;
    }
    case 'github.com': {
      provider = 'GitHub';
      break;
    }
    case 'facebook.com': {
      provider = 'Facebook';
      break;
    }
    case 'twitter.com': {
      provider = 'Twitter';
      break;
    }
    default:
      provider = 'Unknown';
      break;
  }
  return provider;
};
