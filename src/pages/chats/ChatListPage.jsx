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
import FriendList from './FriendList';
import GroupList from './GroupList';
import { fetchFriendList } from './mock_api';
import { db } from '../../firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import {
  theme,
  StyledPaper,
  StyledButton,
  StyledTextField,
} from '../../styles/chatlistpageStyles';

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
  // ユーザー情報取得
  const { currentUser } = useAuth();

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
          addedBy: currentUser?.username,
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
                    label="フレンド名を入力"
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
              {isFriendClicked && <FriendList friendList={isFriendList} />}
              {isGroupClicked && <GroupList friendList={isFriendList} />}
            </StyledPaper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ChatListPage;
