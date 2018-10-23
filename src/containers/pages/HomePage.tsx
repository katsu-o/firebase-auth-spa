import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Theme, Typography, createStyles, withStyles, WithStyles } from '@material-ui/core';
import withRoot from '../../utilities/withRoot';
import { createDefaultStyles } from '../../utilities/styles';
import { IAuthState } from '../../reducers';

const styles = (theme: Theme) => {
  return {
    ...createDefaultStyles(theme),
    ...createStyles({}),
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

const mapStateToProps = (state: IStateProps, ownProps: IOwnProps): IStateProps => ({ auth: state.auth });

const mapDispatchToProps = (dispatch: Redux.Dispatch, ownProps: IOwnProps): IDispatchProps => {
  return {
    actions: {},
  };
};

class HomePage extends React.Component<Props, State> {
  public state: State = {};

  public render() {
    const { auth } = this.props;
    const email = auth && auth.user ? auth.user.email : '';

    return (
      <div className={this.props.classes.root}>
        <Typography variant="subtitle1" gutterBottom={true}>
          Home
        </Typography>
        <Typography variant="subheading" gutterBottom={true}>
          Hi, {email}
        </Typography>
      </div>
    );
  }
}

export default withRouter(
  withRoot(
    withStyles(styles)(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )(HomePage)
    )
  )
);
