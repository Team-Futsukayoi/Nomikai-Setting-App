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
  console.log('FriendList component received:', friendList);
  return (
    <StyledPaper>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: 'primary.dark',
        }}
      >
        フレンドリスト
      </Typography>
      <List sx={{ width: '100%', maxHeight: '300px', overflowY: 'auto' }}>
        {friendList && friendList.length > 0 ? (
          friendList.map(({ id, username, userId, icon }) => (
            <React.Fragment key={id}>
              <ListItem
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  mb: 1,
                  padding: '8px', // パディングを縮小
                  '&:hover': {
                    bgcolor: 'rgba(255, 215, 0, 0.08)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    gap: 1, // 要素間の間隔を縮小
                  }}
                >
                  {/* アバター */}
                  <Avatar
                    alt={username || `ID: ${userId}`}
                    src={icon}
                    sx={{
                      width: 36, // さらにサイズを小さく
                      height: 36,
                      border: 2,
                      borderColor: 'primary.light',
                      flexShrink: 0,
                    }}
                  />

                  {/* ユーザー情報 */}
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden', // はみ出し防止
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.85rem',
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

                  {/* チャットボタン */}
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
                        minWidth: '32px', // ボタンの最小幅を設定
                        width: '36px', // 幅を固定
                        height: '36px', // 高さを固定
                        padding: '6px', // パディングを調整
                        borderRadius: '50%', // 円形のボタンに
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
