import * as React from 'react';
import {
  Avatar,
  Button,
  IconButton,
  CssBaseline,
  Paper,
  TextField,
  InputAdornment,
  Typography,
  Theme,
  createStyles,
  WithStyles,
  CircularProgress,
  Collapse,
  Fade,
  Divider,
  withStyles,
} from '@material-ui/core';
import {
  LockOutlined as LockIcon,
  DoneOutlined as DoneIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Home as HomeIcon,
} from '@material-ui/icons';
import classNames from 'classnames';
import { Formik, FormikProps, FormikActions, Field, FieldProps } from 'formik';
// import Yup from 'yup';
import { ISigningInfo } from '../models/SigningInfo';
import { UserInfo, toProviderIds } from '../models/UserInfo';
import { Provider } from '../models/Provider';
import IconUtil from '../utilities/IconUtil';
import { mapper, StateHandler, StateHandlerMap, StateUpdaters, withStateHandlers } from 'recompose';

const styles = (theme: Theme) =>
  createStyles({
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
    paper: {
      marginTop: theme.spacing.unit * 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: `${theme.spacing.unit * 0}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 1}px`,
    },
    avatar: {
      marginTop: theme.spacing.unit,
      marginLeft: theme.spacing.unit * 0,
      marginRight: theme.spacing.unit * 0,
      marginBottom: theme.spacing.unit * 0,
      backgroundColor: theme.palette.primary.main,
    },
    avatarSuccess: {
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%', // Fix IE11 issue.
      marginTop: theme.spacing.unit * 0,
    },
    provider: {
      marginTop: theme.spacing.unit,
      textTransform: 'none',
    },
    submit: {
      marginTop: theme.spacing.unit,
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      textTransform: 'none',
    },
    wrapper: {
      margin: theme.spacing.unit,
      position: 'relative',
    },
    fabProgress: {
      color: theme.palette.primary.light,
      position: 'absolute',
      top: 5,
      left: -4,
      zIndex: 1,
    },
    statusIcon: {
      position: 'absolute',
    },
    providerIcon: {
      verticalAlign: 'middle',
      marginRight: theme.spacing.unit,
    },
    annotation: {
      marginTop: theme.spacing.unit * 2,
    },
  });

// props from parent
interface IOwnProps extends WithStyles<typeof styles> {
  authenticatedUser: UserInfo;
  submitting: boolean;
  onSignInOrSignUp: (signing: ISigningInfo, signUp: boolean) => void;
  onNavigateAfterSignedIn: () => void;
}

// local state of this component
interface State {
  passwordVisibility: boolean;
}

// for StateHandler: Updaters
interface Updaters extends StateHandlerMap<State> {
  togglePasswordVisibility: StateHandler<State>;
}

// for StateHandler: createProps
const createProps: mapper<IOwnProps, State> = (props: IOwnProps): State => ({ passwordVisibility: false });

// for StateHandler: stateUpdaters
const stateUpdaters: StateUpdaters<IOwnProps, State, Updaters> = {
  togglePasswordVisibility: (prev: State, props: IOwnProps): StateHandler<State> => (): Partial<State> => ({
    passwordVisibility: !prev.passwordVisibility,
  }),
};

// entire props of this component
type Props = IOwnProps & State & Updaters;

// Formik form values
interface FormValues extends ISigningInfo {
  pseudo: boolean; // for form reset
}

const validate = (values: FormValues) => {
  const errors: any = {};
  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  if (!values.password) {
    errors.password = 'Required';
  } else if (values.password.length < 6) {
    errors.password = 'At least 6 characters';
  }
  return errors;
};

const CustomTextFieldComponent = ({ field, form, ...props }: FieldProps<FormValues>) => (
  <TextField
    onChange={form.handleChange}
    onBlur={form.handleBlur}
    value={field.value}
    disabled={form.isSubmitting}
    error={form.touched[field.name] && form.errors[field.name] !== undefined}
    helperText={form.errors[field.name]}
    {...props}
  />
);

