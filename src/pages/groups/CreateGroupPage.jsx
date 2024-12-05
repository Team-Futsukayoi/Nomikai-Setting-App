import React, { useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Box, TextField, Button, Typography } from '@mui/material';

function CreateGroupPage() {
  const [groupName, setGroupName] = useState('');
  const { currentUser } = useAuth();

  const createGroup = async () => {
    if (!groupName.trim()) {
      alert('グループ名を入力してください');
      return;
    }

    try {
      await addDoc(collection(db, 'groups'), {
        name: groupName,
        createdAt: new Date(),
        createdBy: currentUser.uid,
        members: [
          {
            uid: currentUser.uid,
            username: currentUser.username,
            role: 'admin',
          },
          // 他のメンバーを追加するロジック
        ],
      });

      setGroupName('');
      alert('グループが作成されました');
    } catch (error) {
      console.error('グループ作成エラー:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        グループ作成
      </Typography>
      <TextField
        fullWidth
        label="グループ名"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="グループ名を入力"
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={createGroup}>
        作成
      </Button>
    </Box>
  );
}

export default CreateGroupPage;