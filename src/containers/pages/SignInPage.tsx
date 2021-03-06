import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Theme, createStyles, withStyles, WithStyles } from '@material-ui/core';
import withRoot from '../../utilities/withRoot';
import { createDefaultStyles } from '../../utilities/styles';
import { authActions } from '../../actions';
import { AuthProvider } from '../../models/AuthProvider';
import { AUTH_AVAILABLE_PROVIDERS } from '../../constants/constants';
import { IAuthState } from '../../reducers';
import { SigningInfo } from '../../models/SigningInfo';
import PageName, { toPublicUrl } from '../../constants/PageName';
import SignInForm from '../../components/SignInForm';

const styles = (theme: Theme) => {
  return {
    ...createDefaultStyles(theme),
    ...createStyles({
      layout: {
        width: 'auto',
        display: 'block', // Fix IE11 issue.
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
          width: 400,
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      },
      button: {
        margin: theme.spacing.unit,
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
    signIn: (signing: SigningInfo) => void;
  };
}

// entire props of this component
type Props = IStateProps & IDispatchProps & IOwnProps;

// local state of this component
interface State {}

const mapStateToProps = (state: IStateProps, ownProps: IOwnProps): IStateProps => ({
  auth: state.auth,
});

const mapDispatchToProps = (dispatch: Redux.Dispatch, ownProps: IOwnProps): IDispatchProps => {
  return {
    actions: {
      signIn: (signing: SigningInfo) => dispatch(authActions.signIn.started(signing)),
    },
  };
};

// 使用するプロバイダ
const PROVIDERS = ['Password', 'Google'].concat(AUTH_AVAILABLE_PROVIDERS) as AuthProvider[];

class SignInPage extends React.Component<Props, State> {
  public state: State = {};

  public render() {
    const { classes, auth } = this.props;

    return (
      <div className={classes.root}>
        <main className={classes.layout}>
          <SignInForm
            authenticatedUser={auth.user}
            authenticatedUserTimestamp={auth.timestamp}
            onSignIn={this.handleSignIn}
            onGoPasswordReset={this.handleGoPasswordReset}
            onNavigateAfterSignedIn={this.handleGoHome}
            authProviders={PROVIDERS}
            submitting={auth.submitting}
          />
        </main>
      </div>
    );
  }

  private handleSignIn = (signing: SigningInfo) => {
    this.props.actions.signIn(signing);
  };

  private handleGoHome = () => {
    this.props.history.push(toPublicUrl(PageName.HOME));
  };

  private handleGoPasswordReset = () => {
    this.props.history.push(toPublicUrl(PageName.PASSWORDRESET));
  };
}

export default withRouter(
  withRoot(
    withStyles(styles)(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(SignInPage)
    )
  )
);
