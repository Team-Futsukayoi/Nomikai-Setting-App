const navbarStyles = {
  container: {
    position: 'fixed',
    bottom: 16,
    left: 0,
    right: 0,
    zIndex: 1000,
    bgcolor: 'transparent',
  },
  navigation: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
    borderRadius: '32px',
    backgroundColor: '#FFEBBA',
    padding: '0 24px',
    maxWidth: '450px',
    margin: '0 auto',
  },
  iconButton: {
    color: '#B8860B',
    '&:hover': {
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
  },
  icon: {
    fontSize: 24,
  },
  selectedButton: {
    position: 'absolute',
    top: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#FFD700',
    width: '60px',
    height: '60px',
    '&:hover': {
      backgroundColor: '#FFD700',
    },
    boxShadow: '0 4px 10px rgba(218, 165, 32, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default navbarStyles;
