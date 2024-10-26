import { Routes, Route } from 'react-router-dom';
import { SignUp } from './pages/auth/SignUp';
import { SignIn } from './pages/auth/SignIn';
import { ChatListPage } from './pages/chats/ChatListPage';
import ChatPage from './pages/chatpage/ChatPage';
import SuccessPage from './pages/SuccessPage';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import { useLocation } from 'react-router-dom/dist';
import ProfilePage from './pages/user/ProfilePage';

function App() {
  const location = useLocation();
  const hideNavBarPaths = ['/', '/signin', '/signup'];

  return (
    <>
      {!hideNavBarPaths.includes(location.pathname) && <Header />}
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/chatlist" element={<ChatListPage />} />
        <Route path="/chat/:friendId" element={<ChatPage />} />
      </Routes>
      {!hideNavBarPaths.includes(location.pathname) && <NavigationBar />}
    </>
  );
}

export default App;
