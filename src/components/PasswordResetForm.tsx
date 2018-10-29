import * as React from 'react';
import {
  Button,
  CssBaseline,
  Paper,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Theme,
  createStyles,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { Send as SendIcon } from '@material-ui/icons';
import { Formik, FormikProps, FormikActions, Field, FieldProps } from 'formik';
// import Yup from 'yup';
import { isValidEmail, isGmail } from '../utilities/misc';

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing.unit * 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: `${theme.spacing.unit * 0}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 1}px`,
    },
    form: {
      width: '100%', // Fix IE11 issue.
      marginTop: theme.spacing.unit * 0,
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
    providerIcon: {
      verticalAlign: 'middle',
      marginRight: theme.spacing.unit,
    },
    annotation: {
      marginTop: theme.spacing.unit * 1,
      textAlign: 'left',
    },
    caution: {
      marginTop: theme.spacing.unit * 1,
      textAlign: 'left',
    },
    cautionHeading: {
      color: theme.palette.error.main,
      fontWeight: 'bold',
    },
  });

// props from parent
interface IOwnProps extends WithStyles<typeof styles> {
  onSendPasswordResetEmail: (email: string) => void;
  onGoBack: () => void;
  submitting?: boolean;
}

// local state of this component
interface State {}

// entire props of this component
type Props = IOwnProps & State;

// Formik form values
interface FormValues {
  email: string;
  confirmed: boolean;
}

const validate = (values: FormValues) => {
  const errors: any = {};
  if (!values.confirmed) {
    errors.confirmed = 'Required';
  }
  if (!values.email) {
    errors.email = 'Required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Invalid email address';
  } else if (isGmail(values.email)) {
    // パスワードリセットメールのリンクからパスワードを変更すると、
    // そのアカウントに紐づく認証プロバイダは Email & Password 以外全て解除される。
    // つまり @gmail.com でありながら Google 認証が存在しないアカウントとなる。
    // この状態で再度 Google 認証で Sign In すると Google 認証が勝手に紐づいてしまうため、これを避ける。
    // 運用ポリシー: Sign In でプロバイダ認証の追加はさせない。
    errors.email = '@gmail.com is not allowed(It should be able to Sign In with Google)';
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

const CustomCheckboxComponent = ({ field, form, ...props }: FieldProps<FormValues>) => (
  <Checkbox
    checked={field.value}
    onChange={form.handleChange}
    onBlur={form.handleBlur}
    disabled={form.isSubmitting}
    {...props}
  />
);

const PasswordResetForm = (props: Props) => {
  const { classes, onSendPasswordResetEmail, onGoBack, submitting } = props;

  const iv: FormValues = {
    confirmed: false,
    email: '',
  };

  const handleFormikSubmit = (values: FormValues, formikActions: FormikActions<FormValues>) => {
    // フォーム側では状態管理しない
    formikActions.setSubmitting(false);

    // リセット
    formikActions.resetForm(iv);
    onSendPasswordResetEmail(values.email);
  };

  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    onGoBack();
  };

  const render = (formikBag: FormikProps<FormValues>) => {
    return (
      <Paper className={classes.paper}>
        <React.Fragment>
          <Typography variant="h6">Reset password</Typography>
          <Typography className={classes.annotation}>
            Enter your email address and click [Send Password Reset Email]. We will send you a link to reset your
            password.{' '}
            {!submitting && (
              <a href="#goback" onClick={handleGoBack}>
                Go Back
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
              component={CustomTextFieldComponent}
            />
            <Typography className={classes.caution}>
              <span className={classes.cautionHeading}>Caution: The side effect of password reset</span>
              <div>
                &nbsp; If you changed your password from the link url in password reset email to be sent later, all
                links to the authentication providers associated with this account will be canceled.
              </div>
              <div>
                &nbsp; If you can sign in using a method other than password authentication, we strongly recommend that
                you change the password from the Settings after signing in using that method.
              </div>
            </Typography>
            <FormControlLabel
              label="I agree to this side effect."
              control={<Field id="confirmed" name="confirmed" color="primary" component={CustomCheckboxComponent} />}
            />
            <Button
              type="submit"
              fullWidth={true}
              variant="contained"
              color="secondary"
              className={classes.submit}
              disabled={!formikBag.isValid}
            >
              <SendIcon className={classes.providerIcon} />
              Send Password Reset Email
            </Button>
          </form>
        </React.Fragment>
      </Paper>
    );
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Formik initialValues={iv} validate={validate} onSubmit={handleFormikSubmit} render={render} />
    </React.Fragment>
  );
};

export default withStyles(styles)(PasswordResetForm);
