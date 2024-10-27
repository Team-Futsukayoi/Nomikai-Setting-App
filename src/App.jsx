import { Routes, Route } from 'react-router-dom';
import { SignUp } from './pages/auth/SignUp';
import { SignIn } from './pages/auth/SignIn';
import { ChatListPage } from './pages/chats/ChatListPage';
import ChatPage from './pages/chatpage/ChatPage';
import SuccessPage from './pages/SuccessPage';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import { useLocation } from 'react-router-dom';
import ProfilePage from './pages/user/ProfilePage';
import UserAttributesPage from './pages/user/UserAttributesPage';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

// 日本語ロケールを設定
dayjs.locale('ja');

function App() {
  const location = useLocation();
  const hideNavBarPaths = ['/', '/signin', '/signup', '/user-attributes'];

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
        {!hideNavBarPaths.includes(location.pathname) && <Header />}
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/chatlist" element={<ChatListPage />} />
          <Route path="/chat/:friendId" element={<ChatPage />} />
          <Route path="/user-attributes" element={<UserAttributesPage />} />
        </Routes>
        {!hideNavBarPaths.includes(location.pathname) && <NavigationBar />}
      </LocalizationProvider>
    </>
  );
}

export default App;
