import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const AddFriendModal = ({
  open,
  onClose,
  currentUser,
  onFriendAdded,
}) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleAddFriend = async () => {
    try {
      if (!username.trim()) return;

      // ユーザー名で検索
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('ユーザーが見つかりません');
        return;
      }

      const friendDoc = querySnapshot.docs[0];
      const friendId = friendDoc.id;

      // 自分自身は追加できない
      if (friendId === currentUser.uid) {
        setError('自分自身をフレンドに追加することはできません');
        return;
      }

      // すでにフレンドかチェック
      const friendsRef = collection(db, 'friends');
      const friendCheckQuery = query(
        friendsRef,
        where('userId', '==', currentUser.uid),
        where('friendId', '==', friendId)
      );
      const friendCheckSnapshot = await getDocs(friendCheckQuery);

      if (!friendCheckSnapshot.empty) {
        setError('すでにフレンドに追加されています');
        return;
      }

      // フレンドを追加
      await addDoc(collection(db, 'friends'), {
        userId: currentUser.uid,
        friendId: friendId,
        createdAt: new Date(),
      });

      onFriendAdded();
      setUsername('');
      setError('');
      onClose();
    } catch (error) {
      console.error('フレンド追加エラー:', error);
      setError('フレンドの追加に失敗しました');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          p: 4,
          borderRadius: 3,
          outline: 'none',
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
          フレンドを追加
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          label="ユーザー名"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{
            bgcolor: '#FFD700',
            color: 'white',
            py: 1.5,
            '&:hover': {
              bgcolor: '#FFC400',
            },
          }}
          onClick={handleAddFriend}
        >
          追加
        </Button>
      </Box>
    </Modal>
  );
};
