import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Button, Typography, Chip, Theme, createStyles, withStyles, WithStyles } from '@material-ui/core';
import withRoot from '../../utilities/withRoot';
import { createDefaultStyles } from '../../utilities/styles';
import PageName, { toPublicUrl } from '../../constants/PageName';
import { IAuthState } from '../../reducers';

const styles = (theme: Theme) => {
  return {
    ...createDefaultStyles(theme),
    ...createStyles({
      button: {
        margin: theme.spacing.unit,
        textTransform: 'none',
      },
      chip: {
        textAlign: 'center',
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
  actions: {};
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
    actions: {},
  };
};

class TopPage extends React.Component<Props, State> {
  public state: State = {};

  public render() {
    const { classes, auth } = this.props;
    const authenticated = Boolean(auth.user);
    return (
      <div className={classes.root}>
        <Typography variant="subtitle1" gutterBottom={true}>
          Welcome!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.handleGoSignIn}
          disabled={authenticated}
        >
          Sign in
        </Button>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          onClick={this.handleGoSignUp}
          disabled={authenticated}
        >
          Sign up
        </Button>
        {authenticated && (
          <React.Fragment>
            <br />
            <Chip label="You've already signed in." className={classes.chip} />
          </React.Fragment>
        )}
      </div>
    );
  }

  private handleGoSignIn = (event: React.MouseEvent) => {
    this.props.history.push(toPublicUrl(PageName.SIGNIN));
  };

  private handleGoSignUp = (event: React.MouseEvent) => {
    this.props.history.push(toPublicUrl(PageName.SIGNUP));
  };
}

export default withRouter(
  withRoot(
    withStyles(styles)(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(TopPage)
    )
  )
);
