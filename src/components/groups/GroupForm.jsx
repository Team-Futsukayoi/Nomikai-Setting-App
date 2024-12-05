import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Chip,
  Stack,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { StyledPaper, StyledTextField, StyledButton } from '../../styles/chatlistpageStyles';
import { useAuth } from '../../hooks/useAuth';

const GroupForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [members, setMembers] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const checkUserExists = async (userId) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // ユーザーデータを取得
        const userData = querySnapshot.docs[0].data();
        return {
          exists: true,
          username: userData.username,
          uid: querySnapshot.docs[0].id
        };
      }
      return { exists: false };
    } catch (error) {
      console.error('ユーザー確認エラー:', error);
      return { exists: false, error };
    }
  };

  const handleAddMember = async () => {
    if (memberId.trim() && !members.some(m => m.userId === memberId.trim())) {
      const userCheck = await checkUserExists(memberId.trim());
      
      if (userCheck.exists) {
        setMembers([...members, {
          userId: memberId.trim(),
          username: userCheck.username,
          uid: userCheck.uid
        }]);
        setMemberId('');
        setSnackbar({
          open: true,
          message: 'メンバーを追加しました',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'ユーザーが存在しません',
          severity: 'error'
        });
      }
    }
  };

  const handleRemoveMember = (memberToRemove) => {
    setMembers(members.filter(member => member.userId !== memberToRemove.userId));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCreateGroup = async () => {
    try {
      if (!groupName.trim() || members.length === 0) return;

      // グループデータの作成
      const newGroup = {
        name: groupName.trim(),
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        members: [
          {
            uid: currentUser.uid,
            userId: currentUser.userId || 'unknown',
            username: currentUser.username || 'unknown',
            role: 'admin'
          },
          ...members.map(member => ({
            uid: member.uid,
            userId: member.userId || 'unknown',
            username: member.username || 'unknown',
            role: 'member'
          }))
        ],
        updatedAt: serverTimestamp()
      };

      // Firestoreにグループを追加
      const docRef = await addDoc(collection(db, 'groups'), newGroup);

      setSnackbar({
        open: true,
        message: 'グループを作成しました',
        severity: 'success'
      });

      // 少し待ってからリダイレクト
      setTimeout(() => {
        navigate('/chatlist');
      }, 1500);

    } catch (error) {
      console.error('グループ作成エラー:', error);
      setSnackbar({
        open: true,
        message: 'グループの作成に失敗しました',
        severity: 'error'
      });
    }
  };

  return (
    <StyledPaper>
      <Stack spacing={3}>
        <TextField
          label="グループ名"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
        />
        
        <Box>
          <TextField
            label="メンバーのユーザーID"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            fullWidth
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddMember();
              }
            }}
          />
          <Button 
            onClick={handleAddMember}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            メンバーを追加
          </Button>
        </Box>

        {members.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              追加されたメンバー:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {members.map((member) => (
                <Chip
                  key={member.userId}
                  label={`${member.username} (${member.userId})`}
                  onDelete={() => handleRemoveMember(member)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        <StyledButton 
          variant="contained"
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || members.length === 0}
        >
          グループを作成
        </StyledButton>
      </Stack>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

export default GroupForm;