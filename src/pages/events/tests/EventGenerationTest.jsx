// このファイルはイベント生成テスト用のファイルです。
// 本番環境では使用しません。

import React, { useState, useEffect } from 'react';
import { Fab, CircularProgress, Tooltip, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { generateEvent } from '../services/eventGenerator';
import { getLoader } from '../api/googlePlacesApi';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { format } from 'date-fns';
import { useAuth } from '../../../hooks/useAuth';

export default function EventGenerationTest() {
  const [loading, setLoading] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        await getLoader().load();
        setMapsLoaded(true);
      } catch (error) {
        console.error('Google Maps API初期化エラー:', error);
      }
    };

    initGoogleMaps();
  }, []);

  const handleTest = async () => {
    if (!mapsLoaded) {
      console.error('Google Maps APIが読み込まれていません');
      return;
    }

    setLoading(true);

    try {
      const groupId = '53x2eff3gp3Zl4c9Ul2e';
      const commonTimeSlots = ['evening', 'night', 'latenight'];

      const result = await generateEvent(commonTimeSlots, groupId);
      console.log('生成結果:', result);

      const eventRef = doc(db, 'groups', groupId, 'events', 'current');
      const today = new Date();
      const formattedDate = format(today, 'yyyy/MM/dd');

      console.log('保存する日付:', formattedDate);

      await setDoc(
        eventRef,
        {
          store: result.store,
          timeSlot: result.timeSlot,
          date: formattedDate,
          participants: {},
          createdAt: serverTimestamp(),
        },
        { merge: false }
      );
    } catch (error) {
      console.error('テストエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Button
        variant="contained"
        onClick={handleTest}
        disabled={loading || !mapsLoaded}
        sx={{
          bgcolor: 'warning.main',
          '&:hover': { bgcolor: 'warning.dark' },
        }}
      >
        {loading ? (
          <CircularProgress size={24} sx={{ color: 'white' }} />
        ) : (
          'イベントを生成'
        )}
      </Button>
    </Box>
  );
}
