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
  // console.log('FriendList component received:', friendList);
  return (
    <StyledPaper>
      <List sx={{ width: '100%', maxHeight: '300px', overflowY: 'auto' }}>
        {friendList && friendList.length > 0 ? (
          friendList.map(({ id, username, userId, icon }) => (
            <React.Fragment key={id}>
              <ListItem
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  mb: 1,
                  padding: '8px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 215, 0, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    gap: 1,
                  }}
                >
                  <Avatar
                    alt={username || `ID: ${userId}`}
                    src={icon}
                    sx={{
                      width: 40,
                      height: 40,
                      border: 2,
                      borderColor: 'primary.light',
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {username || 'No Name'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      ID: {userId}
                    </Typography>
                  </Box>

                  <Link
                    to={`/chat/${id}`}
                    style={{
                      textDecoration: 'none',
                      flexShrink: 0,
                      marginLeft: '4px',
                    }}
                  >
                    <StyledButton
                      variant="outlined"
                      sx={{
                        minWidth: '32px',
                        width: '36px',
                        height: '36px',
                        padding: '6px',
                        borderRadius: '50%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'primary.light',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <ChatBubbleOutline sx={{ fontSize: '1rem' }} />
                    </StyledButton>
                  </Link>
                </Box>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))
        ) : (
          <Typography>フレンドがいません</Typography>
        )}
      </List>
    </StyledPaper>
  );
};

export default FriendList;
