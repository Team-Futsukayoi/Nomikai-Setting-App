import { Box, IconButton, Fab } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import navbarStyles from '../styles/navbarStyles';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  // パスに基づいて選択された値を更新
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/home')) setValue(0);
    else if (path.includes('/chatlist')) setValue(1);
    else if (path.includes('/events')) setValue(2);
    else if (path.includes('/profile')) setValue(3);
  }, [location]);

  const navigationItems = [
    { label: 'ホーム', icon: HomeRoundedIcon, path: '/home' },
    { label: 'チャット', icon: ChatRoundedIcon, path: '/chatlist' },
    { label: 'イベント', icon: EventRoundedIcon, path: '/events' },
    { label: 'プロフィール', icon: AccountCircleRoundedIcon, path: '/profile' },
  ];

  const CurrentIcon = navigationItems[value].icon;

  return (
    <Box sx={navbarStyles.container}>
      <Box sx={navbarStyles.navigation}>
        {navigationItems.map((item, index) => (
          <IconButton
            key={item.label}
            onClick={() => {
              setValue(index);
              navigate(item.path);
            }}
            sx={navbarStyles.iconButton}
          >
            <item.icon
              sx={{
                ...navbarStyles.icon,
                color: value === index ? '#DAA520' : '#B8860B',
              }}
            />
          </IconButton>
        ))}
        <Fab sx={navbarStyles.selectedButton}>
          <AnimatePresence mode="wait">
            <motion.div
              key={value}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CurrentIcon sx={{ color: '#FFFFFF', fontSize: 28 }} />
            </motion.div>
          </AnimatePresence>
        </Fab>
      </Box>
    </Box>
  );
};

export default NavigationBar;
