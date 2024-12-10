import { Route, Routes } from 'react-router-dom';
import { SignUp } from './pages/auth/SignUp';
import { SignIn } from './pages/auth/SignIn';
import ChatListPage from './pages/chats/ChatListPage';
import ChatPage from './pages/chatpage/ChatPage';
import SuccessPage from './pages/SuccessPage';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import { useLocation } from 'react-router-dom';
import ProfilePage from './pages/user/ProfilePage';
import HomePage from './pages/home/HomePage';
import EventsPage from './pages/events/EventsPage';
import UserAttributesPage from './pages/user/UserAttributesPage';
import TimeAndLocationPage from './pages/user/TimeAndLocationPage';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { useEffect } from 'react';
import CreateGroupPage from './pages/groups/CreateGroupPage';
import GroupChatPage from './pages/chatpage/GroupChatPage';
import { useAuth } from './hooks/useAuth';
import { initializeOnlineStatus } from './services/onlineStatus';
import { LoadingProvider } from './contexts/LoadingContext';

// 日本語ロケールを設定
dayjs.locale('ja');

function App() {
  const location = useLocation();
  const hideNavBarPaths = [
    '/',
    '/signin',
    '/signup',
    '/user-attributes',
    '/time-and-location',
  ];
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.uid) {
      initializeOnlineStatus(currentUser.uid);
    }
  }, [currentUser]);

  return (
    <>
      <LoadingProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
          {!hideNavBarPaths.includes(location.pathname) && <Header />}
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/chatlist" element={<ChatListPage />} />
            <Route path="/chat/:friendId" element={<ChatPage />} />
            <Route path="/user-attributes" element={<UserAttributesPage />} />
            <Route
              path="/time-and-location"
              element={<TimeAndLocationPage />}
            />
            <Route path="/groups/create" element={<CreateGroupPage />} />
            <Route path="/chat/group/:groupId" element={<GroupChatPage />} />
          </Routes>
          {!hideNavBarPaths.includes(location.pathname) && <NavigationBar />}
        </LocalizationProvider>
      </LoadingProvider>
    </>
  );
}

export default App;
