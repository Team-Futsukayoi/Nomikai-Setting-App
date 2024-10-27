export const profileStyles = {
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
    marginTop: 1,
  },
  actionButton: {
    borderRadius: '12px',
    padding: '10px 24px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    marginTop: 2,
  },
  saveButton: {
    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
    color: '#000',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
    },
  },
  infoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    marginTop: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 215, 0, 0.2)',
    },
  },
  infoIcon: {
    color: '#FFA500',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: '8px',
    borderRadius: '50%',
  },
  formControl: {
    width: '100%',
    marginTop: 1,
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
  datePickerStyle: {
    width: '100%',
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
};
