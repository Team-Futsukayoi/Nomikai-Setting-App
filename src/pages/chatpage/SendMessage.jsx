import React, { useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SendIcon from '@mui/icons-material/Send';
import { Input } from '@mui/material';

function SendMessage({ friendId, currentUserId }) {
  const [message, setMessage] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === '') {
      alert('メッセージを入力してください');
      return;
    }
    try {
      await addDoc(collection(db, 'messages'), {
        text: message,
        createdAt: serverTimestamp(),
        uid: currentUserId,
        friendId: friendId,
        participants: [currentUserId, friendId]
      });
      setMessage('');
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
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
}

export default SendMessage;