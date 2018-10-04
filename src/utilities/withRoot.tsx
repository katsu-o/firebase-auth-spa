import * as React from 'react';
import { MuiThemeProvider, createMuiTheme, CssBaseline } from '@material-ui/core';
import { blue, green, red } from '@material-ui/core/colors';

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: green,
    error: red,
  },
});

const withRoot = <P extends {}>(Component: React.ComponentType<P>) => {
  const WithRoot = (props: P) => {
    // MuiThemeProvider makes the theme available down the React tree
    // thanks to React context.
    return (
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...props} />
      </MuiThemeProvider>
    );
  };
  return WithRoot;
};

export default withRoot;
