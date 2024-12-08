import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import {
  Box,
  Button,
  Typography,
  Paper,
  ThemeProvider,
  CircularProgress,
} from '@mui/material';
import PersonAdd from '@mui/icons-material/PersonAdd';
import GroupAdd from '@mui/icons-material/GroupAdd';
import { 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import FriendList from './FriendList';
import GroupList from './GroupList';
import { useAuth } from '../../hooks/useAuth';
import { theme, StyledPaper, StyledButton } from '../../styles/chatlistpageStyles';
import { AddFriendModal } from '../../components/friends/AddFriendModal';
import { CreateGroupModal } from '../../components/groups/CreateGroupModal';

export const ChatListPage = () => {
  // ユーザー情報取得
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // 状態管理
  const [isFriendClicked, setIsFriendClicked] = useState(true);
  const [friendList, setFriendList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  // フレンドリストを取得
  const fetchFriendsFromFirestore = async (userId) => {
    try {
      const friendsQuery = query(
        collection(db, 'friends'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(friendsQuery);

      const friendships = querySnapshot.docs.map(doc => ({
        friendshipId: doc.id,
        ...doc.data()
      }));

      const friendsData = await Promise.all(
        friendships.map(async (friendship) => {
          try {
            const friendDocRef = doc(db, 'users', friendship.friendId);
            const friendDocSnap = await getDoc(friendDocRef);
            
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
            return null;
          }
        })
      );

      const validFriends = friendsData.filter(friend => friend !== null);
      return validFriends;
    } catch (error) {
      console.error('フレンドリストの取得に失敗しました:', error);
      return [];
    }
  };

  // グループリストを取得
  const fetchGroups = async () => {
    if (!currentUser) return [];
    
    try {
      const groupsRef = collection(db, 'groups');
      const querySnapshot = await getDocs(groupsRef);
      
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(group => 
          group.members && 
          Array.isArray(group.members) && 
          group.members.some(member => member.uid === currentUser.uid)
        );
    } catch (error) {
      console.error('グループリストの取得に失敗しました:', error);
      return [];
    }
  };

  // データの初期読み込み
  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        setIsLoading(true);
        try {
          const [friends, groups] = await Promise.all([
            fetchFriendsFromFirestore(currentUser.uid),
            fetchGroups()
          ]);
          setFriendList(friends);
          setGroupList(groups);
        } catch (error) {
          console.error('データの読み込みに失敗しました:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [currentUser]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        bgcolor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }
      }}>
        {/* サイドナビゲーション */}
        <Box sx={{
          width: { xs: '100%', md: '280px' },
          bgcolor: 'background.paper',
          borderRight: { md: 1 },
          borderColor: 'divider',
          p: { xs: 2, md: 3 },
        }}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            gap: 2,
            mb: { xs: 2, md: 4 }
          }}>
            <StyledButton
              variant={isFriendClicked ? 'contained' : 'outlined'}
              onClick={() => setIsFriendClicked(true)}
              sx={{ flex: { xs: 1, md: 'auto' } }}
            >
              フレンド
            </StyledButton>
            <StyledButton
              variant={!isFriendClicked ? 'contained' : 'outlined'}
              onClick={() => setIsFriendClicked(false)}
              sx={{ flex: { xs: 1, md: 'auto' } }}
            >
              グループ
            </StyledButton>
          </Box>
        </Box>

        {/* メインコンテンツ */}
        <Box sx={{ 
          flex: 1,
          p: { xs: 2, md: 3 },
          maxWidth: { md: '800px' },
          mx: 'auto'
        }}>
          <StyledPaper>
            <Box sx={{ 
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {isFriendClicked ? 'フレンドリスト' : 'グループリスト'}
              </Typography>
              <StyledButton
                variant="contained"
                startIcon={isFriendClicked ? <PersonAdd /> : <GroupAdd />}
                onClick={() => isFriendClicked ? 
                  setIsAddFriendModalOpen(true) : 
                  setIsCreateGroupModalOpen(true)
                }
              >
                {isFriendClicked ? 'フレンドを追加' : 'グループを作成'}
              </StyledButton>
            </Box>

            <Box sx={{ p: 2 }}>
              {isFriendClicked ? 
                <FriendList 
                  friendList={friendList} 
                  onChatStart={(friendId) => navigate(`/chat/${friendId}`)} 
                /> : 
                <GroupList 
                  groupList={groupList} 
                  onChatStart={(groupId) => navigate(`/chat/group/${groupId}`)} 
                />
              }
            </Box>
          </StyledPaper>
        </Box>

        {/* モーダル */}
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
          onGroupCreated={() => fetchGroups()}
        />
      </Box>
    </ThemeProvider>
  );
};

export default ChatListPage;
