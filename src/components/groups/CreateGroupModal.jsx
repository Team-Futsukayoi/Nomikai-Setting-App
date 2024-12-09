import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
} from '@mui/material';

export const CreateGroupModal = ({
  open,
  onClose,
  currentUser,
  onGroupCreated,
  friendList = [],
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');

  const handleToggle = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleCreateGroup = () => {
    onGroupCreated({ groupName, members: selectedUsers });
    setSelectedUsers([]);
    setGroupName('');
    onClose();
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
          グループを作成
        </Typography>
        <TextField
          fullWidth
          label="グループ名"
          variant="outlined"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Typography variant="subtitle1" sx={{ mb: 2, color: '#333' }}>
          メンバーを追加
        </Typography>
        {friendList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              フレンドがいません
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 150, overflowY: 'auto', mb: 3 }}>
            {friendList.map((friend) => (
              <ListItem key={friend.id} dense disablePadding>
                <ListItemButton onClick={() => handleToggle(friend.id)}>
                  <Checkbox
                    edge="start"
                    checked={selectedUsers.includes(friend.id)}
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      color: '#FFD700',
                      '&.Mui-checked': {
                        color: '#FFD700',
                      },
                    }}
                  />
                  <ListItemText primary={friend.username} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
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
            '&.Mui-disabled': {
              bgcolor: '#FFE566',
              color: 'white',
            },
          }}
          onClick={handleCreateGroup}
          disabled={!groupName || selectedUsers.length === 0}
        >
          作成
        </Button>
      </Box>
    </Modal>
  );
};
