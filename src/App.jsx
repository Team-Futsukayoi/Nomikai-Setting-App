import { Routes, Route } from 'react-router-dom';
import { SignUp } from './pages/auth/SignUp';
import { SignIn } from './pages/auth/SignIn';
import { ChatListPage } from './pages/chats/ChatListPage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/chatlist" element={<ChatListPage />} />
    </Routes>
  );
}

export default App;


