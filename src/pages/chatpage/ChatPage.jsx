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
    console.log('Debug - currentUser:', currentUser?.uid);
    console.log('Debug - friendId:', friendId);
    
    if (currentUser && friendId) {
      const cleanFriendId = friendId.split('_').pop() || friendId;
      console.log('Debug - Clean friendId:', cleanFriendId);

      // フレンド情報を取得
      const friendRef = doc(db, 'users', cleanFriendId);
      getDoc(friendRef)
        .then((docSnap) => {
          console.log('Debug - Friend doc exists:', docSnap.exists());
          if (docSnap.exists()) {
            const friendData = docSnap.data();
            console.log('Debug - Friend data:', friendData);
            setFriendInfo(friendData);
          } else {
            console.error('フレンド情報が見つかりません。ID:', cleanFriendId);
            // Firestoreのusersコレクションの内容を確認
            getDocs(collection(db, 'users')).then(snapshot => {
              console.log('Available users:', snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
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
        // 最初のメッセージの内容を詳しく確認
        const firstMessage = querySnapshot.docs[0]?.data();
        console.log('Debug - First message details:', {
          messageData: firstMessage,
          participantsType: typeof firstMessage?.participants,
          participantsContent: firstMessage?.participants
        });
        
        const fetchedMessages = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(msg => {
            const participants = msg.participants;
            
            // デバッグ用に実際の値を表示
            console.log('Debug - Message filtering:', {
              messageId: msg.id,
              text: msg.text,
              participants,
              currentUser: currentUser.uid,
              cleanFriendId: cleanFriendId,
              senderId: msg.userId,
              matchInfo: {
                hasCurrentUser: participants.includes(currentUser.uid),
                hasCleanFriendId: participants.includes(cleanFriendId),
                participantsCount: participants.length
              }
            });

            // 1対1のチャットメッセージのみをフィルタリング
            return (
              participants.length === 2 &&
              participants.includes(currentUser.uid) &&
              participants.includes(cleanFriendId)
            );
          });
        
        console.log('Debug - Filtered messages:', fetchedMessages);
        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    }
  }, [currentUser, friendId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      const cleanFriendId = friendId.split('_').pop() || friendId;
      const messageData = {
        text: newMessage,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        participants: [currentUser.uid, cleanFriendId].sort(),
      };

      console.log('Debug - Sending message:', messageData);
      await addDoc(collection(db, 'messages'), messageData);

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
            // iOSでのスクロールバウンス時の背景表示を防ぐ
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
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            mb: '72px',
            maxHeight: 'calc(100vh - 100px)',
            // iOS用のスロールバウンス対策
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
            // スムーズなアニメーションのためのトランジション
            transition: 'transform 0.3s ease-in-out',
            // モバイルデバイスでキーボードが表示された時の挙動を制御
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
