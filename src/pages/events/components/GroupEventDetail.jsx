import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  Avatar,
  AvatarGroup,
  Chip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../hooks/useAuth';

export default function GroupEventDetail({ event, groupId, onClose }) {
  const { currentUser } = useAuth();
  const [participantDetails, setParticipantDetails] = useState({});

  useEffect(() => {
    const fetchParticipantDetails = async () => {
      if (!event?.participants) return;

      const details = {};
      for (const [uid, status] of Object.entries(event.participants)) {
        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            details[uid] = {
              ...userDoc.data(),
              status,
            };
          }
        } catch (error) {
          console.error('参加者情報の取得エラー:', error);
        }
      }
      setParticipantDetails(details);
    };

    fetchParticipantDetails();
  }, [event?.participants]);

  if (!event) return null;

  const { store, timeSlot, date, participants } = event;

  // デバッグ用
  console.log('Date received:', date);

  // 日付のフォーマット
  const formatEventDate = (dateStr) => {
    if (!dateStr) return '日付未定';

    try {
      // 日付文字列をDate型に変換（yyyy/MM/dd形式を想定）
      const [year, month, day] = dateStr.split('/');
      const dateObj = new Date(year, month - 1, day);

      return format(dateObj, 'M月d日(E)', { locale: ja });
    } catch (error) {
      console.error('日付のフォーマットエラー:', error, 'Date value:', dateStr);
      return '日付未定';
    }
  };

  const handleJoin = async () => {
    if (!event || !currentUser) return;

    try {
      const eventRef = doc(db, 'groups', groupId, 'events', 'current');
      await updateDoc(eventRef, {
        [`participants.${currentUser.uid}`]: 'accepted',
      });
      console.log('参加状態が更新されました');
    } catch (error) {
      console.error('参加状態の更新エラー:', error);
    }
  };

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: '16px',
        bgcolor: 'background.paper',
        mb: 1,
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* ヘッダー */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {store.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<StarIcon sx={{ color: 'warning.main' }} />}
              label={`${store.rating || '--'} / 5.0`}
              size="small"
              sx={{ bgcolor: 'warning.light' }}
            />
            {store.price_level && (
              <Chip
                label={'¥'.repeat(store.price_level)}
                size="small"
                sx={{ bgcolor: 'warning.light' }}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 詳細情報 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlaceIcon sx={{ color: 'warning.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {store.vicinity || store.address}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon sx={{ color: 'warning.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {formatEventDate(date)} {timeSlot.start}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon sx={{ color: 'warning.main' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AvatarGroup
                max={4}
                sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}
              >
                {Object.entries(participants || {}).map(([uid, status]) => (
                  <Avatar
                    key={uid}
                    sx={{
                      bgcolor:
                        status === 'accepted' ? 'success.main' : 'grey.400',
                      width: 24,
                      height: 24,
                      fontSize: '0.75rem',
                    }}
                  >
                    {participantDetails[uid]?.username.charAt(0)}
                  </Avatar>
                ))}
              </AvatarGroup>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {Object.keys(participants || {}).length}人が参加予定
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* アクションボタン */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            閉じる
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'warning.main',
              '&:hover': { bgcolor: 'warning.dark' },
            }}
            onClick={handleJoin}
          >
            参加する
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
