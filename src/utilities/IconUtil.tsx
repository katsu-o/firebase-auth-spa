import * as React from 'react';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import {
  Email as EmailIcon,
  Google as GoogleIcon,
  FacebookBox as FacebookIcon,
  GithubCircle as GitHubIcon,
  Twitter as TwitterIcon,
  Help as UnknownIcon,
} from 'mdi-material-ui';
import { AuthProvider, isAuthProvider, toAuthProvider } from '../models/AuthProvider';

export default class IconUtil {
  public static getAuthProviderIcon = (authProvider: AuthProvider): React.ComponentType<SvgIconProps> => {
    let icon;
    switch (authProvider) {
      case 'Password': {
        icon = EmailIcon;
        break;
      }
      case 'Google': {
        icon = GoogleIcon;
        break;
      }
      case 'Facebook': {
        icon = FacebookIcon;
        break;
      }
      case 'Twitter': {
        icon = TwitterIcon;
        break;
      }
      case 'GitHub': {
        icon = GitHubIcon;
        break;
      }
      case 'Unknown':
      default: {
        icon = UnknownIcon;
        break;
      }
    }
    return icon;
  };
  public static renderAuthProviderIcon = (provider: AuthProvider | string, iconProps?: any): JSX.Element => {
    const p = isAuthProvider(provider) ? provider : toAuthProvider(provider);
    const ProviderIcon: React.ComponentType<SvgIconProps> = IconUtil.getAuthProviderIcon(p);
    return <ProviderIcon {...iconProps} />;
  };
}
