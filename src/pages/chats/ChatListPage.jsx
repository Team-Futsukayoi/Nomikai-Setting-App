import { useState, useEffect } from 'react';
import { Box, Button, Container, TextField, Typography, Avatar, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { collection, addDoc, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import FriendList from './FriendList';
import GroupList from './GroupList';


export const ChatListPage = () => {
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

  // Firestoreからフレンドリストを取得する関数
  const fetchFriendsFromFirestore = async (userId) => {
    try {
      const friendsQuery = query(
        collection(db, 'friends'),
        where('addedBy', '==', userId)
      );
      const querySnapshot = await getDocs(friendsQuery);
      const friends = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return friends;
    } catch (error) {
      console.error('フレンドリストの取得に失敗しました:', error);
      return [];
    }
  };

  // ユーザー情報とフレンドリストを取得
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // ユーザーが認証されている場合、Firestoreからユーザー情報を取得
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserInfo(userData);
          // ユーザー固有のフレンドリストを取得
          const friendList = await fetchFriendsFromFirestore(userData.userId);
          setIsFriendList(friendList);
        }
      } else {
        // ユーザーが認証されていない場合、ログインページにリダイレクト
        navigate('/signin');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // フレンド追加処理
  const handleAddFriend = async () => {
    if (friendName.trim() && userInfo) {
      try {
        const docRef = await addDoc(collection(db, 'friends'), {
          name: friendName,
          addedBy: userInfo.userId,
        });
        console.log('フレンドを追加しました。ID:', docRef.id);
        setFriendName('');
        // 更新されたフレンドリストを再取得
        const updatedFriends = await fetchFriendsFromFirestore(userInfo.userId);
        setIsFriendList(updatedFriends);
      } catch (error) {
        console.error('フレンド追加中にエラーが発生しました:', error);
      }
    }
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="md">
      <Box my={4}>
        {/* ユーザー情報表示 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                src={userInfo.icon || ''}
                alt={userInfo.userId}
                sx={{ width: 80, height: 80 }}
              />
            </Grid>
            <Grid item>
              <Typography variant="h5">{userInfo.userId}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* フレンド/グループ切り替えボタン */}
        <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
          <Grid item>
            <Button
              variant="contained"
              color={isFriendClicked ? 'primary' : 'secondary'}
              onClick={() => {
                setIsFriendClicked(true);
                setIsGroupClicked(false);
                console.log('FriendPage');
              }}
            >
              フレンド
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color={isGroupClicked ? 'primary' : 'secondary'}
              onClick={() => {
                setIsGroupClicked(true);
                setIsFriendClicked(false);
                console.log('GroupPage');
              }}
            >
              グループ
            </Button>
          </Grid>
        </Grid>

        {/* フレンド追加フォーム */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={8}>
              <TextField
                label="フレンド名"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddFriend}
                fullWidth
              >
                フレンドを追加
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* フレンドリストまたはグループリストの表示 */}
        <Box>
          {isFriendClicked && <FriendList friendList={isFriendList} />}
          {isGroupClicked && <GroupList friendList={isFriendList} />}
        </Box>
      </Box>
    </Container>
  );
};

export default ChatListPage;
