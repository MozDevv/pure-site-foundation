import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // <-- disables uppercase
        },
      },
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(var(--primary))',
      contrastText: 'hsl(var(--primary-foreground))',
    },
    secondary: {
      main: 'hsl(var(--secondary))',
      contrastText: 'hsl(var(--secondary-foreground))',
    },
    background: {
      default: 'hsl(var(--background))',
      paper: 'hsl(var(--card))',
    },
    text: {
      primary: 'hsl(var(--foreground))',
      secondary: 'hsl(var(--muted-foreground))',
    },
    error: {
      main: 'hsl(var(--destructive))',
      contrastText: 'hsl(var(--destructive-foreground))',
    },
    success: {
      main: 'hsl(var(--success))',
      contrastText: 'hsl(var(--success-foreground))',
    },
    warning: {
      main: 'hsl(var(--warning))',
      contrastText: 'hsl(var(--warning-foreground))',
    },
    info: {
      main: 'hsl(var(--accent))',
      contrastText: 'hsl(var(--accent-foreground))',
    },
  },

  typography: {
    fontFamily: [
      'Inter', // or your Tailwind font
      'ui-sans-serif',
      'system-ui',
      'sans-serif',
    ].join(','),
  },
});

export default theme;
