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
import { AuthProvider } from '../models/AuthProvider';
import IconUtil from '../utilities/IconUtil';

const styles = (theme: Theme) =>
  createStyles({
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
      backgroundColor: theme.palette.grey[400],
    },
    avatarSuccess: {
      backgroundColor: theme.palette.primary.main,
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
      marginLeft: theme.spacing.unit * 0,
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
      marginTop: theme.spacing.unit * 1,
    },
  });

// props from parent
interface IOwnProps extends WithStyles<typeof styles> {
  authenticatedUser: UserInfo;
  authenticatedUserTimestamp?: number;
  onSignIn: (signing: ISigningInfo) => void;
  onGoPasswordReset: () => void;
  onNavigateAfterSignedIn: () => void;
  authProviders: AuthProvider[];
  submitting?: boolean;
}

// local state of this component
interface State {}

// entire props of this component
type Props = IOwnProps & State;

// Formik form values
interface FormValues extends ISigningInfo {
  passwordVisibility: boolean;
  pseudo: number; // for form reset
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
    onChange={form.handleChange(field.name)}
    // tslint:disable-next-line jsx-no-lambda
    onBlur={e => form.handleBlur(field.name)}
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
    authenticatedUserTimestamp,
    submitting,
    authProviders,
    onSignIn,
    onGoPasswordReset,
    onNavigateAfterSignedIn,
  } = props;
  const authenticated = Boolean(authenticatedUser);
  const avatarClassname = classNames(classes.avatar, {
    [classes.avatarSuccess]: authenticated,
  });

  const iv: FormValues = {
    userName: null,
    email: '',
    password: '',
    authProvider: null,
    passwordVisibility: false,
    pseudo: authenticatedUserTimestamp || 0,
  };

  const handleFormikSubmit = (values: FormValues, formikActions: FormikActions<FormValues>) => {
    // フォーム側では状態管理しない
    formikActions.setSubmitting(false);

    const signing: ISigningInfo = {
      userName: null,
      email: values.email,
      password: values.password,
      authProvider: 'Password',
    };
    onSignIn(signing);
  };

  const handleGoPasswordReset = (e: React.MouseEvent) => {
    e.preventDefault();
    onGoPasswordReset();
  };

  const render = (formikBag: FormikProps<FormValues>) => {
    const handleSelectProviderOrSignUp = (authProvider: AuthProvider) => (e: React.MouseEvent) => {
      const signing: ISigningInfo = {
        userName: null,
        email: formikBag.values.email,
        password: formikBag.values.password,
        authProvider: authProvider,
      };
      if (authProvider !== 'Password') {
        formikBag.resetForm(iv);
      }
      onSignIn(signing);
    };

    const handleTogglePasswordVisibility = (e: React.MouseEvent) => {
      formikBag.setFieldValue('passwordVisibility', !formikBag.values.passwordVisibility);
    };

    return (
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
          <Typography variant="h6">Sign in</Typography>
        </Collapse>
        <Collapse in={authenticated}>
          <Typography>
            {authenticatedUser &&
              authenticatedUser.providerData &&
              toProviderIds(authenticatedUser.providerData).map(providerId => {
                return IconUtil.renderAuthProviderIcon(providerId, {
                  className: classes.providerIcon,
                  key: `id-${providerId}`,
                });
              })}
            {authenticatedUser && authenticatedUser.email}
            <br />
            {authenticatedUser && `(${authenticatedUser.displayName})`}
          </Typography>
          <Typography variant="h6">Signed in</Typography>
          <Button
            variant="contained"
            color="primary"
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
            {authProviders.map((authProvider, idx) => {
              return authProvider !== 'Password' ? (
                <Button
                  key={authProvider}
                  type="button"
                  fullWidth={true}
                  variant="contained"
                  color="primary"
                  className={classes.provider}
                  disabled={authenticated || submitting}
                  onClick={handleSelectProviderOrSignUp(authProvider)}
                >
                  {IconUtil.renderAuthProviderIcon(authProvider, {
                    className: classes.providerIcon,
                  })}
                  Sign in with &nbsp;
                  <b>{authProvider}</b>
                </Button>
              ) : null;
            })}
            <Divider className={classes.annotation} />
            <Typography className={classes.annotation}>
              Or, Sign in with Email &amp; Password.{' '}
              {!submitting && (
                <a href="#passwordreset" onClick={handleGoPasswordReset}>
                  Forgot password?
                </a>
              )}
            </Typography>
            <form className={classes.form} onSubmit={formikBag.handleSubmit}>
              <Field
                label="Email Address"
                margin="dense"
                required={true}
                fullWidth={true}
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
                name="password"
                type={formikBag.values.passwordVisibility ? 'text' : 'password'}
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
                        {formikBag.values.passwordVisibility ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                component={CustomTextFieldComponent}
              />
              <Button
                type="submit"
                fullWidth={true}
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={authenticated || submitting || !formikBag.isValid}
              >
                {IconUtil.renderAuthProviderIcon('Password', {
                  className: classes.providerIcon,
                })}
                Sign in with Email &amp; Password
              </Button>
            </form>
          </React.Fragment>
        </Collapse>
      </Paper>
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

export default withStyles(styles)(SignInForm);
