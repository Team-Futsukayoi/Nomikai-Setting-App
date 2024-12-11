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
  getDocs,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  ThemeProvider,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { useAuth } from '../../hooks/useAuth';
import theme from '../../styles/theme';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { friendId } = useParams();
  const { currentUser } = useAuth();
  const [friendInfo, setFriendInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentUser && friendId) {
      const cleanFriendId = friendId.split('_').pop() || friendId;
      // フレンド情報を取得
      const friendRef = doc(db, 'users', cleanFriendId);
      getDoc(friendRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const friendData = docSnap.data();
            setFriendInfo(friendData);
          } else {
            console.error('フレンド情報が見つかりません。ID:', cleanFriendId);
            // Firestoreのusersコレクションの内容を確認
            getDocs(collection(db, 'users')).then((snapshot) => {
              console.log(
                'Available users:',
                snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
              );
            });
          }
        })
        .catch((error) => {
          console.error('フレンド情報の取得エラー:', error);
        });

      // メッセージを取得
      const q = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedMessages = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((msg) => {
            const participants = msg.participants;

            // 1対1のチャットメッセージのみをフィルタリング
            return (
              participants.length === 2 &&
              participants.includes(currentUser.uid) &&
              participants.includes(cleanFriendId)
            );
          });

        // 未読メッセージの既読状態を更新
        fetchedMessages.forEach((message) => {
          const otherParticipant = message.participants.find(
            (id) => id !== message.userId
          );
          if (
            Array.isArray(message.readBy) &&
            !message.readBy.includes(currentUser.uid) &&
            message.userId !== currentUser.uid
          ) {
            markAsRead(message.id);
          }
        });

        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    }
  }, [currentUser, friendId]);

  //自動スクロール
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    scrollToBottom();
  }, [messages]);

  // メッセージ送信
  const sendMessage = async (e) => {
    e.preventDefault();

    if (newMessage.trim() === '') return;

    try {
      const cleanFriendId = friendId.split('_').pop() || friendId;
      const messageData = {
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        participants: [currentUser.uid, cleanFriendId].sort(),
        readBy: [currentUser.uid], // 送信者を既読として初期化
      };

      await addDoc(collection(db, 'messages'), messageData);
      setNewMessage('');
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        readBy: arrayUnion(currentUser.uid),
      });
    } catch (error) {
      console.error('既読状態の更新に失敗しました:', error);
    }
  };

  // 既読/未読の判定を行う
  const isMessageRead = (message) => {
    const otherParticipant = message.participants.find(
      (id) => id !== message.userId
    );
    return (
      Array.isArray(message.readBy) && message.readBy.includes(otherParticipant)
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: '#EAEAEA',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pb: '72px',
          pt: '60px',
        }}
      >
        {/* ヘッダー */}
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            width: '100%',
            top: '56px',
            zIndex: 1,
            borderRadius: '0 0 24px 24px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
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
            <Avatar
              src={friendInfo?.icon}
              alt={friendInfo?.username}
              sx={{
                width: 44,
                height: 44,
                border: 2,
                borderColor: 'primary.light',
              }}
            />
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {friendInfo?.username || 'チャット'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {friendInfo?.userId || ''}
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
            pt: '56px',
            pb: '36px',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            mb: '72px',
            maxHeight: 'calc(100vh - 192px)',
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
              <Box
                sx={{
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Paper
                  elevation={3}
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
                        ? '20px 20px 4px 20px'
                        : '20px 20px 20px 4px',
                    wordBreak: 'break-word',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
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
                    format(message.createdAt.toDate(), 'HH:mm', {
                      locale: ja,
                    })}{' '}
                  {isMessageRead(message) ? '既読' : '未読'}
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
          elevation={3}
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

export default ChatPage;
