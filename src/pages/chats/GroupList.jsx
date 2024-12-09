// GroupList.jsx
import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  AvatarGroup,
  Chip,
} from '@mui/material';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import { StyledPaper, StyledButton } from '../../styles/chatlistpageStyles';
import { Link } from 'react-router-dom';

const GroupList = ({ groupList }) => {
  const groups = groupList || [];

  return (
    <StyledPaper>
      <List sx={{ width: '100%', maxHeight: '300px', overflowY: 'auto' }}>
        {groups.length > 0 ? (
          groups.map((group) => (
            <React.Fragment key={group.id}>
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
                  <AvatarGroup max={3} sx={{ mr: 2 }}>
                    {group.members.map((member, index) => (
                      <Avatar
                        key={`${group.id}_${member.uid}_${index}`}
                        alt={member.username}
                        sx={{
                          width: 36,
                          height: 36,
                          border: 2,
                          borderColor: 'primary.light',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      />
                    ))}
                  </AvatarGroup>

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
                      {group.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {group.members.length}人のメンバー
                    </Typography>
                  </Box>

                  <Link
                    to={`/chat/group/${group.id}`}
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
            </React.Fragment>
          ))
        ) : (
          <Typography>グループがありません</Typography>
        )}
      </List>
    </StyledPaper>
  );
};

export default GroupList;
