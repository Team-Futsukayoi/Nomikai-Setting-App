import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Avatar,
  Grid,
  Paper,
} from '@mui/material';

import { useState, useEffect } from 'react';
import FriendList from './FriendList';
import GroupList from './GroupList';
import { fetchFriendList } from './mock_api';
import { db } from '../../firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// テスト用のユーザー情報を取得する関数
function getUserInfo() {
  const testdata_userinfo = {
    id: 1,
    username: 'xyamyko',
    icon: 'https://img.benesse-cms.jp/pet-dog/item/image/normal/resized/resized_5920ec8f-c0ae-4caa-8a37-25e538152b12.jpg',
  };
  return testdata_userinfo;
}

export const ChatListPage = () => {
  // 状態管理
  const [isFriendClicked, setIsFriendClicked] = useState(false);
  const [isGroupClicked, setIsGroupClicked] = useState(false);
  const [isFriendList, setIsFriendList] = useState([]);
  const [friendName, setFriendName] = useState('');

  const userinfo = getUserInfo();

  // Firestoreからフレンドリストを取得する関数
  const fetchFriendsFromFirestore = async () => {
    const querySnapshot = await getDocs(collection(db, 'friends'));
    const friends = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return friends;
  };

  // コンポーネントマウント時にフレンドリストを取得
  useEffect(() => {
    const getFriends = async () => {
      const friendList = await fetchFriendsFromFirestore();
      if (Array.isArray(friendList)) {
        setIsFriendList(friendList);
      } else {
        setIsFriendList([friendList]);
      }
    };
    getFriends();
  }, []);

  // フレンド追加処理
  const handleAddFriend = async () => {
    if (friendName.trim()) {
      try {
        const docRef = await addDoc(collection(db, 'friends'), {
          name: friendName,
          addedBy: userinfo.username,
        });
        console.log('フレンドを追加しました。ID:', docRef.id);
        setFriendName('');
        const updatedFriends = await fetchFriendsFromFirestore();
        setIsFriendList(updatedFriends);
      } catch (error) {
        console.error('エラーが発生しました:', error);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Box my={4}>
        {/* ユーザー情報表示 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                src={userinfo.icon}
                alt={userinfo.username}
                sx={{ width: 80, height: 80 }}
              />
            </Grid>
            <Grid item>
              <Typography variant="h5">{userinfo.username}</Typography>
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
