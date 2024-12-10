import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import {
  Box,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Fab,
  Zoom,
  IconButton,
  InputBase,
  Avatar,
} from '@mui/material';
import PersonAdd from '@mui/icons-material/PersonAdd';
import GroupAdd from '@mui/icons-material/GroupAdd';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import FriendList from './FriendList';
import GroupList from './GroupList';
import { useAuth } from '../../hooks/useAuth';
import { StyledPaper, StyledButton } from '../../styles/chatlistpageStyles';
import { AddFriendModal } from '../../components/friends/AddFriendModal';
import { CreateGroupModal } from '../../components/groups/CreateGroupModal';
import { SearchDialog } from '../../components/search/SearchDialog';
import { useLoading } from '../../contexts/LoadingContext';

export const ChatListPage = () => {
  // ユーザー情報取得
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { setIsLoading } = useLoading();

  // 状態管理
  const [isFriendClicked, setIsFriendClicked] = useState(true);
  const [friendList, setFriendList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // フレンドリストを取得する関数を定義
  const fetchFriendsFromFirestore = async (userId) => {
    try {
      console.log('Fetching friends for user:', userId);
      const friendsQuery = query(
        collection(db, 'friends'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(friendsQuery);
      console.log('Friends query snapshot:', querySnapshot.docs.length);

      const friendships = querySnapshot.docs.map((doc) => ({
        friendshipId: doc.id,
        ...doc.data(),
      }));
      console.log('Friendships:', friendships);

      const friendsData = await Promise.all(
        friendships.map(async (friendship) => {
          try {
            const friendDocRef = doc(db, 'users', friendship.friendId);
            const friendDocSnap = await getDoc(friendDocRef);
            console.log(
              'Friend doc exists:',
              friendDocSnap.exists(),
              'Friend data:',
              friendDocSnap.data()
            );

            if (friendDocSnap.exists()) {
              const friendData = friendDocSnap.data();
              return {
                id: `${friendship.friendshipId}_${friendship.friendId}`,
                friendId: friendship.friendId,
                username: friendData.username,
                icon: friendData.icon,
                userId: friendData.userId,
              };
            }
            return null;
          } catch (error) {
            console.error('フレンドデータの取得に失敗しました:', error);
            return null;
          }
        })
      );

      const validFriends = friendsData.filter((friend) => friend !== null);
      console.log('Valid friends:', validFriends);
      setFriendList(validFriends);
      return validFriends; // 追加：戻り値を明示的に返す
    } catch (error) {
      console.error('フレンドリストの取得に失敗しました:', error);
      return []; // エラー時は空配列を返す
    }
  };

  // グループリストを取得
  const fetchGroups = async () => {
    if (!currentUser) return [];

    try {
      const groupsRef = collection(db, 'groups');
      const querySnapshot = await getDocs(groupsRef);

      return querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (group) =>
            group.members &&
            Array.isArray(group.members) &&
            group.members.some((member) => member.uid === currentUser.uid)
        );
    } catch (error) {
      console.error('グループリストの取得に失敗しました:', error);
      return [];
    }
  };

  // データの初期読み込みを1回だけ行う
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser || !isInitialLoading) return;

      setIsLoading(true);
      try {
        const [friends, groups] = await Promise.all([
          fetchFriendsFromFirestore(currentUser.uid),
          fetchGroups(),
        ]);
        setFriendList(friends);
        setGroupList(groups);
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [currentUser, isInitialLoading]);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: '#F4F5F7',
        pb: '56px',
        position: 'relative',
      }}
    >
      {/* サイドバー */}
      <Box
        sx={{
          width: { xs: '100%', md: 320 },
          height: '100vh',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'white',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        }}
      >
        {/* 検索バー */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#F0F2F5',
              borderRadius: 2,
              p: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <SearchIcon sx={{ color: '#333', mr: 1 }} />
            <InputBase
              placeholder="検索"
              sx={{ flex: 1, color: '#333' }}
              onClick={() => setIsSearchDialogOpen(true)}
            />
          </Box>
        </Box>

        {/* タブ切り替え */}
        <Box
          sx={{
            display: 'flex',
            p: 1,
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            onClick={() => setIsFriendClicked(true)}
            sx={{
              flex: 1,
              p: 1,
              textAlign: 'center',
              borderRadius: 2,
              cursor: 'pointer',
              bgcolor: isFriendClicked ? '#FFD700' : 'transparent',
              color: isFriendClicked ? 'white' : '#333',
              '&:hover': {
                bgcolor: isFriendClicked ? '#FFD700' : '#FFF3B0',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              フレンド
            </Typography>
          </Box>
          <Box
            onClick={() => setIsFriendClicked(false)}
            sx={{
              flex: 1,
              p: 1,
              textAlign: 'center',
              borderRadius: 2,
              cursor: 'pointer',
              bgcolor: !isFriendClicked ? '#FFD700' : 'transparent',
              color: !isFriendClicked ? 'white' : '#333',
              '&:hover': {
                bgcolor: !isFriendClicked ? '#FFD700' : '#FFF3B0',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              グループ
            </Typography>
          </Box>
        </Box>

        {/* チャットリスト */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#FFD700',
              borderRadius: '4px',
            },
          }}
        >
          {isFriendClicked ? (
            <FriendList friendList={friendList} />
          ) : (
            <GroupList groupList={groupList} />
          )}
        </Box>
      </Box>

      {/* メインコンテンツエリア（デスクトップのみ表示） */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#F4F5F7',
          }}
        >
          <Typography variant="h6" sx={{ color: '#333', textAlign: 'center' }}>
            チャットを選択してください
          </Typography>
        </Box>
      )}

      {/* 右下のFAB */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 100,
          bgcolor: '#FFD700',
          width: 70, // サイズを大きくするために幅を追加
          height: 70, // サイズを大きくするために高さを追加
          '&:hover': {
            bgcolor: '#FFC400',
          },
          transition: 'all 0.3s ease',
        }}
        onClick={() =>
          isFriendClicked
            ? setIsAddFriendModalOpen(true)
            : setIsCreateGroupModalOpen(true)
        }
      >
        {isFriendClicked ? (
          <PersonAdd fontSize="large" />
        ) : (
          <GroupAdd fontSize="large" />
        )}
      </Fab>

      {/* モーダルコンポーネント */}
      <AddFriendModal
        open={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        currentUser={currentUser}
        onFriendAdded={() => fetchFriendsFromFirestore(currentUser.uid)}
      />
      <CreateGroupModal
        open={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        currentUser={currentUser}
        onGroupCreated={async () => {
          const groups = await fetchGroups();
          setGroupList(groups);
          setIsCreateGroupModalOpen(false);
        }}
      />
      <SearchDialog
        open={isSearchDialogOpen}
        onClose={() => setIsSearchDialogOpen(false)}
        friendList={friendList}
        groupList={groupList}
        onSelectFriend={(friendId) => navigate(`/chat/${friendId}`)}
        onSelectGroup={(groupId) => navigate(`/chat/group/${groupId}`)}
      />
    </Box>
  );
};
export default ChatListPage;
