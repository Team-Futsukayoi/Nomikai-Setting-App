import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccessMessage('アカウントが作成されました。');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/');
      }, 5000);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{ py: { xs: 3, md: 6 }, display: 'flex', justifyContent: 'center' }}
    >
      <Stack spacing={8} sx={{ width: '100%', alignItems: 'center' }}>
        <Box textAlign="center">
          <Typography variant="h4" color="primary" gutterBottom>
            新規登録
          </Typography>
          <Typography color="textSecondary">アカウントを作成</Typography>
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
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
              {successMessage && (
                <Typography color="success" variant="body2">
                  {successMessage}
                </Typography>
              )}
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
                登録
              </Button>
            </Stack>
          </form>
        </Box>

        <Typography>
          すでにアカウントをお持ちの方は
          <Button
            component={RouterLink}
            to="/signin"
            variant="text"
            color="primary"
            sx={{ ml: 1 }}
          >
            サインイン
          </Button>
        </Typography>
      </Stack>
    </Container>
  );
};

export default SignUp;