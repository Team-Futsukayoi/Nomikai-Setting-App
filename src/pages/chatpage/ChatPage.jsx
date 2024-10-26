import React, { useState } from 'react';
import SendMessage from './SendMessage.jsx';
import './ChatPage.css';

function ChatPage() {
  // setMessagesをつかうと、左にあるmessagesに値をどんどん入れていける（hooks）
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'こんにちは！',
      photoURL: 'https://via.placeholder.com/30',
      uid: 'user1',
    },
    {
      id: 2,
      text: 'こんばんは！',
      photoURL: 'https://via.placeholder.com/30',
      uid: 'user2',
    },
  ]);

  const addMessage = (newMessage) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { ...newMessage, id: prevMessages.length + 1 },
    ]);
  };

  return (
    <div>
      <div className="msgs">
        {messages.map(({ id, text, photoURL, uid }) => (
          <div key={id}>
            <div className={`msg ${uid === 'user1' ? 'sent' : 'received'}`}>
              <img src={photoURL} alt="" />
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
      <SendMessage addMessage={addMessage} />
    </div>
  );
}

export default ChatPage;
