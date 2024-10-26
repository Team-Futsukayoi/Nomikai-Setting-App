import React from 'react';
import {
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from '@mui/material';

export const FriendPage = ({ friendList }) => {
  return (
    <Box sx={{ maxWidth: 600, margin: 'auto' }}>
      {/* フレンドリストのタイトル */}
      <Typography variant="h5" gutterBottom>
        フレンドリスト
      </Typography>

      {/* フレンドリストの表示 */}
      <List>
        {friendList.map(({ id, name, iconUrl, isGroop }) => {
          // グループでない場合のみ表示
          if (!isGroop) {
            return (
              <ListItem key={id} alignItems="flex-start" sx={{ mb: 2 }}>
                {/* フレンドのアイコン */}
                <ListItemAvatar>
                  <Avatar alt={name} src={iconUrl} />
                </ListItemAvatar>
                {/* フレンドの名前とチャット開始ボタン */}
                <ListItemText
                  primary={name}
                  secondary={
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => console.log('ChatListへの遷移')}
                      sx={{ mt: 1 }}
                    >
                      チャットを開始
                    </Button>
                  }
                />
              </ListItem>
            );
          }
          return null;
        })}
      </List>
    </Box>
  );
};

export default FriendPage;
