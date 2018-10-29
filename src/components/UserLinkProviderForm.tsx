import * as React from 'react';
import {
  Button,
  IconButton,
  CssBaseline,
  Divider,
  Paper,
  Radio,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Typography,
  Theme,
  createStyles,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import classNames from 'classnames';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
} from '@material-ui/icons';
import { Formik, FormikProps, FormikActions, Field, FieldProps } from 'formik';
// import Yup from 'yup';
import { ISigningInfo } from '../models/SigningInfo';
import { UserInfo } from '../models/UserInfo';
import { AuthProvider } from '../models/AuthProvider';
import AuthUtil from '../utilities/AuthUtil';
import IconUtil from '../utilities/IconUtil';
import { isGmail } from '../utilities/misc';

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
    list: {
      width: '100%',
      borderRadius: '2px',
      display: 'inline-block',
      margin: 0,
      paddingTop: 0,
      paddingBottom: 0,
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    },
    listItem: {
      paddingLeft: theme.spacing.unit * 2,
      paddingRight: theme.spacing.unit * 2,
      paddingTop: theme.spacing.unit,
      paddingBottom: theme.spacing.unit,
    },
    listItemText: {
      margin: 0,
    },
    listItemTextLinked: {
      margin: 0,
      color: theme.palette.primary.main,
      wordWrap: 'break-word',
    },
    radio: {
      padding: 0,
      marginRight: theme.spacing.unit,
    },
    divider: {
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit,
    },
    submit: {
      marginTop: theme.spacing.unit,
      marginLeft: theme.spacing.unit * 0,
      marginRight: theme.spacing.unit,
      textTransform: 'none',
    },
    submitUnlink: {
      backgroundColor: theme.palette.error.main,
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
    },
    buttonIcon: {
      verticalAlign: 'middle',
      marginRight: theme.spacing.unit,
    },
    bannedReason: {
      marginTop: theme.spacing.unit * 1,
      marginRight: theme.spacing.unit * 1,
    },
  });

// props from parent
interface IOwnProps extends WithStyles<typeof styles> {
  authenticatedUser: UserInfo;
  authenticatedUserTimestamp?: number;
  onAddLink: (signing: ISigningInfo) => void;
  onRemoveLink: (signing: ISigningInfo) => void;
  authProviders: AuthProvider[];
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
  selectedAuthProvider: AuthProvider | undefined;
  isLinked: boolean;
  passwordVisibility: boolean;
  pseudo: number; // for form reset
}

