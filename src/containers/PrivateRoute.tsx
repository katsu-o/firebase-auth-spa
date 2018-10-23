// tslint:disable jsx-no-lambda
import * as React from 'react';
import { Redirect, Route, withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import PageName, { toPublicUrl } from '../constants/PageName';
import { AUTH_EMAIL_VERIFICATION_REQUIRED } from '../constants/constants';
import { IAuthState } from '../reducers';
import SessionStorageAccessor from '../utilities/SessionStorageAccessor';

// props from parent
interface IOwnProps extends RouteComponentProps<{}> {
  component: React.ComponentClass;
  path: string;
}

// props of this component extracted from Store
interface IStateProps {
  auth: IAuthState;
}

// entire props of this component
type Props = IStateProps & IOwnProps;

const mapStateToProps = (state: IStateProps, ownProps: IOwnProps): IStateProps => ({
  auth: state.auth,
});

class PrivateRoute extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render(): JSX.Element {
    const { auth, component: Component, ...props } = this.props;
    const authenticated = AUTH_EMAIL_VERIFICATION_REQUIRED
      ? Boolean(auth.user && auth.user.emailVerified)
      : Boolean(auth.user);
    const authAction = SessionStorageAccessor.getAuthAction();
    const isLinking = authAction && authAction.action === 'AddLink';
    return (
      <Route
        {...props}
        render={rcProps =>
          authenticated || isLinking ? (
            <Component {...rcProps} />
          ) : (
            <Redirect
              to={{
                pathname: toPublicUrl(PageName.SIGNIN),
                state: { from: rcProps.location },
              }}
            />
          )
        }
      />
    );
  }
}

export default withRouter(connect(mapStateToProps)(PrivateRoute));
