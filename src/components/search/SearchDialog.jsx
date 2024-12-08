import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
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
  Divider,
  CircularProgress,
  AvatarGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

export const SearchDialog = ({ 
  open, 
  onClose, 
  friendList, 
  groupList, 
  onSelectFriend, 
  onSelectGroup 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    friends: [],
    groups: []
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ friends: [], groups: [] });
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();

    // フレンドの検索
    const matchedFriends = friendList.filter(friend => 
      friend.username?.toLowerCase().includes(query) || 
      friend.userId?.toLowerCase().includes(query)
    );

    // グループの検索
    const matchedGroups = groupList.filter(group => 
      group.name?.toLowerCase().includes(query) ||
      group.members?.some(member => 
        member.username?.toLowerCase().includes(query) ||
        member.userId?.toLowerCase().includes(query)
      )
    );

    setSearchResults({
      friends: matchedFriends,
      groups: matchedGroups
    });
    setIsSearching(false);
  }, [searchQuery, friendList, groupList]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <SearchIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flex: 1 }}>検索</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          placeholder="ユーザー名、ID、またはグループ名で検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {isSearching ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : searchQuery ? (
          <>
            {/* フレンド検索結果 */}
            {searchResults.friends.length > 0 && (
              <>
                <Typography variant="subtitle1" color="primary" sx={{ mt: 2, mb: 1 }}>
                  フレンド
                </Typography>
                <List>
                  {searchResults.friends.map((friend) => (
                    <ListItem 
                      key={friend.id}
                      button
                      onClick={() => {
                        onSelectFriend(friend.friendId);
                        onClose();
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={friend.icon} alt={friend.username}>
                          {friend.username?.[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={friend.username}
                        secondary={`ID: ${friend.userId}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {/* グループ検索結果 */}
            {searchResults.groups.length > 0 && (
              <>
                <Typography variant="subtitle1" color="primary" sx={{ mt: 2, mb: 1 }}>
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
                    >
                      <ListItemAvatar>
                        <AvatarGroup max={3} sx={{ width: 40, height: 40 }}>
                          {group.members.map((member, index) => (
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
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {/* 検索結果なし */}
            {searchResults.friends.length === 0 && searchResults.groups.length === 0 && (
              <Box textAlign="center" py={3}>
                <Typography color="text.secondary">
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