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
    const inputLabel = isFriendClicked ? 'フレンド名を入力' : 'グループ名を入力';

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
                    addedBy: currentUser?.username,
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
                                        label={inputLabel}
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
