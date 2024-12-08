import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Chip,
  CircularProgress,
  Box
} from '@mui/material';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const CreateGroupModal = ({ open, onClose, currentUser, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      const currentUserMember = {
        uid: currentUser.uid,
        userId: currentUser.userId,
        username: currentUser.username,
        role: 'admin'
      };
      setGroupMembers([currentUserMember]);
    } else {
      setGroupMembers([]);
      setGroupName('');
      setMemberId('');
    }
  }, [open, currentUser]);

  const handleAddMember = async () => {
    if (!memberId.trim()) return;

    if (memberId.trim() === currentUser.userId) {
      alert('自分自身を追加することはできません');
      setMemberId('');
      return;
    }

    if (groupMembers.some(m => m.userId === memberId.trim())) {
      alert('既に追加されているメンバーです');
      setMemberId('');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '==', memberId.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setGroupMembers([...groupMembers, {
          userId: memberId.trim(),
          username: userData.username,
          uid: querySnapshot.docs[0].id,
          role: 'member'
        }]);
        setMemberId('');
      } else {
        alert('ユーザーが見つかりません');
      }
    } catch (error) {
      console.error('メンバー追加エラー:', error);
      alert('メンバーの追加に失敗しました');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || groupMembers.length === 0) {
      alert('グループ名とメンバーを入力してください');
      return;
    }

    setIsCreating(true);
    try {
      const newGroup = {
        name: groupName.trim(),
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        members: [
          {
            uid: currentUser.uid,
            userId: currentUser.userId,
            username: currentUser.username,
            role: 'admin'
          },
          ...groupMembers
        ],
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'groups'), newGroup);
      onGroupCreated();
      onClose();
    } catch (error) {
      console.error('グループ作成エラー:', error);
      alert('グループの作成に失敗しました');
    } finally {
      setIsCreating(false);
      setGroupName('');
      setGroupMembers([]);
    }
  };

  const handleDeleteMember = (memberUserId) => {
    if (memberUserId === currentUser.userId) {
      alert('グループ作成者は削除できません');
      return;
    }
    setGroupMembers(members => members.filter(m => m.userId !== memberUserId));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>新しいグループを作成</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="グループ名"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            variant="outlined"
          />
          
          <Box>
            <TextField
              label="メンバーのユーザーID"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              fullWidth
              variant="outlined"
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

          {groupMembers.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                メンバー:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {groupMembers.map((member) => (
                  <Chip
                    key={member.userId}
                    label={`${member.username}${member.role === 'admin' ? ' (管理者)' : ''}`}
                    onDelete={member.role === 'admin' ? undefined : () => handleDeleteMember(member.userId)}
                    color={member.role === 'admin' ? 'primary' : 'default'}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          キャンセル
        </Button>
        <Button
          onClick={handleCreateGroup}
          color="primary"
          variant="contained"
          disabled={isCreating || !groupName.trim() || groupMembers.length === 0}
        >
          {isCreating ? <CircularProgress size={24} /> : 'グループを作成'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};