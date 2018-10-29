// tslint:disable jsx-no-lambda
import * as React from 'react';
import {
  Button,
  CssBaseline,
  Paper,
  Grid,
  TextField,
  Typography,
  Theme,
  createStyles,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { Check as CheckIcon } from '@material-ui/icons';
import { Formik, FormikProps, FormikActions, Field, FieldProps } from 'formik';
// import Yup from 'yup';
import { UserInfo } from '../models/UserInfo';
import AuthUtil from '../utilities/AuthUtil';
import { isValidEmail, isGmail } from '../utilities/misc';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing.unit * 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'start',
      textAlign: 'left',
      padding: `${theme.spacing.unit * 1}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 1}px`,
    },
    form: {
      width: '100%', // Fix IE11 issue.
      marginTop: theme.spacing.unit * 0,
    },
    chapterHeading: {
      textDecoration: 'underline',
      marginBottom: theme.spacing.unit * 1,
    },
    provider: {
      marginTop: theme.spacing.unit,
      textTransform: 'none',
    },
    providerHidden: {
      marginTop: theme.spacing.unit,
      textTransform: 'none',
      display: 'none',
    },
    submit: {
      marginTop: theme.spacing.unit,
      marginLeft: theme.spacing.unit * 0,
      marginRight: theme.spacing.unit,
      textTransform: 'none',
    },
    buttonIcon: {
      verticalAlign: 'middle',
      marginRight: theme.spacing.unit,
    },
  });

// props from parent
interface IOwnProps extends WithStyles<typeof styles> {
  authenticatedUser: UserInfo;
  authenticatedUserTimestamp?: number;
  onUpdateEmail: (email: string) => void;
  submitting?: boolean;
  disabled?: boolean;
}

// local state of this component
interface State {}

// entire props of this component
type Props = IOwnProps & State;

// Formik form values
interface FormValues {
  email: string;
  pseudo: number; // for form reset
}

const validate = (authenticatedUser: UserInfo) => (values: FormValues) => {
  const errors: any = {};
  if (!values.email) {
    errors.email = 'Required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Invalid email address';
  } else if (isGmail(values.email)) {
    // このユーザーのプロバイダに Google が含まれていた場合に限り、その gmail アドレスへの変更のみ許可。
    if (AuthUtil.isLinkedAuthProvider(authenticatedUser, 'Google')) {
      const google = AuthUtil.getAuthProviderUserInfo(authenticatedUser, 'Google');
      if (google && google.email !== values.email) {
        errors.email = `Changing to @gmail.com is possible only for ${google.email}`;
      }
    } else {
      errors.email = '@gmail.com is not allowed';
    }
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

const UserIdentityForm = (props: Props) => {
  const { classes, authenticatedUser, authenticatedUserTimestamp, submitting, onUpdateEmail, disabled } = props;
  const authenticated = Boolean(authenticatedUser);

  const iv: FormValues = {
    email: authenticatedUser && authenticatedUser.email ? authenticatedUser.email : '',
    pseudo: authenticatedUserTimestamp || 0,
  };

  const preventFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleFormikSubmit = (values: FormValues, formikActions: FormikActions<FormValues>) => {
    // フォーム側では状態管理しない
    formikActions.setSubmitting(false);

    onUpdateEmail(values.email);
  };

  const render = (formikBag: FormikProps<FormValues>) => {
    return (
      <Paper className={classes.paper}>
        <Typography variant="h6" className={classes.chapterHeading}>
          Account
        </Typography>
        <form className={classes.form} onSubmit={preventFormSubmit}>
          <Grid container={true} direction="row" justify="flex-start" alignItems="center">
            <Grid item={true} xs={12}>
              <Field
                label="Email Address"
                margin="dense"
                required={true}
                fullWidth={true}
                name="email"
                autoComplete="email"
                variant="outlined"
                disabled={!authenticated || submitting || disabled}
                component={CustomTextFieldComponent}
              />
            </Grid>
          </Grid>
          <Grid container={true} direction="row" justify="flex-end" alignItems="center">
            <Grid item={true}>
              <Button
                type="button"
                fullWidth={true}
                variant="contained"
                color="primary"
                className={classes.submit}
                disabled={!authenticated || submitting || !formikBag.isValid || disabled}
                onClick={formikBag.submitForm}
              >
                <CheckIcon className={classes.buttonIcon} />
                Update
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    );
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Formik
        enableReinitialize={true}
        initialValues={iv}
        validate={validate(authenticatedUser)}
        onSubmit={handleFormikSubmit}
        render={render}
      />
    </React.Fragment>
  );
};

export default withStyles(styles)(UserIdentityForm);
