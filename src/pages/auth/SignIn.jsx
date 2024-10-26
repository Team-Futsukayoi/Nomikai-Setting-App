import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <Container
      maxWidth="xs"
      sx={{ py: { xs: 3, md: 6 }, display: 'flex', justifyContent: 'center' }}
    >
      <Stack spacing={8} sx={{ width: '100%', alignItems: 'center' }}>
        <Box textAlign="center">
          <Typography variant="h4" color="primary" gutterBottom>
            飲み会管理アプリ
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
    </Container>
  );
};

export default SignIn;
