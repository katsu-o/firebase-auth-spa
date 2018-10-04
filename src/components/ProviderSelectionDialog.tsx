import React from 'react';
import ReactDOM from 'react-dom';
import {
  Theme,
  CssBaseline,
  Button,
  IconButton,
  Radio,
  TextField,
  InputAdornment,
  Typography,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Collapse,
  ClickAwayListener,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core';
import { Help as HelpIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@material-ui/icons';
import withRoot from '../utilities/withRoot';
import { Formik, FormikProps, FormikActions, Field, FieldProps } from 'formik';
import { Provider, toProvider } from '../models/Provider';
import IconUtil from '../utilities/IconUtil';

const styles = (theme: Theme) =>
  createStyles({
    form: {
      width: '100%', // Fix IE11 issue.
      marginTop: theme.spacing.unit * 0,
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
    radio: {
      padding: 0,
      marginRight: theme.spacing.unit,
    },
    button: {
      margin: theme.spacing.unit,
      textTransform: 'none',
    },
    dialogTitle: {
      margin: 0,
      padding: theme.spacing.unit * 2,
      borderBottom: 'solid lightgray 1px',
    },
    dialogContent: {
      margin: 0,
      paddingTop: theme.spacing.unit,
      paddingBottom: theme.spacing.unit,
    },
    dialogActions: {
      margin: 0,
      borderTop: 'solid lightgray 1px',
    },
    formDivider: {
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit,
    },
    providerIcon: {
      verticalAlign: 'middle',
      marginRight: 0,
    },
    helpIcon: {
      fontSize: 'small',
      verticalAlign: 'middle',
      color: theme.palette.primary.light,
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      '&:hover': {
        cursor: 'pointer',
      },
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'left',
      padding: `${theme.spacing.unit * 1}px ${theme.spacing.unit * 2}px ${theme.spacing.unit * 1}px`,
      background: theme.palette.grey['200'],
    },
    tooltip: {
      margin: 0,
      padding: 0,
    },
  });

// props from parent
interface IOwnProps extends WithStyles<typeof styles> {
  methods: string[]; // 認証方法
  email: string; // email
  pendingProvider: Provider; // 認証ペンディングプロバイダ
  trustedProvider?: Provider; // Trusted Provider(Google)
  cleanUp: () => void; // Promise 化したダイアログの掃除(DOM から消す)
  resolve: (result: { linkProvider?: Provider; password?: string } | null) => void;
}

// entire props of this component
type Props = IOwnProps; // without redux

// local state of this component
interface State {
  mainHelpOpen: boolean;
  trustedHelpOpen: boolean;
  dialogOpen: boolean;
  passwordVisibility: boolean;
}

// Formik form values
interface FormValues {
  linkProvider: Provider | undefined;
  password: string;
}

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

class ProviderSelectionDialog extends React.Component<Props, State> {
  public state: State = {
    mainHelpOpen: false,
    trustedHelpOpen: false,
    dialogOpen: true,
    passwordVisibility: false,
  };

  public handleSubmit = (values: FormValues) => {
    this.setState({ dialogOpen: false }, () => {
      const result: { linkProvider?: Provider; password?: string } = {
        ...values,
      };
      if ('' === result.password) {
        delete result.password;
      }
      this.props.resolve(result);
      this.props.cleanUp();
    });
  };

  public handleCancel = () => {
    this.setState({ dialogOpen: false }, () => {
      this.props.resolve(null);
      this.props.cleanUp();
    });
  };

  public handleFormikSubmit = (values: FormValues, formikActions: FormikActions<FormValues>) => {
    this.handleSubmit(values);
  };

  public validate = (values: FormValues) => {
    const errors: any = {};
    if (!values.linkProvider) {
      errors.linkProvider = 'Select a provider';
    }
    if (values.linkProvider === 'Password' && !values.password) {
      errors.password = 'Required';
    }
    return errors;
  };

  public renderForm = (formikBag: FormikProps<FormValues>) => {
    const { methods, email, pendingProvider, trustedProvider, classes } = this.props;
    const includingTrustedProvider = trustedProvider && methods.some(method => trustedProvider === toProvider(method));
    const { dialogOpen, mainHelpOpen, trustedHelpOpen, passwordVisibility } = this.state;
    const { linkProvider } = formikBag.values;
    const passwordRequired = Boolean(linkProvider === 'Password');

    const handleListItemClick = (provider: Provider) => (event: React.MouseEvent) => {
      formikBag.setFieldValue('linkProvider', provider);
      formikBag.setFieldTouched('linkProvider');
    };

    const handleOpenHelp = (popover: string) => (event: React.MouseEvent) => {
      const newState: State = {
        ...this.state,
      };
      if (popover === 'Main') {
        newState.mainHelpOpen = true;
      }
      if (popover === 'Trusted') {
        newState.trustedHelpOpen = true;
      }
      this.setState(newState);
    };

    const handleCloseHelp = (popover: string) => (event: React.SyntheticEvent) => {
      const newState: State = {
        ...this.state,
      };
      if (popover === 'Main') {
        newState.mainHelpOpen = false;
      }
      if (popover === 'Trusted') {
        newState.trustedHelpOpen = false;
      }
      this.setState(newState);
    };

    const handleTogglePasswordVisibility = (e: React.MouseEvent) => {
      this.setState({
        ...this.state,
        passwordVisibility: !this.state.passwordVisibility,
      });
    };

    return (
      <Dialog open={dialogOpen} aria-labelledby="form-dialog-title">
        <form className={classes.form} onSubmit={formikBag.handleSubmit}>
          <DialogTitle className={classes.dialogTitle} id="form-dialog-title">
            Select a provider to link
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Typography variant="body1">
              {pendingProvider === 'Password' ? (
                <React.Fragment>
                  Trying to register the account <strong>{email}</strong>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  The account <strong>{email}</strong> is authenticated
                </React.Fragment>
              )}{' '}
              by <strong>{pendingProvider}</strong>, but the account is <strong>already existing</strong> in this
              system.
            </Typography>
            <Typography variant="body1" component="div">
              Select a provider to link:
              <ClickAwayListener onClickAway={handleCloseHelp('Main')}>
                <Tooltip
                  disableFocusListener={true}
                  disableHoverListener={true}
                  disableTouchListener={true}
                  open={mainHelpOpen}
                  onClose={handleCloseHelp('Main')}
                  classes={{ tooltip: classes.tooltip }}
                  title={
                    <Paper className={classes.paper}>
                      <Typography variant="body1">
                        The target account has already registered with providers below.
                      </Typography>
                      <Typography variant="body1">
                        If you want to add the other provider authentication(just now you have tried to register or
                        autheticated), you are required to link with existing account through authentication by either
                        provider below.
                      </Typography>
                    </Paper>
                  }
                  PopperProps={{
                    disablePortal: true,
                  }}
                >
                  <HelpIcon className={classes.helpIcon} onClick={handleOpenHelp('Main')} />
                </Tooltip>
              </ClickAwayListener>
            </Typography>

            <List className={classes.list}>
              {methods.map((method, idx) => {
                const provider: Provider = toProvider(method);
                return (
                  <React.Fragment key={provider}>
                    <ListItem
                      className={classes.listItem}
                      button={true}
                      onClick={handleListItemClick(provider)}
                      disabled={includingTrustedProvider && provider !== trustedProvider}
                    >
                      <Radio
                        className={classes.radio}
                        checked={provider === linkProvider}
                        disabled={includingTrustedProvider && provider !== trustedProvider}
                      />
                      <ListItemIcon>
                        {IconUtil.renderProviderIcon(provider, {
                          className: classes.providerIcon,
                        })}
                      </ListItemIcon>
                      <ListItemText className={classes.listItemText} primary={provider} />
                    </ListItem>
                    {idx < methods.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
            {includingTrustedProvider && (
              <Typography variant="body1" color="primary" component="div">
                Only provider {trustedProvider} can be selected.
                <ClickAwayListener onClickAway={handleCloseHelp('Trusted')}>
                  <Tooltip
                    disableFocusListener={true}
                    disableHoverListener={true}
                    disableTouchListener={true}
                    open={trustedHelpOpen}
                    onClose={handleCloseHelp('Trusted')}
                    classes={{ tooltip: classes.tooltip }}
                    title={
                      <Paper className={classes.paper}>
                        <Typography variant="body1">
                          Provider {trustedProvider} is the only Trusted Provider on this system.
                        </Typography>
                        <Typography variant="body1">
                          If provider {trustedProvider} is included as a provider of your account, used as the link
                          source forcibly.
                        </Typography>
                      </Paper>
                    }
                    PopperProps={{
                      disablePortal: true,
                    }}
                  >
                    <HelpIcon className={classes.helpIcon} onClick={handleOpenHelp('Trusted')} />
                  </Tooltip>
                </ClickAwayListener>
              </Typography>
            )}
            {formikBag.errors.linkProvider && <Typography variant="body1">{formikBag.errors.linkProvider}</Typography>}
            <Collapse in={passwordRequired}>
              <Divider className={classes.formDivider} />
              <Typography>
                Enter password for <strong>{email}</strong>.
              </Typography>
              <Field
                label="Password"
                margin="dense"
                required={passwordRequired}
                fullWidth={true}
                id="password"
                name="password"
                type={passwordVisibility ? 'text' : 'password'}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label="Toggle password visibility" onClick={handleTogglePasswordVisibility}>
                        {passwordVisibility ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                component={CustomTextFieldComponent}
              />
            </Collapse>
          </DialogContent>

          <DialogActions className={classes.dialogActions}>
            <Button
              type="button"
              fullWidth={false}
              variant="raised"
              color="secondary"
              className={classes.button}
              onClick={this.handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth={false}
              variant="raised"
              color="primary"
              className={classes.button}
              disabled={!formikBag.isValid}
            >
              Ok
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  };

  public render(): JSX.Element {
    const iv: FormValues = {
      linkProvider: undefined,
      password: '',
    };

    return (
      <React.Fragment>
        <CssBaseline />
        <Formik
          initialValues={iv}
          validate={this.validate}
          onSubmit={this.handleFormikSubmit}
          render={this.renderForm}
        />
      </React.Fragment>
    );
  }
}

export default withRoot(withStyles(styles)(ProviderSelectionDialog));

// ダイアログを Promise 化して Prompt 的にする
export const promptProviderSelection = (methods: string[], email: string, pendingProvider: Provider) => {
  const PromptDialog = withRoot(withStyles(styles)(ProviderSelectionDialog));
  const wrapper = document.body.appendChild(document.createElement('div'));
  const cleanUp = () => {
    ReactDOM.unmountComponentAtNode(wrapper);
    return setTimeout(() => wrapper.remove());
  };
  const promise = new Promise<{ linkProvider?: Provider; password?: string } | null>((resolve, reject) => {
    try {
      ReactDOM.render(
        <PromptDialog
          methods={methods}
          email={email}
          pendingProvider={pendingProvider}
          trustedProvider="Google"
          cleanUp={cleanUp}
          resolve={resolve}
        />,
        wrapper
      );
    } catch (err) {
      cleanUp();
      reject(err);
      throw err;
    }
  });
  return promise;
};
