import { Theme, createStyles } from '@material-ui/core';

export const createDefaultStyles = (theme: Theme) => {
  return createStyles({
    root: {
      textAlign: 'center',
      paddingTop: theme.spacing.unit * 8,
    },
  });
};
