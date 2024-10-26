import { Routes, Route } from 'react-router-dom';
import { SignUp } from './pages/auth/SignUp';
import { SignIn } from './pages/auth/SignIn';
import { ChatListPage } from './pages/chats/ChatListPage';
import ChatPage from './pages/chatpage/ChatPage';
import SuccessPage from './pages/SuccessPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/chatlist" element={<ChatListPage />} />
      <Route path="/chat/:friendId" element={<ChatPage />} /> 各フレンドとのチャット
      <Route path="/success" element={<SuccessPage />} />
    </Routes>
  );
}

export default App;


