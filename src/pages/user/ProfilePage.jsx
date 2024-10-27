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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '../../hooks/useAuth';
import dayjs from 'dayjs';
import { profileStyles } from '../../styles/profileStyles';

const alcoholStrengthOptions = [
  { value: 'strong', label: '強い', icon: '🍺' },
  { value: 'medium', label: '普通', icon: '🍷' },
  { value: 'weak', label: '弱い', icon: '🥂' },
  { value: 'none', label: '飲まない', icon: '🚫' },
];

const genderOptions = [
  { value: 'male', label: '男性', icon: '👨' },
  { value: 'female', label: '女性', icon: '👩' },
  { value: 'other', label: 'その他', icon: '🧑' },
];

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [alcoholStrength, setAlcoholStrength] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
            setUsername(userData.username || currentUser.displayName || '');
            setGender(userData.gender || '');
            setBirthDate(userData.birthDate ? dayjs(userData.birthDate) : null);
            setAlcoholStrength(userData.alcoholStrength || '');
          } else {
            setError('ユーザーデータが見つかりません');
          }
        } catch (err) {
          setError('データの取得中にエラーが発生しました');
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
        const updateData = {
          username,
          gender,
          birthDate: birthDate ? birthDate.toISOString() : null,
          alcoholStrength,
          updatedAt: new Date().toISOString(),
          isProfileComplete: true,
        };

        await updateDoc(doc(db, 'users', currentUser.uid), updateData);
        setUser((prev) => ({ ...prev, ...updateData }));
        setEditMode(false);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } catch (err) {
        setError('更新中にエラーが発生しました');
        console.error('更新エラー:', err);
      }
    }
  };

  const InfoCard = ({ icon: Icon, label, value }) => (
    <Box sx={profileStyles.infoCard}>
      <Icon sx={profileStyles.infoIcon} />
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {label}:
      </Typography>
      <Typography sx={{ ml: 1 }}>{value}</Typography>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="sm" sx={profileStyles.container}>
        <Paper sx={profileStyles.profileCard}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton
              variant="circular"
              width={120}
              height={120}
              sx={{ mx: 'auto' }}
            />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
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
              gap: 3,
            }}
          >
            {/* Avatar section */}
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
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <TextField
                  label="ユーザー名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  sx={profileStyles.textField}
                />

                <FormControl sx={profileStyles.formControl}>
                  <InputLabel>性別</InputLabel>
                  <Select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    label="性別"
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <span>{option.icon}</span>
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <DatePicker
                  label="生年月日"
                  value={birthDate}
                  onChange={(newValue) => setBirthDate(newValue)}
                  sx={profileStyles.datePickerStyle}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />

                <FormControl sx={profileStyles.formControl}>
                  <InputLabel>お酒の強さ</InputLabel>
                  <Select
                    value={alcoholStrength}
                    onChange={(e) => setAlcoholStrength(e.target.value)}
                    label="お酒の強さ"
                  >
                    {alcoholStrengthOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <span>{option.icon}</span>
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
              </Box>
            ) : (
              <Box sx={{ width: '100%' }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    textAlign: 'center',
                    mb: 3,
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {user.username}
                </Typography>

                <InfoCard
                  icon={WcIcon}
                  label="性別"
                  value={
                    genderOptions.find((opt) => opt.value === user.gender)
                      ?.label || '未設定'
                  }
                />

                <InfoCard
                  icon={CakeIcon}
                  label="生年月日"
                  value={
                    birthDate ? birthDate.format('YYYY年MM月DD日') : '未設定'
                  }
                />

                <InfoCard
                  icon={LocalBarIcon}
                  label="お酒の強さ"
                  value={
                    alcoholStrengthOptions.find(
                      (opt) => opt.value === user.alcoholStrength
                    )?.label || '未設定'
                  }
                />
              </Box>
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
