// このファイルはイベント生成テスト用のファイルです。
// 本番環境では使用しません。

import React, { useState, useEffect } from 'react';
import { Fab, CircularProgress, Typography, Box, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // または他のアイコンを使用
import { generateEvent } from '../services/eventGenerator';
import { getLoader } from '../api/googlePlacesApi';

export default function EventGenerationTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    // コンポーネントマウント時にGoogle Maps APIを初期化
    const initGoogleMaps = async () => {
      try {
        await getLoader().load();
        setMapsLoaded(true);
      } catch (error) {
        console.error('Google Maps API初期化エラー:', error);
        setError('Google Maps APIの初期化に失敗しました');
      }
    };

    initGoogleMaps();
  }, []);

  const handleTest = async () => {
    if (!mapsLoaded) {
      setError('Google Maps APIが読み込まれていません');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const groupId = '53x2eff3gp3Zl4c9Ul2e';
      const commonTimeSlots = ['evening', 'night', 'latenight'];

      const result = await generateEvent(commonTimeSlots, groupId);
      console.log('生成結果:', result);
      setResult(result);
    } catch (error) {
      console.error('テストエラー:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {(error || result) && (
        <Box
          sx={{
            position: 'fixed',
            top: '20px', // 上からの距離
            right: '20px', // 右からの距離
            zIndex: 1000,
            backgroundColor: 'background.paper',
            p: 2,
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          {error && <Typography color="error">エラー: {error}</Typography>}

          {result && (
            <>
              <Typography variant="h6">生成結果:</Typography>
              <Typography>店舗名: {result.store.name}</Typography>
              <Typography>住所: {result.store.address}</Typography>
              <Typography>
                時間帯: {result.timeSlot.start} - {result.timeSlot.end}
              </Typography>
            </>
          )}
        </Box>
      )}

      <Tooltip title="イベント生成テスト">
        <Fab
          color="primary"
          onClick={handleTest}
          disabled={loading || !mapsLoaded}
          sx={{
            position: 'fixed',
            bottom: '20px', // 下からの距離
            right: '20px', // 右からの距離
            zIndex: 1000, // 他の要素より前面に表示
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <AddIcon />
          )}
        </Fab>
      </Tooltip>
    </>
  );
}
