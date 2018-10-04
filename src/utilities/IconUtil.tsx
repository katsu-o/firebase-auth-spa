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
import { Provider, isProvider, toProvider } from '../models/Provider';

export default class IconUtil {
  public static getProviderIcon = (provider: Provider): React.ComponentType<SvgIconProps> => {
    let icon;
    switch (provider) {
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
  public static renderProviderIcon = (provider: Provider | string, iconProps?: any): JSX.Element => {
    const p = isProvider(provider) ? provider : toProvider(provider);
    const ProviderIcon: React.ComponentType<SvgIconProps> = IconUtil.getProviderIcon(p);
    return <ProviderIcon {...iconProps} />;
  };
}
