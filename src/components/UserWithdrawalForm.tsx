import * as React from 'react';
import {
  Button,
  CssBaseline,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
  Theme,
  createStyles,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { DeleteForever as DeleteForeverIcon } from '@material-ui/icons';
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
      backgroundColor: theme.palette.error.main,
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
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
  onWithdraw: () => void;
  submitting?: boolean;
  disabled?: boolean;
}

// local state of this component
interface State {}

// entire props of this component
type Props = IOwnProps & State;

// Formik form values
interface FormValues {
  confirmed: boolean;
  pseudo: number; // for form reset
}

const validate = (values: FormValues) => {
  const errors: any = {};
  if (!values.confirmed) {
    errors.confirmed = 'Required';
  }
  return errors;
};

const CustomCheckboxComponent = ({ field, form, ...props }: FieldProps<FormValues>) => (
  <Checkbox
    checked={field.value}
    onChange={form.handleChange}
    onBlur={form.handleBlur}
    disabled={form.isSubmitting}
    {...props}
  />
);

const UserWithdrawalForm = (props: Props) => {
  const { classes, authenticatedUser, authenticatedUserTimestamp, submitting, onWithdraw, disabled } = props;
  const authenticated = Boolean(authenticatedUser);

  const iv: FormValues = {
    confirmed: false,
    pseudo: authenticatedUserTimestamp || 0,
  };

  const preventFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleFormikSubmit = (values: FormValues, formikActions: FormikActions<FormValues>) => {
    // フォーム側では状態管理しない
    formikActions.setSubmitting(false);

    onWithdraw();
  };

  const render = (formikBag: FormikProps<FormValues>) => {
    return (
      <Paper className={classes.paper}>
        <Typography variant="h6" className={classes.chapterHeading}>
          Withdraw
        </Typography>
        <form className={classes.form} onSubmit={preventFormSubmit}>
          <Grid container={true} direction="row" justify="flex-start" alignItems="center">
            <Grid item={true} xs={12}>
              <FormControlLabel
                label="I agree to delete my account(It can not be restored)."
                control={
                  <Field
                    id="confirmed"
                    name="confirmed"
                    disabled={!authenticated || submitting || disabled}
                    color="primary"
                    component={CustomCheckboxComponent}
                  />
                }
              />
            </Grid>
          </Grid>
          <Grid container={true} direction="row" justify="flex-end" alignItems="center">
            <Grid item={true}>
              <Button
                type="button"
                fullWidth={true}
                variant="contained"
                className={classes.submit}
                disabled={!authenticated || submitting || !formikBag.isValid || disabled}
                onClick={formikBag.submitForm}
              >
                <DeleteForeverIcon className={classes.buttonIcon} />
                Withdraw
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

export default withStyles(styles)(UserWithdrawalForm);
