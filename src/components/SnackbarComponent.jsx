import { Snackbar, Alert } from '@mui/material';

const SnackbarComponent = ({ open, message, handleClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        position: 'fixed',
        bottom: '90px',
        zIndex: 1100,
      }}
    >
      <Alert
        onClose={handleClose}
        severity="success"
        sx={{
          width: '100%',
          backgroundColor: '#FFD700',
          color: '#000',
          '& .MuiAlert-icon': {
            color: '#000',
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarComponent;
