import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { authStyles } from '../../styles/authStyles';
import { initializeOneSignal } from '../../services/notifications/oneSignal';

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation for all required fields
    if (!email || !password || !userId || !username) {
      setError('すべての項目を入力してください');
      setLoading(false);
      return;
    }

    try {
      const userIdDoc = await getDoc(doc(db, 'userIds', userId));
      if (userIdDoc.exists()) {
        setError('このユーザーIDは既に使用されています。');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // OneSignalの初期化と通知許可の取得
      const oneSignalUserId = await initializeOneSignal();

      // Firestoreにユーザー情報を保存
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        userId: userId,
        username: username,
        createdAt: new Date(),
        isProfileComplete: false,
        oneSignalUserId: oneSignalUserId,
      });

      await setDoc(doc(db, 'userIds', userId), { uid: user.uid });

      setTimeout(() => {
        setSuccessMessage('');
        navigate('/', {
          state: { successMessage: 'アカウントが作成されました。' },
        });
      }, 1000);
    } catch (error) {
      console.log('Error:', error.code);
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

  const isSmallScreen = useMediaQuery('(max-width:375px)');
  return (
    <Box sx={authStyles.gradientBackground}>
      <Container maxWidth={isSmallScreen ? 'xs' : 'sm'}>
        <Stack spacing={4} sx={{ width: '100%', alignItems: 'center' }}>
          <Box sx={authStyles.formContainer}>
            <Typography variant="h5" sx={authStyles.gradientText}>
              のみっと！へようこそ🍻
            </Typography>
            <Typography variant="body5" sx={{ mb: 4, color: 'text.secondary' }}>
              アカウントを作成して仲間と乾杯しましょう！
            </Typography>

            <Box sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="ユーザー名（表示名）"
                  type="text"
                  fullWidth
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={authStyles.input}
                  helperText="チャットやグループで表示される名前です"
                />
                <TextField
                  label="ユーザーID（一意の識別子）"
                  type="text"
                  fullWidth
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  sx={authStyles.input}
                  helperText="他のユーザーがあなたを見つけるために使用されます"
                />
                <TextField
                  label="ユールアドレス"
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
