// tslint:disable jsx-no-lambda
import * as React from 'react';
import { Redirect, Route, withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import PageName, { toPublicUrl } from '../constants/PageName';
import { IAuthState } from '../reducers';

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
    const authenticated = Boolean(auth.user);
    return (
      <Route
        {...props}
        render={rcProps =>
          authenticated ? (
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
