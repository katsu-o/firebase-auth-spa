import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Theme, createStyles, withStyles, WithStyles } from '@material-ui/core';
import withRoot from '../../utilities/withRoot';
import { createDefaultStyles } from '../../utilities/styles';
import { authActions } from '../../actions';
import { IAuthState } from '../../reducers';
import { SigningInfo } from '../../models/SigningInfo';
import PageName, { toPublicUrl } from '../../constants/PageName';
import SignUpForm from '../../components/SignUpForm';

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
    signUp: (signing: SigningInfo) => void;
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
      signUp: (signing: SigningInfo) => dispatch(authActions.signUp.started(signing)),
    },
  };
};

class SignUpPage extends React.Component<Props, State> {
  public state: State = {};

  public render() {
    const { classes, auth } = this.props;

    return (
      <div className={classes.root}>
        <main className={classes.layout}>
          <SignUpForm
            authenticatedUser={auth.user}
            authenticatedUserTimestamp={auth.timestamp}
            onSignUp={this.handleSignUp}
            onNavigateAfterSignedUp={this.handleGoHome}
            submitting={auth.submitting}
          />
        </main>
      </div>
    );
  }

  private handleSignUp = (signing: SigningInfo) => {
    this.props.actions.signUp(signing);
  };

  private handleGoHome = () => {
    this.props.history.push(toPublicUrl(PageName.HOME));
  };
}

export default withRouter(
  withRoot(
    withStyles(styles)(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(SignUpPage)
    )
  )
);
