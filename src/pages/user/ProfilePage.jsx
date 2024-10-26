import { Container, Typography, Avatar, Box } from '@mui/material';

const ProfilePage = () => {
  const user = {
    username: 'ユーザー名',
    email: 'user@example.com',
    avatarUrl: 'https://via.placeholder.com/150',
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Avatar src={user.avatarUrl} sx={{ width: 100, height: 100, mb: 2 }} />
        <Typography variant="h5">{user.username}</Typography>
        <Typography variant="body1" color="textSecondary">
          {user.email}
        </Typography>
      </Box>
    </Container>
  );
};

export default ProfilePage;
