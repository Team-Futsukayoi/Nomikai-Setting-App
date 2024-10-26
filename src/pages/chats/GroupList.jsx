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
import GroupAdd from '@mui/icons-material/GroupAdd';
import { StyledPaper, StyledButton } from '../../styles/chatlistpageStyles';

const GroupList = ({ friendList }) => {
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
          グループリスト
        </Typography>

        <List sx={{ width: '100%' }}>
          {friendList.map(({ id, name, iconUrl, isGroop, members }) => {
            if (isGroop) {
              return (
                <ListItem
                  key={id}
                  sx={{
                    borderRadius: 2,
                    mb: 2,
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 8px rgba(255, 215, 0, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 215, 0, 0.08)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <AvatarGroup max={3} sx={{ mr: 2 }}>
                      <Avatar
                        alt={name}
                        src={iconUrl}
                        sx={{
                          width: 45,
                          height: 45,
                          border: 2,
                          borderColor: 'primary.light',
                        }}
                      />
                      {/* グループメンバーのアバターを表示（オプション） */}
                    </AvatarGroup>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 500 }}
                        >
                          {name}
                        </Typography>
                        <Chip
                          label="グループ"
                          size="small"
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {members
                          ? `${members.length}人のメンバー`
                          : '0人のメンバー'}
                      </Typography>
                    }
                  />
                  <StyledButton
                    variant="contained"
                    startIcon={<GroupAdd />}
                    onClick={() => console.log('グループチャットへの遷移')}
                    sx={{
                      minWidth: 140,
                      borderRadius: 20,
                    }}
                  >
                    参加する
                  </StyledButton>
                </ListItem>
              );
            }
            return null;
          })}
        </List>
      </Box>
    </StyledPaper>
  );
};

export default GroupList;
