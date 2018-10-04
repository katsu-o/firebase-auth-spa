import * as React from 'react';
import * as Redux from 'redux';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Theme, createStyles, withStyles, WithStyles } from '@material-ui/core';
import withRoot from '../../utilities/withRoot';
import { createDefaultStyles } from '../../utilities/styles';
import { appActions, authActions } from '../../actions';
import { IAuthState } from '../../reducers';
import { SigningInfo } from '../../models/SigningInfo';
import PageName, { toPublicUrl } from '../../constants/PageName';
import SignInForm from '../../components/SignInForm';

const styles = (theme: Theme) => {
  return {
    ...createDefaultStyles(theme),
    ...createStyles({
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
    clearErrors: () => void;
    signUp: (signing: SigningInfo) => void;
    signIn: (signing: SigningInfo) => void;
  };
}

// entire props of this component
type Props = IStateProps & IDispatchProps & IOwnProps;

// local state of this component
interface State {
  refreshCounter: number;
}

const mapStateToProps = (state: IStateProps, ownProps: IOwnProps): IStateProps => ({
  auth: state.auth,
});

const mapDispatchToProps = (dispatch: Redux.Dispatch, ownProps: IOwnProps): IDispatchProps => {
  return {
    actions: {
      clearErrors: () => dispatch(appActions.clearErrors()),
      signUp: (signing: SigningInfo) => dispatch(authActions.signUp.started(signing)),
      signIn: (signing: SigningInfo) => dispatch(authActions.signIn.started(signing)),
    },
  };
};

class SignInPage extends React.Component<Props, State> {
  public state: State = {
    refreshCounter: 0,
  };

  public componentWillReceiveProps(nextProps: Props) {
    // 既存アカウントへの他のプロバイダのリンク直後、
    // auth.user.providerData の反映が遅いための対処。
    // 認証済ユーザがセットされた際、何回かリフレッシュ処理を入れる。
    if (!this.props.auth.user && nextProps.auth.user) {
      this.setState({ ...this.state, refreshCounter: 5 }, () => {
        this.refresh();
      });
    }
  }

  public render() {
    const { classes } = this.props;

    // SignInForm に rerender させるため、展開して別オブジェクトとする。
    const auth = { ...this.props.auth };

    return (
      <div className={classes.root}>
        <SignInForm
          authenticatedUser={auth.user}
          submitting={auth.submitting}
          onSignInOrSignUp={this.handleSignInOrSignUp}
          onNavigateAfterSignedIn={this.handleGoHome}
        />
      </div>
    );
  }

  private handleSignInOrSignUp = (signing: SigningInfo, signUp: boolean) => {
    // エラーのクリア
    this.props.actions.clearErrors();

    if (signing && signUp) {
      this.props.actions.signUp(signing);
    } else {
      this.props.actions.signIn(signing);
    }
  };

  private handleGoHome = () => {
    this.props.history.push(toPublicUrl(PageName.HOME));
  };

  // リフレッシュ処理
  // refreshCounter を減らしながら、state を変更することで render させる。
  private refresh = () => {
    if (this.state.refreshCounter > 0) {
      setTimeout(() => {
        this.setState({ ...this.state, refreshCounter: this.state.refreshCounter - 1 }, () => this.refresh());
      }, 1000);
    }
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
