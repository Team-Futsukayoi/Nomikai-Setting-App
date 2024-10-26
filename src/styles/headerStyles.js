import { alpha } from '@mui/material/styles';

const headerStyles = {
  appBar: {
    background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
    boxShadow: 'none',
  },
  menuButton: {
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'rotate(90deg)',
    },
  },
  drawer: {
    '& .MuiDrawer-paper': {
      background: 'linear-gradient(to bottom, #FFF8E1, #FFFFFF)',
      borderTopLeftRadius: '20px',
      borderBottomLeftRadius: '20px',
    },
  },
  menuHeader: {
    background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
    color: 'white',
    padding: '20px',
    borderTopLeftRadius: '20px',
  },
  listItem: {
    margin: '8px 16px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: alpha('#FFD700', 0.15),
      transform: 'translateX(5px)',
    },
  },
  listItemIcon: {
    color: '#FFA500',
    minWidth: '40px',
  },
  logoutItem: {
    margin: '8px 16px',
    borderRadius: '12px',
    color: '#FF6B6B',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: alpha('#FF6B6B', 0.1),
      transform: 'translateX(5px)',
    },
  },
};

export default headerStyles;
