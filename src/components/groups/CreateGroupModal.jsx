import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export const CreateGroupModal = ({
  open,
  onClose,
  currentUser,
  onGroupCreated,
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const usernameQuery = query(
        usersRef,
        where('username', '>=', searchTerm),
        where('username', '<=', searchTerm + '\uf8ff')
      );
      const userIdQuery = query(
        usersRef,
        where('userId', '>=', searchTerm),
        where('userId', '<=', searchTerm + '\uf8ff')
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
    }
    setLoading(false);
  };

  const handleToggleUser = (user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateGroup = async () => {
    try {
      if (!groupName.trim() || selectedUsers.length === 0) return;

      const newGroup = {
        name: groupName.trim(),
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        members: [
          {
            uid: currentUser.uid,
            userId: currentUser.userId || 'unknown',
            username: currentUser.username || 'unknown',
            role: 'admin',
          },
          ...selectedUsers.map((user) => ({
            uid: user.id,
            userId: user.userId,
            username: user.username,
            role: 'member',
          })),
        ],
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'groups'), newGroup);

      if (onGroupCreated) {
        onGroupCreated();
      }

      setSelectedUsers([]);
      setGroupName('');
      setSearchResults([]);
      setSearchTerm('');
      onClose();
    } catch (error) {
      console.error('グループ作成エラー:', error);
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
          グループを作成
        </Typography>

        <TextField
          fullWidth
          label="グループ名"
          variant="outlined"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
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

        <TextField
          fullWidth
          label="ユーザー検索"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
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
          InputProps={{
            endAdornment: (
              <SearchIcon
                sx={{
                  color: '#FFD700',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#FFC400',
                  },
                }}
                onClick={handleSearch}
              />
            ),
          }}
        />

        {selectedUsers.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {selectedUsers.map((user) => (
              <Chip
                key={user.id}
                avatar={
                  <Avatar sx={{ bgcolor: '#FFD700' }}>
                    {user.username?.[0]}
                  </Avatar>
                }
                label={user.username}
                onDelete={() => handleToggleUser(user)}
                sx={{
                  m: 0.5,
                  borderRadius: '8px',
                  bgcolor: '#FFF',
                  border: '1px solid #FFD700',
                  color: '#333',
                  '& .MuiChip-deleteIcon': {
                    color: '#666',
                    '&:hover': {
                      color: '#333',
                    },
                  },
                }}
              />
            ))}
          </Stack>
        )}

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
              const isSelected = selectedUsers.some((u) => u.id === user.id);
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
                    onClick={() => handleToggleUser(user)}
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
          onClick={handleCreateGroup}
          disabled={!groupName || selectedUsers.length === 0}
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
          グループを作成
        </Button>
      </Box>
    </Modal>
  );
};
