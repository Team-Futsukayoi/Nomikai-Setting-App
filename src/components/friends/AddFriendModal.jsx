import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export const AddFriendModal = ({
  open,
  onClose,
  currentUser,
  onFriendAdded,
}) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) {
      setError('ユーザーが見つかりません');
      return;
    }

    const searchUsers = async () => {
      if (!username.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const usersRef = collection(db, 'users');

        const usernameQuery = query(
          usersRef,
          where('username', '>=', username.trim()),
          where('username', '<=', username.trim() + '\uf8ff')
        );

        const userIdQuery = query(
          usersRef,
          where('userId', '>=', username.trim()),
          where('userId', '<=', username.trim() + '\uf8ff')
        );

        const [usernameSnapshot, userIdSnapshot] = await Promise.all([
          getDocs(usernameQuery),
          getDocs(userIdQuery),
        ]);

        const results = new Map();

        [...usernameSnapshot.docs, ...userIdSnapshot.docs].forEach((doc) => {
          if (doc.id !== currentUser.uid) {
            results.set(doc.id, {
              id: doc.id,
              ...doc.data(),
            });
          }
        });

        setSearchResults(Array.from(results.values()));
      } catch (error) {
        console.error('ユーザー検索エラー:', error);
        setError('ユーザーの検索に失敗しました');
      }
      setLoading(false);
    };

    if (!username.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(searchUsers, 500);
    return () => clearTimeout(timeoutId);
  }, [username, currentUser?.uid]);

  const handleAddFriend = async () => {
    try {
      if (!selectedUser) return;

      const friendsRef = collection(db, 'friends');
      const friendCheckQuery = query(
        friendsRef,
        where('userId', '==', currentUser.uid),
        where('friendId', '==', selectedUser.id)
      );
      const friendCheckSnapshot = await getDocs(friendCheckQuery);

      if (!friendCheckSnapshot.empty) {
        setError('すでにフレンドに追加されています');
        return;
      }

      await addDoc(collection(db, 'friends'), {
        userId: currentUser.uid,
        friendId: selectedUser.id,
        createdAt: new Date(),
      });

      onFriendAdded();
      setUsername('');
      setSelectedUser(null);
      setError('');
      onClose();
    } catch (error) {
      console.error('フレンド追加エラー:', error);
      setError('フレンドの追加に失敗しました');
    }
  };

  if (!currentUser?.uid) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 400,
          bgcolor: '#FFFFFF',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          p: 4,
          borderRadius: '24px',
          outline: 'none',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 4,
            fontWeight: 700,
            color: '#333',
            textAlign: 'center',
            fontSize: '1.5rem',
          }}
        >
          フレンドを追加
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: '12px',
            }}
          >
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="ユーザー名またはユーザーIDを検索"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '& fieldset': {
                borderColor: '#FFD700',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: '#FFD700',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#FFD700',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#666',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#FFD700',
            },
          }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} sx={{ color: '#FFD700' }} />
          </Box>
        ) : (
          <List
            sx={{
              maxHeight: 200,
              overflowY: 'auto',
              mb: 3,
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#FFD700',
                borderRadius: '4px',
              },
            }}
          >
            {searchResults.map((user) => {
              const isSelected = selectedUser?.id === user.id;
              return (
                <ListItem
                  key={user.id}
                  disablePadding
                  sx={{
                    mb: 1,
                    bgcolor: isSelected
                      ? 'rgba(255, 215, 0, 0.1)'
                      : 'transparent',
                    borderRadius: '8px',
                  }}
                >
                  <ListItemButton
                    onClick={() => setSelectedUser(user)}
                    sx={{
                      borderRadius: '8px',
                      '&:hover': {
                        bgcolor: isSelected
                          ? 'rgba(255, 215, 0, 0.15)'
                          : 'rgba(255, 215, 0, 0.05)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: isSelected ? '#FFD700' : '#f5f5f5',
                          color: isSelected ? '#FFF' : '#666',
                        }}
                      >
                        {user.username?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.username}
                      secondary={user.userId}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: '#333',
                          fontWeight: isSelected ? 600 : 400,
                        },
                        '& .MuiListItemText-secondary': {
                          color: '#666',
                        },
                      }}
                    />
                    {isSelected && <PersonAddIcon sx={{ color: '#FFD700' }} />}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleAddFriend}
          disabled={!selectedUser}
          sx={{
            bgcolor: '#FFD700',
            color: '#333',
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#FFC400',
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              bgcolor: '#f5f5f5',
              color: '#999',
            },
          }}
        >
          フレンドに追加
        </Button>
      </Box>
    </Modal>
  );
};
