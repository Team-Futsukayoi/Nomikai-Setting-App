import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import StorefrontIcon from '@mui/icons-material/Storefront';

export default function GroupEventPreview({ event, isExpanded, onToggle }) {
  if (!event) return null;

  const { store, timeSlot } = event;

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: '16px',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        overflow: 'visible',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        },
      }}
      onClick={onToggle}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: 20,
          background: 'linear-gradient(135deg, #FFD700, #FFC400)',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <StorefrontIcon sx={{ color: 'white', fontSize: 20 }} />
      </Box>

      <CardContent sx={{ pt: 3, pb: 2, px: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, ml: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: 1,
              }}
            >
              {store.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PlaceIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  {store.vicinity}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  {timeSlot.start}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton
            size="small"
            sx={{
              color: 'warning.main',
              background: 'rgba(255, 215, 0, 0.2)',
              '&:hover': {
                background: 'rgba(255, 215, 0, 0.3)',
                transform: 'rotate(180deg)',
              },
              transition: 'all 0.3s ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
