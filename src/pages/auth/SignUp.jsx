import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { authStyles } from '../../styles/authStyles';

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation for email and password
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccessMessage('アカウントが作成されました。');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/', {
          state: { successMessage: 'アカウントが作成されました。' },
        });
      }, 3000);
    } catch (error) {
      // Firebaseエラーを日本語に翻訳
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('このメールアドレスは既に使用されています。');
          break;
        case 'auth/invalid-email':
          setError('無効なメールアドレスです。');
          break;
        case 'auth/operation-not-allowed':
          setError('この操作は許可されていません。');
          break;
        case 'auth/weak-password':
          setError('パスワードが弱すぎます。');
          break;
        default:
          setError('アカウント作成に失敗しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={authStyles.gradientBackground}>
      <Container maxWidth="sm">
        <Stack spacing={4} sx={{ width: '100%', alignItems: 'center' }}>
          <Box sx={authStyles.formContainer}>
            <Typography variant="h4" sx={authStyles.gradientText}>
              ようこそ！🍻
            </Typography>
            <Typography variant="body4" sx={{ mb: 4, color: 'text.secondary' }}>
              アカウントを作成して仲間と乾杯しましょう！
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

                {successMessage && (
                  <Alert severity="success" sx={{ borderRadius: '12px' }}>
                    {successMessage}
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
                    '登録する'
                  )}
                </Button>
              </Stack>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                すでにアカウントをお持ちの方は
                <Button
                  component={RouterLink}
                  to="/signin"
                  sx={{
                    ...authStyles.linkButton,
                    textTransform: 'none',
                    fontWeight: 600,
                    ml: 1,
                  }}
                >
                  サインイン
                </Button>
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default SignUp;
