import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import SendMessage from './SendMessage.jsx';
import './ChatPage.css';

function ChatPage() {
  const [messages, setMessages] = useState([]);

  // Firestoreからメッセージを取得
  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);
    });

    // クリーンアップ
    return () => unsubscribe();
  }, []);

  return (
    <div className="chat-page">
      <div className="msgs">
        {messages.map(({ id, text, photoURL, uid }) => (
          <div key={id}>
            <div className={`msg ${uid === 'user1' ? 'sent' : 'received'}`}>
              <img className="user-icon" src={photoURL} alt="" />
              <p className="text-message">{text}</p>
            </div>
          </div>
        ))}
      </div>
      <SendMessage />
    </div>
  );
}

export default ChatPage;
