import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import GroupForm from '../../components/groups/GroupForm';

const CreateGroupPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          グループを作成
        </Typography>
        <GroupForm />
      </Box>
    </Container>
  );
};

export default CreateGroupPage;