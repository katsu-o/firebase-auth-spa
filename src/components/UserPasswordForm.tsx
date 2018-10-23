import * as React from 'react';
import {
  Button,
  IconButton,
  CssBaseline,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Typography,
  Theme,
  createStyles,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
} from '@material-ui/icons';
import { Formik, FormikProps, FormikActions, Field, FieldProps } from 'formik';
// import Yup from 'yup';
import { UserInfo } from '../models/UserInfo';

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
  onUpdatePassword: (password: string) => void;
  submitting?: boolean;
  disabled?: boolean;
}

// local state of this component
interface State {}

// entire props of this component
type Props = IOwnProps & State;

// Formik form values
interface FormValues {
  password: string;
  passwordVisibility: boolean;
  pseudo: number; // for form reset
}

const validate = (values: FormValues) => {
  const errors: any = {};
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

const UserPasswordForm = (props: Props) => {
  const { classes, authenticatedUser, authenticatedUserTimestamp, submitting, onUpdatePassword, disabled } = props;
  const authenticated = Boolean(authenticatedUser);

  const iv: FormValues = {
    password: '',
    passwordVisibility: false,
    pseudo: authenticatedUserTimestamp || 0,
  };

  const preventFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleFormikSubmit = (values: FormValues, formikActions: FormikActions<FormValues>) => {
    // フォーム側では状態管理しない
    formikActions.setSubmitting(false);

    onUpdatePassword(values.password);
  };

  const render = (formikBag: FormikProps<FormValues>) => {
    const handleTogglePasswordVisibility = (e: React.MouseEvent) => {
      formikBag.setFieldValue('passwordVisibility', !formikBag.values.passwordVisibility);
    };

    return (
      <Paper className={classes.paper}>
        <Typography variant="h6" className={classes.chapterHeading}>
          Password
        </Typography>
        <form className={classes.form} onSubmit={preventFormSubmit}>
          <Grid container={true} direction="row" justify="flex-start" alignItems="center">
            <Grid item={true} xs={12}>
              <Field
                label="Password"
                margin="dense"
                required={true}
                fullWidth={true}
                name="password"
                type={formikBag.values.passwordVisibility ? 'text' : 'password'}
                autoComplete="current-password"
                variant="outlined"
                disabled={!authenticated || submitting || disabled}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        disabled={!authenticated || submitting || disabled}
                      >
                        {formikBag.values.passwordVisibility ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
        validate={validate}
        onSubmit={handleFormikSubmit}
        render={render}
      />
    </React.Fragment>
  );
};

export default withStyles(styles)(UserPasswordForm);
