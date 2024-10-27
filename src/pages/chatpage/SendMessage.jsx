import React, { useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SendIcon from '@mui/icons-material/Send';
import { Input } from '@mui/material';

const SendMessage = () => {
  const [message, setMessage] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        await addDoc(collection(db, 'messages'), {
          text: message,
          uid: 'user1', // ここは適宜変更
          photoURL: 'https://via.placeholder.com/30', // ここも適宜変更
          createdAt: serverTimestamp(),
        });
        setMessage(''); // 送信後に入力欄をクリア
      } catch (error) {
        console.error('メッセージ送信エラー:', error);
      }
    }
  };

  return (
    <form onSubmit={sendMessage}>
      <div className="sendMsg">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力"
          style={{
            width: '78%',
            fontSize: '15px',
            fontWeight: '550',
            marginLeft: '5px',
            marginBottom: '-3px',
          }}
        />
        <SendIcon
          type="submit"
          style={{
            color: '#7AC2FF',
            marginLeft: '20px',
          }}
        />
      </div>
    </form>
  );
};

export default SendMessage;
