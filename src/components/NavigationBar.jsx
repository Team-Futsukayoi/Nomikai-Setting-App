import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const NavigationBar = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(0);

  return (
    <BottomNavigation
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
        if (newValue === 0) navigate('/home');
        else if (newValue === 1) navigate('/chat');
        else if (newValue === 2) navigate('/events');
        else if (newValue === 3) navigate('/profile');
      }}
      showLabels
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: '#f9f9f9',
        zIndex: 1000,
        '& .Mui-selected': {
          color: '#FFA500',
        },
        '& .MuiBottomNavigationAction-label': {
          fontSize: '0.75rem',
        },
      }}
    >
      <BottomNavigationAction
        label="ホーム"
        icon={<HomeIcon sx={{ color: '#FFA500' }} />}
        sx={{
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem', // プロフィールのラベルサイズを変更
          },
        }}
      />
      <BottomNavigationAction
        label="チャット"
        icon={<ChatIcon sx={{ color: '#FFA500' }} />} // アイコンの色を変更
        sx={{
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem', // プロフィールのラベルサイズを変更
          },
        }}
      />
      <BottomNavigationAction
        label="イベント"
        icon={<EventIcon sx={{ color: '#FFA500' }} />} // アイコンの色を変更
        sx={{
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem', // プロフィールのラベルサイズを変更
          },
        }}
      />
      <BottomNavigationAction
        label="プロフィール"
        icon={<AccountCircleIcon sx={{ color: '#FFA500' }} />}
        sx={{
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem', // プロフィールのラベルサイズを変更
          },
        }}
      />
    </BottomNavigation>
  );
};

export default NavigationBar;
