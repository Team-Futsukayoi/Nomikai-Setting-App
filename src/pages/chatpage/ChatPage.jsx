import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Box, Typography, TextField, Button, Avatar } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { friendId } = useParams();
  const { currentUser } = useAuth();
  const [friendInfo, setFriendInfo] = useState(null);

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
    <Box sx={{ maxWidth: 600, margin: 'auto', p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {friendInfo ? friendInfo.username : 'チャット'}
      </Typography>
      <Box sx={{ height: 400, overflowY: 'auto', mb: 2, p: 2, bgcolor: 'background.paper' }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.userId === currentUser.uid ? 'flex-end' : 'flex-start',
              mb: 1,
            }}
          >
            <Box
              sx={{
                bgcolor: message.userId === currentUser.uid ? 'primary.main' : 'grey.300',
                color: message.userId === currentUser.uid ? 'white' : 'black',
                p: 1,
                borderRadius: 1,
                maxWidth: '70%',
              }}
            >
              <Typography>{message.text}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <form onSubmit={sendMessage} style={{ display: 'flex' }}>
        <TextField
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力"
          variant="outlined"
          sx={{ mr: 1 }}
        />
        <Button type="submit" variant="contained">
          送信
        </Button>
      </form>
    </Box>
  );
}

export default ChatPage;