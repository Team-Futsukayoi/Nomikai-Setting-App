import React, { useState } from 'react';
import { TextField, Button, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
}));

const GroupForm = () => {
  const { currentUser } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleCreateGroup = async () => {
    try {
      const newGroup = {
        name: groupName,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        members: [{
          uid: currentUser.uid,
          role: 'admin'
        }]
      };

      await addDoc(collection(db, 'groups'), newGroup);
      setGroupName('');
      // 成功時の処理（例：通知やリダイレクト）
    } catch (error) {
      console.error('グループ作成エラー:', error);
      // エラー時の処理
    }
  };

  return (
    <StyledPaper>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="グループ名"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
        />
        <Button 
          variant="contained" 
          onClick={handleCreateGroup}
          disabled={!groupName.trim()}
        >
          グループを作成
        </Button>
      </Box>
    </StyledPaper>
  );
};

export default GroupForm;