import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  withStyles,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  MenuItem,
  Menu,
  Avatar,
  Divider,
  Theme,
  createStyles,
  Fade,
  WithStyles,
} from '@material-ui/core';
import { Menu as MenuIcon, AccountCircle as AccountCircleIcon } from '@material-ui/icons';
import withRoot from '../utilities/withRoot';
import PageName, { toPublicUrl } from '../constants/PageName';
import { authActions } from '../actions';
import { IAuthState } from '../reducers';
import { toProviderIds } from '../models/UserInfo';
import IconUtil from '../utilities/IconUtil';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    grow: {
      flexGrow: 1,
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20,
    },
    avatar: {
      margin: 0,
    },
    providerIcon: {
      verticalAlign: 'middle',
      marginRight: theme.spacing.unit,
    },
  });

// props from parent
interface IOwnProps extends WithStyles<typeof styles>, RouteComponentProps<{}> {}

// props of this component extracted from Store
interface IStateProps {
  auth: IAuthState;
}

// props set to Dispatcher
interface IDispatchProps {
  actions: {
    signOut: () => void;
  };
}

// entire props of this component
type Props = IStateProps & IDispatchProps & IOwnProps;

// local state of this component
interface State {
  anchorElAccountMenu: HTMLElement | null | undefined;
  anchorElGlobalMenu: HTMLElement | null | undefined;
}

const mapStateToProps = (state: IStateProps, ownProps: IOwnProps): IStateProps => ({
  auth: state.auth,
});

const mapDispatchToProps = (dispatch: Redux.Dispatch, ownProps: IOwnProps): IDispatchProps => {
  return {
    actions: {
      signOut: () => dispatch(authActions.signOut.started()),
    },
  };
};

class ApplicationBar extends React.Component<Props, State> {
  public state: State = {
    anchorElAccountMenu: null,
    anchorElGlobalMenu: null,
  };

  public render() {
    const { classes, auth } = this.props;
    const { anchorElAccountMenu, anchorElGlobalMenu } = this.state;
    const openAccountMenu = Boolean(anchorElAccountMenu);
    const openGlobalMenu = Boolean(anchorElGlobalMenu);
    const authenticatedUser = auth.user;
    const authenticated = Boolean(authenticatedUser);
    return (
      <div className={classes.root}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={this.handleGoTop}>
              <Avatar className={classes.avatar}>K</Avatar>
            </IconButton>
            <Typography variant="title" color="inherit" className={classes.grow}>
              SPA Auth
            </Typography>
            <Fade in={authenticated}>
              <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                <IconButton
                  aria-owns={open ? 'menu-appbar' : undefined}
                  aria-haspopup="true"
                  onClick={this.handleOpenAccountMenu}
                  color="inherit"
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElAccountMenu}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={openAccountMenu}
                  onClose={this.handleCloseAccountMenu}
                >
                  <MenuItem disabled={true}>
                    {authenticated &&
                      auth.user &&
                      toProviderIds(auth.user.providerData()).map(providerId => {
                        return IconUtil.renderProviderIcon(providerId, {
                          className: classes.providerIcon,
                          key: `id-${providerId}`,
                        });
                      })}
                    {authenticatedUser && authenticatedUser.email}
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={this.handleGoHome}>Your home</MenuItem>
                  <MenuItem disabled={true}>Your profile</MenuItem>
                  <MenuItem disabled={true}>Setting</MenuItem>
                  <Divider />
                  <MenuItem onClick={this.handleDoSignOut}>Sign out</MenuItem>
                </Menu>
              </div>
            </Fade>
            <div>
              <IconButton
                aria-owns={open ? 'menu-appbar' : undefined}
                aria-haspopup="true"
                onClick={this.handleOpenGlobalMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElGlobalMenu}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={openGlobalMenu}
                onClose={this.handleCloseGlobalMenu}
              >
                <MenuItem onClick={this.handleGoTop}>Top page</MenuItem>
                <Divider />
                <MenuItem onClick={this.handleGoSignIn}>Sign in or Sign up</MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }

  private handleOpenAccountMenu = (event: React.MouseEvent) => {
    this.setState({ ...this.state, anchorElAccountMenu: event.currentTarget as HTMLElement });
  };

  private handleOpenGlobalMenu = (event: React.MouseEvent) => {
    this.setState({ ...this.state, anchorElGlobalMenu: event.currentTarget as HTMLElement });
  };

  private handleCloseAccountMenu = (event: React.SyntheticEvent) => {
    this.setState({ ...this.state, anchorElAccountMenu: null });
  };
  private handleCloseGlobalMenu = (event: React.SyntheticEvent) => {
    this.setState({ ...this.state, anchorElGlobalMenu: null });
  };

  private handleGoTop = (event: React.MouseEvent) => {
    // Brand, Global
    this.setState({ ...this.state, anchorElGlobalMenu: null });
    this.props.history.push(toPublicUrl(PageName.TOP));
  };

  private handleGoHome = (event: React.MouseEvent) => {
    // Account
    this.setState({ ...this.state, anchorElAccountMenu: null });
    this.props.history.push(toPublicUrl(PageName.HOME));
  };

  private handleGoSignIn = (event: React.MouseEvent) => {
    // Global
    this.setState({ ...this.state, anchorElGlobalMenu: null });
    this.props.history.push(toPublicUrl(PageName.SIGNIN));
  };

  private handleDoSignOut = (event: React.MouseEvent) => {
    // Account
    this.setState({ ...this.state, anchorElAccountMenu: null });
    this.props.actions.signOut();
  };
}

export default withRouter(
  withRoot(
    withStyles(styles)(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(ApplicationBar)
    )
  )
);
