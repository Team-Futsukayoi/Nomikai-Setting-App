import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth'; // これを追加
import headerStyles from '../styles/headerStyles';


const Header = () => {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setOpen(open);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  const menuItems = [
    { text: 'ホーム', icon: <HomeIcon />, onClick: () => navigate('/home') },
    {
      text: 'チャット',
      icon: <ChatIcon />,
      onClick: () => navigate('/chatlist'),
    },
    {
      text: 'イベント',
      icon: <EventIcon />,
      onClick: () => navigate('/events'),
    },
    {
      text: 'プロフィール',
      icon: <PersonIcon />,
      onClick: () => navigate('/profile'),
    },
  ];

  // Firebaseの認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // ユーザー情報を更新
      if (!user) {
        navigate('/signin'); // ユーザーがログインしていない場合はサインインページにリダイレクト
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <>
      <AppBar position="fixed" sx={headerStyles.appBar}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#ffffff',
                background: 'linear-gradient(45deg, #000000 30%, #333333 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              飲み会セッティング
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={headerStyles.menuButton}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* スペーサー */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        sx={headerStyles.drawer}
      >
        <Box
          sx={{
            width: 280,
            height: '100%',
          }}
          role="presentation"
        >
          <Box sx={headerStyles.menuHeader}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              メニュー
            </Typography>
            {user && (
              <Typography variant="body1" sx={{ padding: '16px', color: '#000' }}>
                ログインしています: {user.email}
              </Typography>
            )}
          </Box>

          <List sx={{ mt: 2 }}>
            {menuItems.map((item) => (
              <ListItem
                key={item.text}
                button
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                sx={headerStyles.listItem}
              >
                <ListItemIcon sx={headerStyles.listItemIcon}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    sx: { fontWeight: 500 },
                  }}
                />
              </ListItem>
            ))}

            <Divider sx={{ my: 2 }} />

            <ListItem
              button
              onClick={handleLogout}
              sx={headerStyles.logoutItem}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="ログアウト"
                primaryTypographyProps={{
                  sx: { fontWeight: 500 },
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
