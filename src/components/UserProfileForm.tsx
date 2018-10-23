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
import { IProfile } from '../models/Profile';
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
  onUpdateProfile: (profile: IProfile) => void;
  submitting?: boolean;
  disabled?: boolean;
}

// local state of this component
interface State {}

// entire props of this component
type Props = IOwnProps & State;

// Formik form values
interface FormValues extends IProfile {
  pseudo: number; // for form reset
}

const validate = (values: FormValues) => {
  const errors: any = {};
  if (!values.displayName) {
    errors.displayName = 'Required';
  }
  if (values.photoURL && !/^(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/.test(values.photoURL)) {
    errors.photoURL = 'Invalid URL';
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

const UserProfileForm = (props: Props) => {
  const { classes, authenticatedUser, authenticatedUserTimestamp, submitting, onUpdateProfile, disabled } = props;
  const authenticated = Boolean(authenticatedUser);

  const iv: FormValues = {
    displayName: authenticatedUser && authenticatedUser.displayName ? authenticatedUser.displayName : '',
    photoURL: authenticatedUser && authenticatedUser.photoURL ? authenticatedUser.photoURL : '',
    pseudo: authenticatedUserTimestamp || 0,
  };

  const preventFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleFormikSubmit = (values: FormValues, formikActions: FormikActions<FormValues>) => {
    // フォーム側では状態管理しない
    formikActions.setSubmitting(false);

    const profile: IProfile = {
      displayName: '' !== values.displayName ? values.displayName : null,
      photoURL: '' !== values.photoURL ? values.photoURL : null,
    };
    onUpdateProfile(profile);
  };

  const render = (formikBag: FormikProps<FormValues>) => {
    return (
      <Paper className={classes.paper}>
        <Typography variant="h6" className={classes.chapterHeading}>
          Profile
        </Typography>
        <form className={classes.form} onSubmit={preventFormSubmit}>
          <Grid container={true} direction="row" justify="flex-start" alignItems="center">
            <Grid item={true} xs={12}>
              <Field
                label="Display Name"
                margin="dense"
                required={true}
                fullWidth={true}
                name="displayName"
                autoComplete="displayName"
                variant="outlined"
                disabled={!authenticated || submitting || disabled}
                component={CustomTextFieldComponent}
              />
            </Grid>
            <Grid item={true} xs={12}>
              <Field
                label="Photo URL"
                margin="dense"
                required={true}
                fullWidth={true}
                name="photoURL"
                autoComplete="photoURL"
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
        validate={validate}
        onSubmit={handleFormikSubmit}
        render={render}
      />
    </React.Fragment>
  );
};

export default withStyles(styles)(UserProfileForm);
