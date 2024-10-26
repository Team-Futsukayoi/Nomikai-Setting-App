export const authStyles = {
  gradientBackground: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
  },

  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '3rem',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(255, 215, 0, 0.2)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
  },

  input: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover fieldset': {
        borderColor: '#FFD700',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: '2px',
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#FFD700 !important',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#FFD700',
    },
  },

  submitButton: {
    borderRadius: '12px',
    padding: '12px',
    background: 'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)',
    textTransform: 'none',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#000',
    '&:hover': {
      background: 'linear-gradient(45deg, #FFA500 0%, #FFD700 100%)',
    },
  },

  linkButton: {
    color: '#FFD700',
    '&:hover': {
      color: '#FFA500',
    },
  },

  gradientText: {
    fontWeight: 700,
    marginBottom: '8px',
    background: 'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)',
    backgroundClip: 'text',
    textFillColor: 'transparent',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
};
