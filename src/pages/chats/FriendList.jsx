import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { StyledPaper } from '../../styles/chatlistpageStyles';
import { Link } from 'react-router-dom';
import { subscribeToMultipleUserStatus } from '../../services/onlineStatus';
import { getRelativeTime } from '../../utils/dateUtils';
import dayjs from 'dayjs';
import { useLoading } from '../../contexts/LoadingContext';
import BeerLoader from '../../components/Loading/BeerLoader';

export const FriendList = ({ friendList }) => {
  const [onlineStatus, setOnlineStatus] = useState({});
  const [lastSeenTimes, setLastSeenTimes] = useState({});
  const [showLoader, setShowLoader] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [error, setError] = useState(null);
  const friends = friendList || [];

  useEffect(() => {
    if (friends.length === 0) {
      return;
    }

    setShowLoader(true);

    const userIds = friends.map((friend) => friend.friendId);
    const unsubscribe = subscribeToMultipleUserStatus(
      userIds,
      (userId, status, lastSeen) => {
        try {
          setOnlineStatus((prev) => ({
            ...prev,
            [userId]: status,
          }));
          setLastSeenTimes((prev) => ({
            ...prev,
            [userId]: lastSeen,
          }));
          setIsDataLoaded(true);
        } catch (err) {
          setError(err.message);
        }
      }
    );

    return () => unsubscribe();
  }, [friends]);

  const handleLoadingComplete = () => {
    setShowLoader(false);
  };

  if (showLoader) {
    return (
      <BeerLoader
        onLoadingComplete={handleLoadingComplete}
        duration={1500}
        isReady={isDataLoaded}
        error={error}
      />
    );
  }

  const renderStatusChip = (friendId) => {
    const isOnline = onlineStatus[friendId] === 'online';
    const lastSeen = lastSeenTimes[friendId];

    return (
      <Tooltip
        title={
          isOnline
            ? 'オンライン'
            : lastSeen
              ? `最終オンライン: ${dayjs(lastSeen).format('YYYY/MM/DD HH:mm')}`
              : 'オフライン'
        }
        arrow
      >
        <Chip
          label={
            isOnline
              ? 'オンライン'
              : lastSeen
                ? `${getRelativeTime(lastSeen)}まで`
                : 'オフライン'
          }
          size="small"
          sx={{
            bgcolor: isOnline
              ? 'rgba(76, 175, 80, 0.1)'
              : 'rgba(189, 189, 189, 0.1)',
            color: isOnline ? '#4CAF50' : '#bdbdbd',
            fontSize: '0.75rem',
          }}
        />
      </Tooltip>
    );
  };

  return (
    <StyledPaper
      sx={{
        bgcolor: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        borderRadius: '24px',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          gap: 1,
          pb: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        <PeopleAltIcon sx={{ color: '#FFD700', fontSize: '2rem' }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#333',
            fontSize: '1.5rem',
          }}
        >
          フレンド一覧
        </Typography>
        <Chip
          label={`${friends.length}人のフレンド`}
          size="small"
          sx={{
            ml: 'auto',
            bgcolor: 'rgba(255, 215, 0, 0.1)',
            color: '#FFD700',
            fontWeight: 600,
          }}
        />
      </Box>

      <List
        sx={{
          width: '100%',
          flex: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#FFD700',
            borderRadius: '3px',
            '&:hover': {
              background: '#FFC700',
            },
          },
        }}
      >
        {friends.length > 0 ? (
          friends.map(({ id, friendId, username, userId, icon }) => (
            <React.Fragment key={id}>
              <ListItem
                sx={{
                  width: '100%',
                  borderRadius: '8px',
                  mb: 1,
                  padding: '8px 12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 215, 0, 0.08)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    borderColor: 'rgba(255, 215, 0, 0.2)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    gap: 1.5,
                  }}
                >
                  <Tooltip
                    title={`${username || 'No Name'} (ID: ${userId})`}
                    arrow
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        alt={username || `ID: ${userId}`}
                        src={icon}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: '#f5f5f5',
                          color: '#666',
                          border: '2px solid #FFD700',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        {username?.[0]}
                      </Avatar>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor:
                            onlineStatus[friendId] === 'online'
                              ? '#4CAF50'
                              : '#bdbdbd',
                          border: '2px solid #fff',
                        }}
                      />
                    </Box>
                  </Tooltip>

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#333',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        mb: 0.25,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {username || 'No Name'}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#666',
                          fontSize: '0.8rem',
                        }}
                      >
                        ID: {userId}
                      </Typography>
                      {renderStatusChip(friendId)}
                    </Box>
                  </Box>

                  <Link
                    to={`/chat/${id}`}
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'transparent',
                        border: '1.5px solid #FFD700',
                        color: '#FFD700',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#FFD700',
                          color: '#FFF',
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <ChatBubbleOutline sx={{ fontSize: '1rem' }} />
                    </Box>
                  </Link>
                </Box>
              </ListItem>
            </React.Fragment>
          ))
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              py: 6,
              opacity: 0.7,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                fontWeight: 500,
                fontSize: '1.2rem',
                mb: 2,
              }}
            >
              フレンドがいません
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#999',
                fontSize: '1rem',
              }}
            >
              フレンドを追加してみましょう
            </Typography>
          </Box>
        )}
      </List>
    </StyledPaper>
  );
};

export default FriendList;
