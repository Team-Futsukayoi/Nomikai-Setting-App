import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const AddFriendModal = ({ open, onClose, currentUser, onFriendAdded }) => {
  const [newFriendId, setNewFriendId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newFriendId.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '==', newFriendId.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('ユーザーが見つかりません');
        return;
      }

      const friendUser = querySnapshot.docs[0];
      const friendId = friendUser.id;

      if (friendId === currentUser.uid) {
        alert('自分自身をフレンドに追加することはできません');
        return;
      }

      // フレンド関係の確認と追加
      const friendsRef = collection(db, 'friends');
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(query(
          friendsRef,
          where('userId', '==', currentUser.uid),
          where('friendId', '==', friendId)
        )),
        getDocs(query(
          friendsRef,
          where('userId', '==', friendId),
          where('friendId', '==', currentUser.uid)
        ))
      ]);

      if (!snapshot1.empty || !snapshot2.empty) {
        alert('すでにフレンドです');
        return;
      }

      // フレンド追加
      await Promise.all([
        addDoc(collection(db, 'friends'), {
          userId: currentUser.uid,
          friendId: friendId,
          createdAt: serverTimestamp(),
        }),
        addDoc(collection(db, 'friends'), {
          userId: friendId,
          friendId: currentUser.uid,
          createdAt: serverTimestamp(),
        })
      ]);

      onFriendAdded();
      onClose();
    } catch (error) {
      console.error('フレンド追加エラー:', error);
      alert('フレンド追加に失敗しました');
    } finally {
      setIsSubmitting(false);
      setNewFriendId('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>フレンドを追加</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="ユーザーID"
          type="text"
          fullWidth
          variant="outlined"
          value={newFriendId}
          onChange={(e) => setNewFriendId(e.target.value)}
          placeholder="追加したいユーザーのIDを入力"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          キャンセル
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={isSubmitting || !newFriendId.trim()}
        >
          {isSubmitting ? <CircularProgress size={24} /> : '追加'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 