import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Theme, createStyles, withStyles, WithStyles } from '@material-ui/core';
import withRoot from '../../utilities/withRoot';
import { createDefaultStyles } from '../../utilities/styles';
import { authActions } from '../../actions';
import { IAuthState } from '../../reducers';
import PasswordResetForm from '../../components/PasswordResetForm';

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
    sendPasswordResetEmail: (email: string) => void;
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
      sendPasswordResetEmail: (email: string) => dispatch(authActions.sendPasswordResetEmail.started(email)),
    },
  };
};

class PasswordResetPage extends React.Component<Props, State> {
  public state: State = {};

  public render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <main className={classes.layout}>
          <PasswordResetForm
            onSendPasswordResetEmail={this.handleSendPasswordResetEmail}
            onGoBack={this.handleGoBack}
          />
        </main>
      </div>
    );
  }

  private handleSendPasswordResetEmail = (email: string) => {
    this.props.actions.sendPasswordResetEmail(email);
  };

  private handleGoBack = () => {
    this.props.history.goBack();
  };
}

export default withRouter(
  withRoot(
    withStyles(styles)(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(PasswordResetPage)
    )
  )
);
