import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Avatar,
  Grid,
  Paper,
  ThemeProvider,
} from '@mui/material';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Groups from '@mui/icons-material/Groups';
import People from '@mui/icons-material/People';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import FriendList from './FriendList';
import GroupList from './GroupList';
import { fetchFriendList } from './mock_api';
import { useAuth } from '../../hooks/useAuth';
import {
  theme,
  StyledPaper,
  StyledButton,
  StyledTextField,
} from '../../styles/chatlistpageStyles';

export const ChatListPage = () => {
  // ユーザー情報取得
  const { currentUser } = useAuth();

  // 状態管理
  const [isFriendClicked, setIsFriendClicked] = useState(false);
  const [isGroupClicked, setIsGroupClicked] = useState(false);
  const [isFriendList, setIsFriendList] = useState([]);
  const [friendName, setFriendName] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  // const userinfo = getUserInfo();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // ユーザーが認証されている場合、Firestoreからユーザー情報を取得
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
        }
      } else {
        // ユーザーが認証されていない場合、ログインページにリダイレクト
        navigate('/signin');
      }
    });

    return () => unsubscribe();
  }, [navigate]);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserInfo(userData);
          // ユーザー固有のフレンドリストを取得
          const friendList = await fetchFriendsFromFirestore(userData.userId);
          setIsFriendList(friendList);
        }
      } else {
        navigate('/signin');
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);

  const handleAddFriend = async () => {
    if (friendName.trim() && currentUser) {
      try {
        // ユーザーIDでユーザーを検索
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userId', '==', friendName));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          alert('ユーザーが見つかりません');
          return;
        }
  
        const friendUser = querySnapshot.docs[0];
        const friendId = friendUser.id;
  
        // 自分自身をフレンドに追加しようとしていないか確認
        if (friendId === currentUser.uid) {
          alert('自分自身をフレンドに追加することはできません');
          return;
        }
  
        // すでにフレンドかどうか確認
        const friendsRef = collection(db, 'friends');
        const friendCheckQuery = query(
          friendsRef,
          where('userId', '==', currentUser.uid),
          where('friendId', '==', friendId)
        );
        const friendCheckSnapshot = await getDocs(friendCheckQuery);
  
        if (!friendCheckSnapshot.empty) {
          alert('すでにフレンドです');
          return;
        }
  
        // フレンドを追加
        await addDoc(collection(db, 'friends'), {
          userId: userInfo.userId,
          friendId: friendId,
          createdAt: serverTimestamp()
        });
  
        console.log('フレンドを追加しました。');
        setFriendName('');
        // 更新されたフレンドリストを再取得
        const updatedFriends = await fetchFriendsFromFirestore(userInfo.userId);
        setIsFriendList(updatedFriends);
      } catch (error) {
        console.error('フレンド追加中にエラーが発生しました:', error);
      }
    }
  };

  const fetchFriendsFromFirestore = async (userId) => {
    try {
      console.log("Fetching friends for userId:", userId);
      const friendsQuery = query(
        collection(db, 'friends'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(friendsQuery);
      console.log("Friends query snapshot size:", querySnapshot.size);
      console.log("Friends query snapshot docs:", querySnapshot.docs.map(doc => doc.data()));
  
      if (querySnapshot.empty) {
        console.log("No friends found for this user");
        return [];
      }
  
      const friendIds = querySnapshot.docs.map(doc => doc.data().friendId);
      console.log("Friend IDs:", friendIds);
  
      const friendsData = await Promise.all(
        friendIds.map(async (friendId) => {
          console.log("Fetching data for friendId:", friendId);
          const friendDocRef = doc(db, 'users', friendId);
          const friendDocSnap = await getDoc(friendDocRef);
          if (friendDocSnap.exists()) {
            const friendData = friendDocSnap.data();
            console.log("Friend data for", friendId, ":", friendData);
            return {
              id: friendId,
              username: friendData.username,
              icon: friendData.icon,
              userId: friendData.userId
            };
          } else {
            console.log("Friend document does not exist for friendId:", friendId);
            return null;
          }
        })
      );
  
      const filteredFriends = friendsData.filter(friend => friend !== null);
      console.log("Filtered friends:", filteredFriends);
      return filteredFriends;
    } catch (error) {
      console.error('フレンドリストの取得に失敗しました:', error);
      return [];
    }
  };

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log("User authenticated:", user.uid);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data:", userData);
        setUserInfo(userData);
        const friendList = await fetchFriendsFromFirestore(user.uid);
        console.log("Fetched friend list in useEffect:", friendList);
        setIsFriendList(friendList);
      } else {
        console.log("User document does not exist");
      }
    } else {
      console.log("User not authenticated, navigating to signin");
      navigate('/signin');
    }
  });

  return () => unsubscribe();
}, [navigate]);


  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Box my={4}>
            {/* ユーザー情報表示 */}
            <StyledPaper sx={{ mb: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar
                    src={currentUser?.icon}
                    alt={currentUser?.username}
                    sx={{
                      width: 100,
                      height: 100,
                      border: 4,
                      borderColor: 'primary.main',
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    {currentUser?.username}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    オンライン
                  </Typography>
                </Grid>
              </Grid>
            </StyledPaper>

            {/* フレンド/グループ切り替えボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <StyledButton
                variant={isFriendClicked ? 'contained' : 'outlined'}
                startIcon={<People />}
                onClick={() => {
                  setIsFriendClicked(true);
                  setIsGroupClicked(false);
                }}
                sx={{ mr: 2 }}
              >
                フレンド
              </StyledButton>
              <StyledButton
                variant={isGroupClicked ? 'contained' : 'outlined'}
                startIcon={<Groups />}
                onClick={() => {
                  setIsGroupClicked(true);
                  setIsFriendClicked(false);
                }}
              >
                グループ
              </StyledButton>
            </Box>

            {/* フレンド追加フォーム */}
            <StyledPaper sx={{ mb: 4 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={9}>
                  <StyledTextField
                    label="フレンドのユーザーIDを入力"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    placeholder="新しいフレンドを追加"
                  />
                </Grid>
                <Grid item xs={3}>
                  <StyledButton
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={handleAddFriend}
                    fullWidth
                  >
                    追加
                  </StyledButton>
                </Grid>
              </Grid>
            </StyledPaper>

            {/* リスト表示 */}
            <StyledPaper>
              {isFriendClicked && (
                <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}> {/* maxHeightとoverflowYを追加 */}
        <FriendList friendList={isFriendList} />
    </Box>
  )}
              {isGroupClicked && <GroupList friendList={isFriendList} />}
            </StyledPaper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ChatListPage;
