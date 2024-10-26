import React, { useState } from 'react';
import { Input, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function SendMessage({ addMessage }) {
  const [message, setMessage] = useState('');
  // eをつけないとフォームを送信したら勝手にレンダリングされてしまう。つけるとされない
  function sendMessage(e) {
    // formのonSubmitがsubmitが押されると自動で再ロードされるというデフォルトする機能をprevent(妨げる)する
    e.preventDefault();
    if (message.trim()) {
      // 空白のみのメッセージを送信しない
      addMessage({
        text: message,
        photoURL: 'https://via.placeholder.com/30',
        uid: 'user1',
      });
      setMessage(''); // 入力フィールドをクリア
    }
  }
  return (
    <div>
      {/* onSubmitプロパティによって、打ち込んだテキストをDBに保存する */}
      <form onSubmit={sendMessage}>
        <div className="sendMsg">
          <Input
            style={{
              width: '78%',
              fontSize: '15px',
              fontWeight: '550',
              marginLeft: '5px',
              marginBottom: '-3px',
            }}
            placeholder="メッセージを入力してください"
            type="text"
            onChange={(e) => setMessage(e.target.value)}
            //valueはinputの中身の文字のこと。その中にmessageという変数を入れる
            value={message}
          />
          {/* 送信ボタン */}
          <IconButton
            style={{
              color: '#3CAEA3',
              marginLeft: '10px',
            }}
            type="submit"
            aria-label="send"
          >
            <SendIcon />
          </IconButton>
        </div>
      </form>
    </div>
  );
}

export default SendMessage;
