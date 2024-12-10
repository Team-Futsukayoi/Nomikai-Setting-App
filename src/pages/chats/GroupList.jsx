import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  AvatarGroup,
  Tooltip,
  Divider,
  Chip,
} from '@mui/material';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import { StyledPaper } from '../../styles/chatlistpageStyles';
import { Link } from 'react-router-dom';
import { useLoading } from '../../contexts/LoadingContext';
import BeerLoader from '../../components/Loading/BeerLoader';

const GroupList = ({ groupList }) => {
  const [showLoader, setShowLoader] = useState(true);
  const [loadingDuration, setLoadingDuration] = useState(1500);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { setIsLoading } = useLoading();
  const groups = groupList || [];

  useEffect(() => {
    if (groups.length === 0) {
      setShowLoader(false);
      return;
    }

    const baseTime = 1500;
    const timePerItem = 100;
    const calculatedDuration = Math.min(
      baseTime + groups.length * timePerItem,
      3000
    );
    setLoadingDuration(calculatedDuration);

    setIsDataLoaded(true);
  }, [groups]);

  const handleLoadingComplete = () => {
    setShowLoader(false);
  };

  if (showLoader) {
    return (
      <BeerLoader
        onLoadingComplete={handleLoadingComplete}
        duration={loadingDuration}
        isReady={isDataLoaded}
      />
    );
  }

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
        <GroupsIcon sx={{ color: '#FFD700', fontSize: '2rem' }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#333',
            fontSize: '1.5rem',
          }}
        >
          グループ一覧
        </Typography>
        <Chip
          label={`${groups.length}グループ`}
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
        {groups.length > 0 ? (
          groups.map((group) => (
            <React.Fragment key={group.id}>
              <ListItem
                sx={{
                  width: '100%',
                  borderRadius: '12px',
                  mb: 1.5,
                  padding: '16px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 215, 0, 0.08)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    borderColor: 'rgba(255, 215, 0, 0.2)',
                  },
                }}
                component={Link}
                to={`/chat/group/${group.id}`}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    width: '100%',
                    gap: 2.5,
                  }}
                >
                  <AvatarGroup
                    max={3}
                    sx={{
                      '& .MuiAvatar-root': {
                        width: 44,
                        height: 44,
                        border: '2px solid #FFD700',
                        bgcolor: '#f5f5f5',
                        color: '#666',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          zIndex: 2,
                        },
                      },
                    }}
                  >
                    {group.members.map((member) => (
                      <Tooltip key={member.uid} title={member.username} arrow>
                        <Avatar alt={member.username} src={member.icon}>
                          {member.username?.[0]}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      width: '100%',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#333',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {group.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666',
                        mb: 1.5,
                      }}
                    >
                      {`${group.members.length}人のメンバー`}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      {group.members.slice(0, 3).map((member) => (
                        <Chip
                          key={member.uid}
                          label={member.username}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 215, 0, 0.1)',
                            color: '#666',
                            fontSize: '0.75rem',
                          }}
                        />
                      ))}
                      {group.members.length > 3 && (
                        <Chip
                          label={`+${group.members.length - 3}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 215, 0, 0.1)',
                            color: '#666',
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: { xs: 'none', sm: 'flex' },
                      alignItems: 'center',
                      color: '#FFD700',
                      fontSize: '1.5rem',
                      opacity: 0.7,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        opacity: 1,
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ChatBubbleOutline />
                  </Box>
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
            <GroupsIcon sx={{ fontSize: '3rem', color: '#FFD700', mb: 2 }} />
            <Typography
              sx={{
                color: '#666',
                textAlign: 'center',
              }}
            >
              グループがありません
            </Typography>
          </Box>
        )}
      </List>
    </StyledPaper>
  );
};

export default GroupList;
