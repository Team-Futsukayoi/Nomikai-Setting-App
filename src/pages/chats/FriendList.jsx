// FriendList.jsx
import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import { StyledPaper, StyledButton } from '../../styles/chatlistpageStyles';

export const FriendList = ({ friendList }) => {
  return (
    <StyledPaper>
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 600,
            color: 'primary.dark',
          }}
        >
          フレンドリスト
        </Typography>
        <List sx={{ width: '100%' }}>
          {friendList.map(({ id, name, iconUrl, isGroop }) => {
            if (!isGroop) {
              return (
                <React.Fragment key={id}>
                  <ListItem
                    alignItems="center"
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 215, 0, 0.08)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt={name}
                        src={iconUrl}
                        sx={{
                          width: 50,
                          height: 50,
                          border: 2,
                          borderColor: 'primary.light',
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 500 }}
                        >
                          {name}
                        </Typography>
                      }
                    />
                    <StyledButton
                      variant="outlined"
                      startIcon={<ChatBubbleOutline />}
                      onClick={() => console.log('ChatListへの遷移')}
                      sx={{
                        minWidth: 140,
                        borderRadius: 20,
                      }}
                    >
                      チャット開始
                    </StyledButton>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              );
            }
            return null;
          })}
        </List>
      </Box>
    </StyledPaper>
  );
};

export default FriendList;