const SignInForm = (props: Props) => {
  const {
    classes,
    authenticatedUser,
    submitting,
    onSignInOrSignUp,
    onNavigateAfterSignedIn,
    passwordVisibility,
    togglePasswordVisibility,
  } = props;
  const authenticated = Boolean(authenticatedUser);
  const avatarClassname = classNames(classes.avatar, {
    [classes.avatarSuccess]: authenticated,
  });

  const iv: FormValues = {
    email: '',
    password: '',
    provider: '',
    pseudo: authenticated,
  };

  const handleFormikSubmit = (values: FormValues, formikActions: FormikActions<FormValues>) => {
    const sign: ISigningInfo = {
      email: values.email,
      password: values.password,
      provider: 'Password',
    };
    onSignInOrSignUp(sign, false);
  };

  const render = (formikBag: FormikProps<FormValues>) => {
    const handleSelectProviderOrSignUp = (provider: Provider) => (e: React.MouseEvent) => {
      const sign: ISigningInfo = {
        email: formikBag.values.email,
        password: formikBag.values.password,
        provider: provider,
      };
      if (provider !== 'Password') {
        formikBag.resetForm(iv);
      }
      onSignInOrSignUp(sign, provider === 'Password');
    };

    const handleTogglePasswordVisibility = (e: React.MouseEvent) => {
      togglePasswordVisibility();
    };

    return (
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <div className={classes.wrapper}>
            <Avatar className={avatarClassname}>
              <Fade in={!authenticated}>
                <LockIcon className={classes.statusIcon} />
              </Fade>
              <Fade in={authenticated}>
                <DoneIcon className={classes.statusIcon} />
              </Fade>
            </Avatar>
            {submitting && <CircularProgress size={46} className={classes.fabProgress} />}
          </div>
          <Collapse in={!authenticated}>
            <Typography variant="headline">Sign in</Typography>
          </Collapse>
          <Collapse in={authenticated}>
            <Typography variant="caption">
              {authenticatedUser &&
                toProviderIds(authenticatedUser.providerData()).map(providerId => {
                  return IconUtil.renderProviderIcon(providerId, {
                    className: classes.providerIcon,
                    key: `id-${providerId}`,
                  });
                })}
              {authenticatedUser && authenticatedUser.email}
            </Typography>
            <Typography variant="headline">Signed in</Typography>
            <Button
              variant="contained"
              color="secondary"
              className={classes.submit}
              onClick={onNavigateAfterSignedIn}
              disabled={!authenticated}
            >
              <HomeIcon className={classes.providerIcon} />
              Home
            </Button>
          </Collapse>

          <Collapse in={!authenticated}>
            <React.Fragment>
              <Button
                type="button"
                fullWidth={true}
                variant="raised"
                color="primary"
                className={classes.provider}
                disabled={authenticated || submitting}
                onClick={handleSelectProviderOrSignUp('Google')}
              >
                {IconUtil.renderProviderIcon('Google', {
                  className: classes.providerIcon,
                })}
                Sign in with &nbsp;
                <b>Google</b>
              </Button>
              <Button
                type="button"
                fullWidth={true}
                variant="raised"
                color="primary"
                className={classes.provider}
                disabled={authenticated || submitting}
                onClick={handleSelectProviderOrSignUp('Facebook')}
              >
                {IconUtil.renderProviderIcon('Facebook', {
                  className: classes.providerIcon,
                })}
                Sign in with &nbsp;
                <b>Facebook</b>
              </Button>
              <Button
                type="button"
                fullWidth={true}
                variant="raised"
                color="primary"
                className={classes.provider}
                disabled={authenticated || submitting}
                onClick={handleSelectProviderOrSignUp('Twitter')}
              >
                {IconUtil.renderProviderIcon('Twitter', {
                  className: classes.providerIcon,
                })}
                Sign in with &nbsp;
                <b>Twitter</b>
              </Button>
              <Button
                type="button"
                fullWidth={true}
                variant="raised"
                color="primary"
                className={classes.provider}
                disabled={authenticated || submitting}
                onClick={handleSelectProviderOrSignUp('GitHub')}
              >
                {IconUtil.renderProviderIcon('GitHub', {
                  className: classes.providerIcon,
                })}
                Sign in with &nbsp;
                <b>GitHub</b>
              </Button>
              <Divider className={classes.annotation} />
              <Typography variant="body1" className={classes.annotation}>
                Or, Sign in or Sign up with Email and Password.
              </Typography>
              <form className={classes.form} onSubmit={formikBag.handleSubmit}>
                <Field
                  label="Email Address"
                  margin="dense"
                  required={true}
                  fullWidth={true}
                  id="email"
                  name="email"
                  autoComplete="email"
                  disabled={authenticated || submitting}
                  component={CustomTextFieldComponent}
                />
                <Field
                  label="Password"
                  margin="dense"
                  required={true}
                  fullWidth={true}
                  id="password"
                  name="password"
                  type={passwordVisibility ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={authenticated || submitting}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          disabled={authenticated || submitting}
                        >
                          {passwordVisibility ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  component={CustomTextFieldComponent}
                />
                <Button
                  type="submit"
                  fullWidth={false}
                  variant="raised"
                  color="primary"
                  className={classes.submit}
                  disabled={authenticated || submitting || !formikBag.isValid}
                >
                  {IconUtil.renderProviderIcon('Password', {
                    className: classes.providerIcon,
                  })}
                  Sign in
                </Button>
                <Button
                  type="button"
                  fullWidth={false}
                  variant="raised"
                  color="secondary"
                  className={classes.submit}
                  disabled={authenticated || submitting || !formikBag.isValid}
                  onClick={handleSelectProviderOrSignUp('Password')}
                >
                  {IconUtil.renderProviderIcon('Password', {
                    className: classes.providerIcon,
                  })}
                  Sign up
                </Button>
              </form>
            </React.Fragment>
          </Collapse>
        </Paper>
      </main>
    );
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Formik
        enableReinitialize={true}
        initialValues={iv}
        validate={validate}
        onSubmit={handleFormikSubmit}
        render={render}
      />
    </React.Fragment>
  );
};

// export default withStyles(styles)(SignInForm); // before use withStateHandlers(recompose)
export default withStyles(styles)(
  withStateHandlers<State, Updaters, IOwnProps>(createProps, stateUpdaters)(SignInForm)
);
