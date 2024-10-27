import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import { StyledPaper, StyledButton } from '../../styles/chatlistpageStyles';
import { Link } from 'react-router-dom';

export const FriendList = ({ friendList }) => {
  console.log("FriendList component received:", friendList);
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
        <List sx={{ width: '100%', maxHeight: '300px', overflowY: 'auto' }}> {/* maxHeightとoverflowYを追加 */}
          {friendList && friendList.length > 0 ? (
            friendList.map(({ id, username, userId, icon }) => (
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
                      alt={username || `ID: ${userId}`}
                      src={icon}
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
                        {username || `No Name (ID: ${userId})`}
                      </Typography>
                    }
                  />
                  <Link to={`/chat/${id}`} style={{ textDecoration: 'none' }}>
                    <StyledButton
                      variant="outlined"
                      startIcon={<ChatBubbleOutline />}
                      sx={{
                        minWidth: 140,
                        borderRadius: 20,
                      }}
                    >
                      チャット開始
                    </StyledButton>
                  </Link>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
             ))
          ) : (
            <Typography>フレンドがいません</Typography>
          )}
        </List>
      </Box>
    </StyledPaper>
  );
};

export default FriendList;