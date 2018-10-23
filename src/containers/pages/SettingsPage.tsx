import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Theme, createStyles, withStyles, WithStyles, Grid, Button, Divider } from '@material-ui/core';
import { Sync as SyncIcon } from '@material-ui/icons';
import withRoot from '../../utilities/withRoot';
import { createDefaultStyles } from '../../utilities/styles';
import { authActions } from '../../actions';
import { IAuthState } from '../../reducers';
import { ISigningInfo } from '../../models/SigningInfo';
import { IProfile } from '../../models/Profile';
import { toProviderIds } from '../../models/UserInfo';
import { AuthProvider, toAuthProvider } from '../../models/AuthProvider';
import { AUTH_AVAILABLE_PROVIDERS } from '../../constants/constants';
import UserIdentityForm from '../../components/UserIdentityForm';
import UserProfileForm from '../../components/UserProfileForm';
import UserLinkProviderForm from '../../components/UserLinkProviderForm';
import UserPasswordForm from '../../components/UserPasswordForm';
import UserWithdrawalForm from '../../components/UserWithdrawalForm';

const styles = (theme: Theme) => {
  return {
    ...createDefaultStyles(theme),
    ...createStyles({
      button: {
        margin: theme.spacing.unit,
        textTransform: 'none',
      },
      buttonIcon: {
        verticalAlign: 'middle',
        marginRight: theme.spacing.unit,
      },
      divider: {
        marginTop: theme.spacing.unit * 0,
      },
    }),
  };
};

// props from parent
interface IOwnProps extends WithStyles<typeof styles>, RouteComponentProps<{}> {}

// props of this component extracted from Store
interface IStateProps {
  auth: IAuthState;
}

// props set to Dispatcher
interface IDispatchProps {
  actions: {
    syncState: (timeout?: number) => void;
    updateEmail: (email: string) => void;
    updateProfile: (profile: IProfile) => void;
    addLink: (signing: ISigningInfo) => void;
    removeLink: (signing: ISigningInfo) => void;
    updatePassword: (password: string) => void;
    withdraw: () => void;
  };
}

// entire props of this component
type Props = IStateProps & IDispatchProps & IOwnProps;

// local state of this component
interface State {}

const mapStateToProps = (state: IStateProps, ownProps: IOwnProps): IStateProps => ({ auth: state.auth });

const mapDispatchToProps = (dispatch: Redux.Dispatch, ownProps: IOwnProps): IDispatchProps => {
  return {
    actions: {
      syncState: (timeout?: number) => dispatch(authActions.syncState.started(timeout)),
      updateEmail: (email: string) => dispatch(authActions.updateEmail.started(email)),
      updateProfile: (profile: IProfile) => dispatch(authActions.updateProfile.started(profile)),
      addLink: (signing: ISigningInfo) => dispatch(authActions.addLink.started(signing)),
      removeLink: (signing: ISigningInfo) => dispatch(authActions.removeLink.started(signing)),
      updatePassword: (password: string) => dispatch(authActions.updatePassword.started(password)),
      withdraw: () => dispatch(authActions.withdraw.started()),
    },
  };
};

// 使用するプロバイダ
const PROVIDERS = ['Password', 'Google'].concat(AUTH_AVAILABLE_PROVIDERS) as AuthProvider[];

class SettingsPage extends React.Component<Props, State> {
  public state: State = {};

  public render() {
    const { classes, auth } = this.props;
    const enabled = Boolean(auth.user);
    const hasPasswordAuth =
      auth && auth.user && auth.user.providerData
        ? toProviderIds(auth.user.providerData).some(providerId => toAuthProvider(providerId) === 'Password')
        : false;

    return (
      <div className={this.props.classes.root}>
        <Grid container={true} direction="row" justify="flex-end" alignItems="center">
          <Grid item={true}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={this.handleSync}
              disabled={!enabled}
            >
              <SyncIcon className={classes.buttonIcon} />
              Reload
            </Button>
          </Grid>
        </Grid>
        <UserIdentityForm
          authenticatedUser={auth.user}
          authenticatedUserTimestamp={auth.timestamp}
          onUpdateEmail={this.handleUpdateEmail}
          submitting={auth.submitting}
          disabled={!enabled}
        />
        <Divider className={classes.divider} />
        <UserProfileForm
          authenticatedUser={auth.user}
          authenticatedUserTimestamp={auth.timestamp}
          onUpdateProfile={this.handleUpdateProfile}
          submitting={auth.submitting}
          disabled={!enabled}
        />
        <Divider className={classes.divider} />
        <UserLinkProviderForm
          authenticatedUser={auth.user}
          authenticatedUserTimestamp={auth.timestamp}
          onAddLink={this.handleAddLink}
          onRemoveLink={this.handleRemoveLink}
          authProviders={PROVIDERS}
          submitting={auth.submitting}
          disabled={!enabled}
        />
        <Divider className={classes.divider} />
        <UserPasswordForm
          authenticatedUser={auth.user}
          authenticatedUserTimestamp={auth.timestamp}
          onUpdatePassword={this.handleUpdatePassword}
          submitting={auth.submitting}
          disabled={!enabled || !hasPasswordAuth}
        />
        <Divider className={classes.divider} />
        <UserWithdrawalForm
          authenticatedUser={auth.user}
          authenticatedUserTimestamp={auth.timestamp}
          onWithdraw={this.handleWithdraw}
          submitting={auth.submitting}
          disabled={!enabled}
        />
      </div>
    );
  }

  private handleSync = (e: React.MouseEvent) => {
    this.props.actions.syncState();
  };

  private handleUpdateEmail = (email: string) => {
    this.props.actions.updateEmail(email);
  };

  private handleUpdateProfile = (profile: IProfile) => {
    this.props.actions.updateProfile(profile);
  };

  private handleAddLink = (signing: ISigningInfo) => {
    this.props.actions.addLink(signing);
  };

  private handleRemoveLink = (signing: ISigningInfo) => {
    this.props.actions.removeLink(signing);
  };

  private handleUpdatePassword = (password: string) => {
    this.props.actions.updatePassword(password);
  };

  private handleWithdraw = () => {
    this.props.actions.withdraw();
  };
}

export default withRouter(
  withRoot(
    withStyles(styles)(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(SettingsPage)
    )
  )
);
