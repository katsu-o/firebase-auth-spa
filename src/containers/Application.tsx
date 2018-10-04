import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import PageName, { toPublicUrl } from '../constants/PageName';
import ApplicationManager from './ApplicationManager';
import ApplicationBar from '../components/ApplicationBar';
import { TopPage, SignInPage, HomePage } from './pages';
import PrivateRoute from './PrivateRoute';

interface Props {}
interface State {}

class Application extends React.Component<Props, State> {
  public state: State = {};

  public render() {
    return (
      <React.Fragment>
        <ApplicationManager />
        <ApplicationBar />
        <Switch>
          <Route path={toPublicUrl(PageName.SIGNIN)} component={SignInPage} />
          <PrivateRoute path={toPublicUrl(PageName.HOME)} component={HomePage} />
          {/*
          <Route strict={true} exact={true} path={toPublicUrl(PageName.TOP)} render={() => <TopPage />} />
          */}
          <Route strict={true} exact={true} path={toPublicUrl(PageName.TOP)} component={TopPage} />
          <Redirect strict={true} exact={true} to={toPublicUrl(PageName.TOP)} />
        </Switch>
      </React.Fragment>
    );
  }
}
export default Application;
