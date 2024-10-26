import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { authStyles } from '../../styles/authStyles';
import SnackbarComponent from '../../components/SnackbarComponent';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      navigate('/success');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={authStyles.gradientBackground}>
      <Container maxWidth="sm">
        <Stack spacing={4} sx={{ width: '100%', alignItems: 'center' }}>
          <Box sx={authStyles.formContainer}>
            <Typography variant="h4" sx={authStyles.gradientText}>
              かんぱい！🍻
            </Typography>
            <Typography variant="body4" sx={{ mb: 4, color: 'text.secondary' }}>
              サインインして仲間と乾杯しましょう！
            </Typography>

            <Box sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="メールアドレス"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={authStyles.input}
                />
                <TextField
                  label="パスワード"
                  type="password"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={authStyles.input}
                />

                {error && (
                  <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={authStyles.submitButton}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: '#000' }} />
                  ) : (
                    'サインイン'
                  )}
                </Button>
              </Stack>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                アカウントをお持ちでない方は
                <Button
                  component={RouterLink}
                  to="/signup"
                  sx={{
                    ...authStyles.linkButton,
                    textTransform: 'none',
                    fontWeight: 600,
                    ml: 1,
                  }}
                >
                  新規登録
                </Button>
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Container>

      <SnackbarComponent
        open={open}
        message={successMessage}
        handleClose={handleClose}
      />
    </Box>
  );
};

export default SignIn;
