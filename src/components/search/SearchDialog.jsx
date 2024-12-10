import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  IconButton,
  InputAdornment,
  AvatarGroup,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export const SearchDialog = ({
  open,
  onClose,
  friendList,
  groupList,
  onSelectFriend,
  onSelectGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    friends: [],
    groups: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ friends: [], groups: [] });
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();

    const matchedFriends = friendList.filter(
      (friend) =>
        friend.username?.toLowerCase().includes(query) ||
        friend.userId?.toLowerCase().includes(query)
    );

    const matchedGroups = groupList.filter(
      (group) =>
        group.name?.toLowerCase().includes(query) ||
        group.members?.some(
          (member) =>
            member.username?.toLowerCase().includes(query) ||
            member.userId?.toLowerCase().includes(query)
        )
    );

    setSearchResults({
      friends: matchedFriends,
      groups: matchedGroups,
    });
    setIsSearching(false);
  }, [searchQuery, friendList, groupList]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            flex: 1,
            fontWeight: 700,
            color: '#333',
            fontSize: '1.5rem',
          }}
        >
          検索
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#666',
            '&:hover': {
              bgcolor: 'rgba(255, 215, 0, 0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <TextField
          autoFocus
          fullWidth
          placeholder="ユーザー名、ID、またはグループ名で検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#FFD700' }} />
              </InputAdornment>
            ),
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
          }}
        />

        {isSearching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} sx={{ color: '#FFD700' }} />
          </Box>
        ) : searchQuery ? (
          <>
            {searchResults.friends.length > 0 && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mt: 2,
                    mb: 1,
                    color: '#666',
                    fontWeight: 600,
                  }}
                >
                  フレンド
                </Typography>
                <List sx={{ mb: 2 }}>
                  {searchResults.friends.map((friend) => (
                    <ListItem
                      key={friend.id}
                      button
                      onClick={() => {
                        onSelectFriend(friend.friendId);
                        onClose();
                      }}
                      sx={{
                        borderRadius: '8px',
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'rgba(255, 215, 0, 0.05)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={friend.icon}
                          alt={friend.username}
                          sx={{ bgcolor: '#f5f5f5', color: '#666' }}
                        >
                          {friend.username?.[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={friend.username}
                        secondary={`ID: ${friend.userId}`}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: '#333',
                            fontWeight: 500,
                          },
                          '& .MuiListItemText-secondary': {
                            color: '#666',
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {searchResults.groups.length > 0 && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mt: 2,
                    mb: 1,
                    color: '#666',
                    fontWeight: 600,
                  }}
                >
                  グループ
                </Typography>
                <List>
                  {searchResults.groups.map((group) => (
                    <ListItem
                      key={group.id}
                      button
                      onClick={() => {
                        onSelectGroup(group.id);
                        onClose();
                      }}
                      sx={{
                        borderRadius: '8px',
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'rgba(255, 215, 0, 0.05)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <AvatarGroup
                          max={3}
                          sx={{
                            width: 40,
                            height: 40,
                            '& .MuiAvatar-root': {
                              borderColor: '#fff',
                              bgcolor: '#f5f5f5',
                              color: '#666',
                            },
                          }}
                        >
                          {group.members.map((member) => (
                            <Avatar
                              key={member.uid}
                              src={member.icon}
                              alt={member.username}
                            >
                              {member.username?.[0]}
                            </Avatar>
                          ))}
                        </AvatarGroup>
                      </ListItemAvatar>
                      <ListItemText
                        primary={group.name}
                        secondary={`${group.members.length}人のメンバー`}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: '#333',
                            fontWeight: 500,
                          },
                          '& .MuiListItemText-secondary': {
                            color: '#666',
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {searchResults.friends.length === 0 &&
              searchResults.groups.length === 0 && (
                <Box textAlign="center" py={3}>
                  <Typography sx={{ color: '#666' }}>
                    検索結果が見つかりませんでした
                  </Typography>
                </Box>
              )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
