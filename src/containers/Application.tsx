import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import PageName, { toPublicUrl } from '../constants/PageName';
import ApplicationManager from './ApplicationManager';
import ApplicationBar from './ApplicationBar';
import { TopPage, SignUpPage, SignInPage, HomePage, SettingsPage, PasswordResetPage } from './pages';
import PrivateRoute from './PrivateRoute';

import { IconButton } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { Close as CloseIcon } from '@material-ui/icons';

interface Props {}
interface State {}

class Application extends React.Component<Props, State> {
  public state: State = {};

  public render() {
    return (
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        action={[
          <IconButton key="close" aria-label="Close" color="inherit">
            <CloseIcon />
          </IconButton>,
        ]}
      >
        <React.Fragment>
          <ApplicationManager />
          <ApplicationBar />
          <Switch>
            <Route path={toPublicUrl(PageName.SIGNUP)} component={SignUpPage} />
            <Route path={toPublicUrl(PageName.SIGNIN)} component={SignInPage} />
            <Route path={toPublicUrl(PageName.PASSWORDRESET)} component={PasswordResetPage} />
            <PrivateRoute path={toPublicUrl(PageName.HOME)} component={HomePage} />
            <PrivateRoute path={toPublicUrl(PageName.SETTINGS)} component={SettingsPage} />
            <Route strict={true} exact={true} path={toPublicUrl(PageName.TOP)} component={TopPage} />
            <Redirect strict={true} exact={true} to={toPublicUrl(PageName.TOP)} />
          </Switch>
        </React.Fragment>
      </SnackbarProvider>
    );
  }
}
export default Application;
