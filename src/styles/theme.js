import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFC107', // 黄色
      light: '#FFE082',
      dark: '#FFA000',
    },
    secondary: {
      main: '#FF9800', // オレンジ
    },
    background: {
      default: '#FFFDE7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;