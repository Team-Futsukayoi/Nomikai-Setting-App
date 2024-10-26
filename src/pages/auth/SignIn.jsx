import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom/dist';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setOpen(true);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      navigate('/success');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container
      maxWidth="xs"
      sx={{ py: { xs: 3, md: 6 }, display: 'flex', justifyContent: 'center' }}
    >
      <Stack spacing={8} sx={{ width: '100%', alignItems: 'center' }}>
        <Box textAlign="center">
          <Typography variant="h4" color="primary" gutterBottom>
            飲み会セッティング
          </Typography>
          <Typography color="textSecondary">アカウントにサインイン</Typography>
        </Box>

        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            backgroundColor: 'white',
            p: 4,
            borderRadius: 1,
            boxShadow: 1,
            border: 1,
            borderColor: 'grey.100',
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <TextField
                label="メールアドレス"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="パスワード"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  '&:hover': { backgroundColor: '#FFC107' },
                }}
                size="large"
                fullWidth
              >
                サインイン
              </Button>
            </Stack>
          </form>
        </Box>
        <Typography>
          アカウントをお持ちでない方は
          <Button
            component={RouterLink}
            to="/signup"
            variant="text"
            color="primary"
            sx={{ ml: 1 }}
          >
            新規登録
          </Button>
        </Typography>
      </Stack>

      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SignIn;
