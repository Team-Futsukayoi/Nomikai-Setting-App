import { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  Container,
  Typography,
  Avatar,
  Box,
  TextField,
  Button,
  Paper,
  Skeleton,
  IconButton,
  Fade,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../hooks/useAuth';

const profileStyles = {
  container: {
    mt: 4,
    mb: 8,
  },
  profileCard: {
    borderRadius: '20px',
    padding: '2rem',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)',
  },
  avatarWrapper: {
    position: 'relative',
    margin: '0 auto',
    width: 120,
    height: 120,
    '&::after': {
      content: '""',
      position: 'absolute',
      top: -3,
      left: -3,
      right: -3,
      bottom: -3,
      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
      borderRadius: '50%',
      zIndex: 0,
    },
  },
  avatar: {
    width: 120,
    height: 120,
    border: '4px solid white',
    position: 'relative',
    zIndex: 1,
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  editButton: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    backgroundColor: '#FFD700',
    color: '#000',
    '&:hover': {
      backgroundColor: '#FFA500',
    },
    zIndex: 2,
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      '&:hover fieldset': {
        borderColor: '#FFD700',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#FFA500',
      },
    },
  },
  actionButton: {
    borderRadius: '12px',
    padding: '10px 24px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'all 0.3s ease',
  },
  saveButton: {
    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
    color: '#000',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
    },
  },
};

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
            setUsername(userDoc.data().username || '');
          } else {
            setError('ユーザーデータが見つかりません');
          }
        } catch (err) {
          setError('データの取得中にエラーが発生しました');
          // eslint-disable-next-line no-console
          console.error('Firestoreエラー:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [currentUser]);

  const handleUpdate = async () => {
    if (currentUser && username.trim()) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          username,
        });
        setUser((prev) => ({ ...prev, username }));
        setEditMode(false);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } catch (err) {
        setError('更新中にエラーが発生しました');
        // eslint-disable-next-line no-console
        console.error('更新エラー:', err);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={profileStyles.container}>
        <Paper sx={profileStyles.profileCard}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Skeleton variant="circular" width={120} height={120} />
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="text" width={150} height={30} />
            <Skeleton variant="text" width={250} height={25} />
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={profileStyles.container}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={profileStyles.container}>
      <Fade in={true} timeout={800}>
        <Paper sx={profileStyles.profileCard}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Box sx={profileStyles.avatarWrapper}>
              <Avatar
                src={user.avatarUrl}
                sx={profileStyles.avatar}
                alt={user.username}
              />
              <IconButton
                size="small"
                sx={profileStyles.editButton}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? <CloseIcon /> : <EditIcon />}
              </IconButton>
            </Box>

            {editMode ? (
              <TextField
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                label="ユーザー名"
                fullWidth
                sx={profileStyles.textField}
                autoFocus
                InputLabelProps={{
                  style: { color: '#FFB347' },
                }}
              />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {user.username}
              </Typography>
            )}

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                background: 'rgba(255, 215, 0, 0.1)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontWeight: 500,
              }}
            >
              {user.email}
            </Typography>

            {editMode && (
              <Button
                variant="contained"
                onClick={handleUpdate}
                sx={{
                  ...profileStyles.actionButton,
                  ...profileStyles.saveButton,
                }}
                startIcon={<CheckIcon />}
              >
                保存する
              </Button>
            )}

            {updateSuccess && (
              <Alert
                severity="success"
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#000',
                }}
              >
                プロフィールを更新しました
              </Alert>
            )}
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default ProfilePage;
