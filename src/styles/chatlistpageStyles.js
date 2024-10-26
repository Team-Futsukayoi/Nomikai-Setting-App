import { createTheme, styled } from '@mui/material';
import { Button, Paper, TextField } from '@mui/material'; // コンポーネントのインポートを追加

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FFD700',
      light: '#FFE44D',
      dark: '#CCAC00',
    },
    secondary: {
      main: '#FFF9C4',
    },
    background: {
      default: '#FFFEF2',
    },
  },
});

// Paperのスタイリング
export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

// Buttonのスタイリング
export const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: '10px 30px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.2)',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(255, 215, 0, 0.3)',
  },
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.dark,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  },
  '&.MuiButton-outlined': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.dark,
    '&:hover': {
      backgroundColor: 'rgba(255, 215, 0, 0.08)',
      borderColor: theme.palette.primary.dark,
    },
  },
}));

// TextFieldのスタイリング
export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));
