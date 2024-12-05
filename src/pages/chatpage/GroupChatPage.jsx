import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  Container,
  ThemeProvider,
  AvatarGroup,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { useAuth } from '../../hooks/useAuth';
import theme from '../../styles/theme';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

function GroupChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { groupId } = useParams(); // URLからgroupIdを取得
  const { currentUser } = useAuth();
  const [groupInfo, setGroupInfo] = useState(null);
  const messagesEndRef = useRef(null);

  // グループ情報の取得
  useEffect(() => {
    if (currentUser && groupId) {
      const groupRef = doc(db, 'groups', groupId);
      getDoc(groupRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setGroupInfo(docSnap.data());
          } else {
            console.error('グループが見つかりません');
          }
        })
        .catch((error) => {
          console.error('グループ情報の取得エラー:', error);
        });

      // グループメッセージを取得
      const q = query(
        collection(db, 'groupMessages'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedMessages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    }
  }, [currentUser, groupId]);

  // 自動スクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // メッセージ送信
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      await addDoc(collection(db, 'groupMessages'), {
        text: newMessage,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        username: currentUser.username, // 送信者の名前を保存
        groupId: groupId,
      });

      setNewMessage('');
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: '#F5F5F5',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pb: '72px',
          pt: '132px',
        }}
      >
        {/* ヘッダー */}
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            width: '100%',
            top: '56px',
            zIndex: 1,
            borderRadius: '0 0 24px 24px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-100px',
              left: 0,
              right: 0,
              height: '100px',
              background: 'inherit',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              gap: 2,
            }}
          >
            <IconButton
              onClick={() => window.history.back()}
              sx={{ color: 'primary.main' }}
            >
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
            <AvatarGroup max={3} sx={{ mr: 1 }}>
              {groupInfo?.members?.map((member) => (
                <Avatar
                  key={member.uid}
                  alt={member.username}
                  sx={{
                    width: 44,
                    height: 44,
                    border: 2,
                    borderColor: 'primary.light',
                  }}
                />
              ))}
            </AvatarGroup>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {groupInfo?.name || 'グループチャット'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {groupInfo?.members?.length || 0}人のメンバー
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* メッセージエリア */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            mb: '72px',
            maxHeight: 'calc(100vh - 100px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems:
                  message.userId === currentUser.uid
                    ? 'flex-end'
                    : 'flex-start',
              }}
            >
              {message.userId !== currentUser.uid && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    ml: 2,
                    mb: 0.5,
                  }}
                >
                  {message.username}
                </Typography>
              )}
              <Box
                sx={{
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    px: 2,
                    bgcolor:
                      message.userId === currentUser.uid
                        ? 'primary.main'
                        : 'white',
                    color:
                      message.userId === currentUser.uid
                        ? 'white'
                        : 'text.primary',
                    borderRadius:
                      message.userId === currentUser.uid
                        ? '20px 20px 0 20px'
                        : '20px 20px 20px 0',
                    wordBreak: 'break-word',
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    px: 0.5,
                  }}
                >
                  {message.createdAt &&
                    format(message.createdAt.toDate(), 'HH:mm', { locale: ja })}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* 入力エリア */}
        <Paper
          component="form"
          onSubmit={sendMessage}
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'white',
            borderRadius: '24px 24px 0 0',
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            position: 'fixed',
            bottom: '80px',
            left: 0,
            right: 0,
            transition: 'transform 0.3s ease-in-out',
            '@media (max-height: 400px)': {
              position: 'static',
            },
          }}
        >
          <TextField
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力"
            variant="outlined"
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                bgcolor: '#F5F5F5',
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          />
          <IconButton
            type="submit"
            disabled={!newMessage.trim()}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
          >
            <SendRoundedIcon />
          </IconButton>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default GroupChatPage;