const validate = (values: FormValues) => {
  const errors: any = {};

  // selectedProvider === 'Password' && isLinked === false の時だけ、パスワードチェック
  if (values.selectedAuthProvider === 'Password' && !values.isLinked) {
    if (!values.password) {
      errors.password = 'Required';
    } else if (values.password.length < 6) {
      errors.password = 'At least 6 characters';
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

const UserLinkProviderForm = (props: Props) => {
  const {
    classes,
    authenticatedUser,
    submitting,
    authenticatedUserTimestamp,
    authProviders,
    onAddLink,
    onRemoveLink,
    disabled,
  } = props;
  const authenticated = Boolean(authenticatedUser);

  const iv: FormValues = {
    password: '',
    selectedAuthProvider: undefined,
    isLinked: false,
    passwordVisibility: false,
    pseudo: authenticatedUserTimestamp || 0,
  };

  const preventFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleFormikSubmit = (values: FormValues, formikActions: FormikActions<FormValues>) => {
    // フォーム側では状態管理しない
    formikActions.setSubmitting(false);

    const signing: ISigningInfo = {
      userName: null,
      email: authenticatedUser ? authenticatedUser.email : null,
      password: values.password,
      authProvider: values.selectedAuthProvider || null,
    };

    // 条件分岐
    values.isLinked ? onRemoveLink(signing) : onAddLink(signing);
  };

  const render = (formikBag: FormikProps<FormValues>) => {
    const { selectedAuthProvider } = formikBag.values;

    // リンク済みの認証プロバイダが 1 つかどうか
    const isOnlyOneProviderLink =
      authenticatedUser && authenticatedUser.providerData ? authenticatedUser.providerData.length === 1 : false;

    // 辻褄の合わないアカウントとして更新しようとしているか否か
    // ※仮にこれで更新すると、@gmail.com でありながら Google 認証が存在しないアカウントとなる。
    //   この状態で再度 Google 認証で Sign In すると Google 認証が勝手に紐づいてしまうため、これを避ける。
    //   運用ポリシー: Sign In でプロバイダ認証の追加はさせない。
    // 1. リンク済みの Gmail 認証を選択している
    // 2. アカウントの Email アドレスが @gmail.com
    const isInconsistentAccountToBeUpdated =
      selectedAuthProvider === 'Google' &&
      AuthUtil.isLinkedAuthProvider(authenticatedUser, 'Google') &&
      (authenticatedUser && authenticatedUser.email && isGmail(authenticatedUser.email))
        ? true
        : false;

    // リンク解除禁止是非
    const isRemoveLinkBanned = isOnlyOneProviderLink || isInconsistentAccountToBeUpdated;

    // リンク解除を禁止する場合のメッセージ
    const bannedReason = isOnlyOneProviderLink
      ? 'Since it is the last one, can not be deleted.'
      : isInconsistentAccountToBeUpdated
        ? "If the account's email address is @gmail.com, you can not cancel Google authentication."
        : '';

    const handleTogglePasswordVisibility = (e: React.MouseEvent) => {
      formikBag.setFieldValue('passwordVisibility', !formikBag.values.passwordVisibility);
    };

    const handleListItemClick = (authProvider: AuthProvider) => (event: React.MouseEvent) => {
      formikBag.setFieldValue('selectedAuthProvider', selectedAuthProvider !== authProvider ? authProvider : undefined);
      formikBag.setFieldTouched('selectedAuthProvider');
      formikBag.setFieldValue('isLinked', AuthUtil.isLinkedAuthProvider(authenticatedUser, authProvider));
      formikBag.setFieldTouched('isLinked');
    };

    const submitClassname = classNames(classes.submit, {
      [classes.submitUnlink]:
        selectedAuthProvider && AuthUtil.isLinkedAuthProvider(authenticatedUser, selectedAuthProvider),
    });

    return (
      <Paper className={classes.paper}>
        <Typography variant="h6" className={classes.chapterHeading}>
          Providers
        </Typography>
        <form className={classes.form} onSubmit={preventFormSubmit}>
          <Grid container={true} direction="row" justify="flex-start" alignItems="center">
            <Grid item={true} xs={12}>
              <List className={classes.list}>
                {authProviders.map((provider, idx) => {
                  const isLinked = AuthUtil.isLinkedAuthProvider(authenticatedUser, provider);
                  const userInfo = AuthUtil.getAuthProviderUserInfo(authenticatedUser, provider);

                  return (
                    <React.Fragment key={provider}>
                      <ListItem
                        className={classes.listItem}
                        button={true}
                        onClick={handleListItemClick(provider)}
                        disabled={disabled}
                      >
                        <Grid container={true} direction="row" justify="space-between" alignItems="center">
                          <Grid item={true}>
                            <Radio
                              className={classes.radio}
                              checked={provider === selectedAuthProvider}
                              disabled={disabled}
                            />
                          </Grid>
                          <Grid item={true}>
                            <ListItemIcon className={classes.buttonIcon}>
                              {IconUtil.renderAuthProviderIcon(provider)}
                            </ListItemIcon>
                          </Grid>
                          <Grid item={true} xs={3}>
                            <ListItemText className={classes.listItemText} primary={provider} />
                          </Grid>
                          <Grid item={true} xs={3}>
                            <ListItemText
                              classes={{ primary: classes.listItemTextLinked }}
                              primary={isLinked ? userInfo && userInfo.email : ''}
                              secondary={isLinked ? userInfo && userInfo.displayName : ''}
                            />
                          </Grid>
                          <Grid item={true} xs={2}>
                            <ListItemText
                              classes={{ primary: classes.listItemTextLinked }}
                              primary={isLinked ? 'Linked' : ''}
                            />
                          </Grid>
                        </Grid>
                      </ListItem>
                      {idx < authProviders.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            </Grid>
          </Grid>
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
                disabled={
                  !authenticated ||
                  submitting ||
                  disabled ||
                  (selectedAuthProvider !== 'Password' || AuthUtil.isLinkedAuthProvider(authenticatedUser, 'Password'))
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        disabled={
                          !authenticated ||
                          submitting ||
                          disabled ||
                          (selectedAuthProvider !== 'Password' ||
                            AuthUtil.isLinkedAuthProvider(authenticatedUser, 'Password'))
                        }
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
            {selectedAuthProvider &&
              isRemoveLinkBanned && (
                <Grid item={true}>
                  <Typography variant="caption" className={classes.bannedReason}>
                    {bannedReason}
                  </Typography>
                </Grid>
              )}
            <Grid item={true}>
              <Button
                type="button"
                fullWidth={true}
                variant="contained"
                color="primary"
                className={submitClassname}
                disabled={
                  !authenticated ||
                  submitting ||
                  !formikBag.isValid ||
                  disabled ||
                  !selectedAuthProvider ||
                  (selectedAuthProvider && isRemoveLinkBanned)
                }
                onClick={formikBag.submitForm}
              >
                {selectedAuthProvider && AuthUtil.isLinkedAuthProvider(authenticatedUser, selectedAuthProvider) ? (
                  <React.Fragment>
                    <LinkOffIcon className={classes.buttonIcon} />
                    Unlink
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <LinkIcon className={classes.buttonIcon} />
                    Link
                  </React.Fragment>
                )}
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

export default withStyles(styles)(UserLinkProviderForm);
