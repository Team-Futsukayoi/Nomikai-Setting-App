import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  FormControl,
  Typography,
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { db, auth } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WcIcon from '@mui/icons-material/Wc';
import CakeIcon from '@mui/icons-material/Cake';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import LiquorIcon from '@mui/icons-material/Liquor';
import styles from '../../styles/userAttributesPageStyles';

const UserAttributesPage = () => {
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [drinkingLevel, setDrinkingLevel] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        const drinkingLevelMap = {
          0: 'weak',
          50: 'medium',
          100: 'strong',
        };

        const userData = {
          username: user.displayName || '', // Firebaseの認証情報からユーザー名を取得
          email: user.email,
          gender,
          birthDate: birthdate, // ISO形式の文字列として保存
          alcoholStrength: drinkingLevelMap[drinkingLevel],
          isProfileComplete: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
        navigate('/time-and-location', {
          state: { animation: 'slide-left' },
        });
      }
    } catch (error) {
      console.error('プロフィールの保存に失敗しました:', error);
    }
  };

  const drinkingLevelMarks = [
    {
      value: 0,
      label: '初心者',
      icon: <SportsBarIcon />,
      description: 'お酒はあまり飲めません',
    },
    {
      value: 50,
      label: '中級者',
      icon: <LocalBarIcon />,
      description: '適度に楽しめます',
    },
    {
      value: 100,
      label: '上級者',
      icon: <LiquorIcon />,
      description: 'お酒には自信があります',
    },
  ];

  const getActiveLevel = () => {
    if (drinkingLevel <= 25) return 0;
    if (drinkingLevel <= 75) return 1;
    return 2;
  };

  return (
    <Container maxWidth="sm" sx={{ ...styles.container, mt: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={0} sx={styles.paper}>
          <Box sx={styles.headerSection}>
            <Typography variant="h4" sx={styles.title}>
              プロフィール設定
            </Typography>
            <Typography variant="body1" sx={styles.subtitle}>
              あなたに合った飲み会を見つけましょう
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={styles.formSection}>
              <Box sx={styles.sectionHeader}>
                <WcIcon sx={styles.sectionIcon} />
                <Typography variant="h6" sx={styles.sectionTitle}>
                  性別
                </Typography>
              </Box>

              <ToggleButtonGroup
                value={gender}
                exclusive
                onChange={(e, value) => setGender(value)}
                aria-label="gender"
                sx={styles.toggleGroup}
              >
                <ToggleButton
                  value="male"
                  aria-label="male"
                  sx={styles.toggleButton}
                >
                  <PersonIcon sx={styles.toggleIcon} />
                  <Typography sx={styles.toggleText}>男性</Typography>
                </ToggleButton>
                <ToggleButton
                  value="female"
                  aria-label="female"
                  sx={styles.toggleButton}
                >
                  <PersonOutlineIcon sx={styles.toggleIcon} />
                  <Typography sx={styles.toggleText}>女性</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={styles.formSection}>
              <Box sx={styles.sectionHeader}>
                <CakeIcon sx={styles.sectionIcon} />
                <Typography variant="h6" sx={styles.sectionTitle}>
                  生年月日
                </Typography>
              </Box>

              <FormControl fullWidth sx={styles.formControl}>
                <TextField
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  sx={styles.dateField}
                  InputProps={{
                    sx: styles.input,
                  }}
                />
              </FormControl>
            </Box>

            <Box sx={styles.formSection}>
              <Box sx={styles.sectionHeader}>
                <LocalBarIcon sx={styles.sectionIcon} />
                <Typography variant="h6" sx={styles.sectionTitle}>
                  お酒の強さ
                </Typography>
              </Box>

              <Box sx={styles.drinkingLevelContainer}>
                {drinkingLevelMarks.map((mark, index) => (
                  <motion.div
                    key={mark.value}
                    animate={{
                      scale: getActiveLevel() === index ? 1.1 : 1,
                      opacity: getActiveLevel() === index ? 1 : 0.7,
                    }}
                    style={styles.levelIcon}
                  >
                    <Box sx={styles.iconWrapper}>
                      {React.cloneElement(mark.icon, {
                        sx: {
                          ...styles.drinkIcon,
                          color:
                            getActiveLevel() === index ? '#FFD700' : '#DAA520',
                        },
                      })}
                    </Box>
                    <Typography sx={styles.levelLabel}>{mark.label}</Typography>
                    <Typography sx={styles.levelDescription}>
                      {mark.description}
                    </Typography>
                  </motion.div>
                ))}
              </Box>

              <Slider
                value={drinkingLevel}
                onChange={(e, value) => setDrinkingLevel(value)}
                step={null}
                marks={drinkingLevelMarks}
                sx={styles.slider}
              />
            </Box>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={styles.submitButton}
                endIcon={<LocalBarIcon />}
              >
                プロフィールを保存
              </Button>
            </motion.div>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default UserAttributesPage;
