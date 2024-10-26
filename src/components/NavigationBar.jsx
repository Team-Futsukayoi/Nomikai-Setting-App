import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import navbarStyles from '../styles/navbarStyles';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  // パスに基づいて選択された値を更新
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/home')) setValue(0);
    else if (path.includes('/chat')) setValue(1);
    else if (path.includes('/events')) setValue(2);
    else if (path.includes('/profile')) setValue(3);
  }, [location]);

  const navigationItems = [
    { label: 'ホーム', icon: HomeRoundedIcon, path: '/home' },
    { label: 'チャット', icon: ChatRoundedIcon, path: '/chatlist' },
    { label: 'イベント', icon: EventRoundedIcon, path: '/events' },
    { label: 'プロフィール', icon: AccountCircleRoundedIcon, path: '/profile' },
  ];

  return (
    <Box sx={navbarStyles.container}>
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          navigate(navigationItems[newValue].path);
        }}
        showLabels
        sx={navbarStyles.navigation}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={<item.icon sx={navbarStyles.icon} />}
            sx={navbarStyles.actionButton}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
};

export default NavigationBar;
