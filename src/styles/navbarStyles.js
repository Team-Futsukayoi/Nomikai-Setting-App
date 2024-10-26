const navbarStyles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '10px',
    background: 'transparent',
    zIndex: 1000,
  },
  navigation: {
    height: '65px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    mx: 'auto',
    maxWidth: '450px',
    '& .MuiBottomNavigationAction-root': {
      minWidth: 'auto',
      padding: '6px 0',
      color: 'rgba(0, 0, 0, 0.4)',
      '&.Mui-selected': {
        color: '#000',
      },
    },
    '& .MuiBottomNavigationAction-label': {
      fontSize: '0.675rem',
      transition: 'all 0.3s ease',
      '&.Mui-selected': {
        fontSize: '0.75rem',
      },
    },
  },
  actionButton: {
    position: 'relative',
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      bottom: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '0',
      height: '3px',
      borderRadius: '3px',
      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
      transition: 'width 0.3s ease',
    },
    '&.Mui-selected::before': {
      width: '20px',
    },
  },
  icon: {
    transition: 'transform 0.3s ease, color 0.3s ease',
    fontSize: '24px',
    '.Mui-selected &': {
      transform: 'scale(1.1)',
      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
};

export default navbarStyles;
