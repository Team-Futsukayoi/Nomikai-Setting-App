import { useState } from 'react';
import { Alert, Container, Typography, Snackbar } from '@mui/material';

const SuccessPage = () => {
  const [open, setOpen] = useState(true);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: { xs: 3, md: 6 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          ログインに成功しました！
        </Alert>
      </Snackbar>
      <Typography variant="h4" color="primary" gutterBottom>
        ログイン成功
      </Typography>
      <Typography>おめでとうございます！ログインに成功しました。</Typography>
    </Container>
  );
};

export default SuccessPage;
