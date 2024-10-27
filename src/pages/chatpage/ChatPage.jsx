import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Box, Typography, TextField, Button, Avatar, Paper, Container, ThemeProvider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../hooks/useAuth';
import theme from '../../styles/theme';  // 先ほど作成したテーマをインポート

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { friendId } = useParams();
  const { currentUser } = useAuth();
  const [friendInfo, setFriendInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentUser && friendId) {
      // フレンド情報を取得
      const friendRef = doc(db, 'users', friendId);
      getDoc(friendRef).then((docSnap) => {
        if (docSnap.exists()) {
          setFriendInfo(docSnap.data());
        } else {
          console.log("フレンド情報が見つかりません");
        }
      }).catch(error => {
        console.error("フレンド情報の取得エラー:", error);
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
          .filter(
            (msg) =>
              msg.participants.includes(currentUser.uid) && msg.participants.includes(friendId)
          );
        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    }
  }, [currentUser, friendId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        participants: [currentUser.uid, friendId],
      });

      setNewMessage('');
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar src={friendInfo?.icon} alt={friendInfo?.username} sx={{ mr: 2 }} />
              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {friendInfo ? friendInfo.username : 'チャット'}
              </Typography>
            </Box>
            <Box sx={{ height: '60vh', overflowY: 'auto', mb: 2, p: 2 }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.userId === currentUser.uid ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1,
                      maxWidth: '70%',
                      bgcolor: message.userId === currentUser.uid ? 'primary.light' : 'background.paper',
                      color: message.userId === currentUser.uid ? 'text.primary' : 'text.secondary',
                      borderRadius: message.userId === currentUser.uid ? '20px 20px 0 20px' : '20px 20px 20px 0',
                    }}
                  >
                    <Typography variant="body1">{message.text}</Typography>
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
            <Box component="form" onSubmit={sendMessage} sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="メッセージを入力"
                variant="outlined"
                sx={{ mr: 1 }}
              />
              <Button type="submit" variant="contained" endIcon={<SendIcon />}>
                送信
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default ChatPage;