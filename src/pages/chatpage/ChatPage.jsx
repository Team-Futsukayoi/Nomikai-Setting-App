import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import SendMessage from './SendMessage.jsx';
import './ChatPage.css';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const { friendId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // ユーザーがログインしていない場合の処理
        console.log("ユーザーがログインしていません");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains', currentUser.uid),
      orderBy('createdAt')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);
    }, (error) => {
      console.error("メッセージの取得中にエラーが発生しました:", error);
    });

    return () => unsubscribe();
  }, [currentUser, friendId]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="msgs">
        {messages.map(({ id, text, photoURL, uid }) => (
          <div key={id}>
            <div className={`msg ${uid === currentUser.uid ? 'sent' : 'received'}`}>
              <img src={photoURL} alt="" />
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
      <SendMessage friendId={friendId} currentUserId={currentUser.uid} />
    </div>
  );
}

export default ChatPage;