import { useState } from 'react';
import { Container, Typography } from '@mui/material';
import SnackbarComponent from '../components/SnackbarComponent';

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
      <SnackbarComponent
        open={open}
        message="ログインに成功しました"
        handleClose={handleClose}
        bottomOffset="80px"
        autoHideDuration={3000} // 確認: 正しく設定されている
      />
      <Typography variant="h4" color="primary" gutterBottom>
        ログイン成功
      </Typography>
      <Typography>おめでとうございます！ログインに成功しました。</Typography>
    </Container>
  );
};

export default SuccessPage;
