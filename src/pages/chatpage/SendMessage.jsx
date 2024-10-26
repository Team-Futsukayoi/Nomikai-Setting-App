import React, { useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="メッセージを入力"
      />
      <button type="submit" style={{ 
        backgroundColor: 'blue', 
        color: 'white', 
        padding: '10px 20px', 
        borderRadius: '20px', 
        cursor: 'pointer' 
      }}>送信</button>
    </form>
  );
};

export default SendMessage;
