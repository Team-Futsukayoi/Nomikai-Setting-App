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
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Groups from '@mui/icons-material/Groups';
import People from '@mui/icons-material/People';
import GroupAdd from '@mui/icons-material/GroupAdd';
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
  limit,
  or,
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
  const [isFriendClicked, setIsFriendClicked] = useState(true);
  const [isGroupClicked, setIsGroupClicked] = useState(false);
  const [isFriendList, setIsFriendList] = useState([]);
  const [friendName, setFriendName] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [groupList, setGroupList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [newFriendId, setNewFriendId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserInfo(userData);

          // フレンドリストを取得
          const friendList = await fetchFriendsFromFirestore(user.uid);
          setIsFriendList(friendList);
        } else {
          console.log('User document does not exist');
        }
      } else {
        navigate('/signin');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!currentUser) return;
      
      try {
        const groupsRef = collection(db, 'groups');
        const querySnapshot = await getDocs(groupsRef);
        
        // クライアント側でフィルタリング
        const groups = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(group => 
            group.members && 
            Array.isArray(group.members) && 
            group.members.some(member => member.uid === currentUser.uid)
          );
        
        setGroupList(groups || []);
      } catch (error) {
        console.error('グループの取得に失敗しました:', error);
        setGroupList([]);
      }
    };

    fetchGroups();
  }, [currentUser]);

  const handleAddFriend = async (targetUser) => {
    if (!currentUser) return;

    try {
      // 自分自身をフレンドに追加しようとしていないか確認
      if (targetUser.id === currentUser.uid) {
        alert('自分自身をフレンドに追加することはできません');
        return;
      }

      // すでにフレンドかどうか確認（双方向）
      const friendsRef = collection(db, 'friends');
      
      // 自分 -> 相手のフレンド関係を確認
      const friendCheckQuery1 = query(
        friendsRef,
        where('userId', '==', currentUser.uid),
        where('friendId', '==', targetUser.id)
      );
      
      // 相手 -> 自分のフレンド関係を確認
      const friendCheckQuery2 = query(
        friendsRef,
        where('userId', '==', targetUser.id),
        where('friendId', '==', currentUser.uid)
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(friendCheckQuery1),
        getDocs(friendCheckQuery2)
      ]);

      if (!snapshot1.empty || !snapshot2.empty) {
        alert('すでにフレンドです');
        return;
      }

      // フレンドを追加（双方向）
      await Promise.all([
        // 自分 -> 相手
        addDoc(collection(db, 'friends'), {
          userId: currentUser.uid,
          friendId: targetUser.id,
          createdAt: serverTimestamp(),
        }),
        // 相手 -> 自分
        addDoc(collection(db, 'friends'), {
          userId: targetUser.id,
          friendId: currentUser.uid,
          createdAt: serverTimestamp(),
        })
      ]);

      // 検索結果から追加したユーザーを削除
      setSearchResults(prev => prev.filter(user => user.id !== targetUser.id));
      
      // 更新されたフレンドリストを再取得
      const updatedFriends = await fetchFriendsFromFirestore(currentUser.uid);
      setIsFriendList(updatedFriends);

      alert(`${targetUser.username}さんをフレンドに追加しました`);
    } catch (error) {
      console.error('フレンド追加中にエラーが発生しました:', error);
      alert('フレンド追加に失敗しました');
    }
  };

  const fetchFriendsFromFirestore = async (userId) => {
    try {
      const friendsQuery = query(
        collection(db, 'friends'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(friendsQuery);

      if (querySnapshot.empty) {
        return [];
      }

      // フレンドシップドキュメントのIDも含める
      const friendships = querySnapshot.docs.map(doc => ({
        friendshipId: doc.id,
        ...doc.data()
      }));

      const friendsData = await Promise.all(
        friendships.map(async (friendship) => {
          const friendDocRef = doc(db, 'users', friendship.friendId);
          const friendDocSnap = await getDoc(friendDocRef);
          if (friendDocSnap.exists()) {
            const friendData = friendDocSnap.data();
            return {
              id: `${friendship.friendshipId}_${friendship.friendId}`, // 一意のIDを生成
              friendId: friendship.friendId,
              username: friendData.username,
              icon: friendData.icon,
              userId: friendData.userId,
            };
          } else {
            return null;
          }
        })
      );

      return friendsData.filter((friend) => friend !== null);
    } catch (error) {
      console.error('フレンドリストの取得に失敗しました:', error);
      return [];
    }
  };

  // 検索機能
  const handleSearch = async (searchText) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const usersRef = collection(db, 'users');
      const q = searchText.toLowerCase();
      
      // ユーザーIDで検索
      const idQuery = query(
        usersRef,
        where('userId', '>=', q),
        where('userId', '<=', q + '\uf8ff'),
        limit(5)
      );

      // ユーザー名で検索
      const nameQuery = query(
        usersRef,
        where('username', '>=', q),
        where('username', '<=', q + '\uf8ff'),
        limit(5)
      );

      const [idResults, nameResults] = await Promise.all([
        getDocs(idQuery),
        getDocs(nameQuery)
      ]);

      // 結果をマージして重複を除去
      const results = new Map();
      [...idResults.docs, ...nameResults.docs].forEach(doc => {
        if (!results.has(doc.id)) {
          results.set(doc.id, { id: doc.id, ...doc.data() });
        }
      });

      // 自分を除外して配列に変換
      const filteredResults = Array.from(results.values())
        .filter(user => user.id !== currentUser.uid);

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('検索中にエラーが発生しました:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 検索入力のディバウンス処理
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // フレンド追加モーダルを開く
  const handleOpenAddFriendModal = () => {
    setIsAddFriendModalOpen(true);
  };

  // フレンド追加モーダルを閉じる
  const handleCloseAddFriendModal = () => {
    setIsAddFriendModalOpen(false);
    setNewFriendId('');
  };

  // フレンド追加の実行
  const handleSubmitAddFriend = async () => {
    if (!newFriendId.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      // ユーザーIDでユーザーを検索
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '==', newFriendId.trim()));
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

      // すでにフレンドかどうか確認（双方向）
      const friendsRef = collection(db, 'friends');
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(query(
          friendsRef,
          where('userId', '==', currentUser.uid),
          where('friendId', '==', friendId)
        )),
        getDocs(query(
          friendsRef,
          where('userId', '==', friendId),
          where('friendId', '==', currentUser.uid)
        ))
      ]);

      if (!snapshot1.empty || !snapshot2.empty) {
        alert('すでにフレンドです');
        return;
      }

      // フレンドを追加（双方向）
      await Promise.all([
        addDoc(collection(db, 'friends'), {
          userId: currentUser.uid,
          friendId: friendId,
          createdAt: serverTimestamp(),
        }),
        addDoc(collection(db, 'friends'), {
          userId: friendId,
          friendId: currentUser.uid,
          createdAt: serverTimestamp(),
        })
      ]);

      // 更新されたフレンドリストを再取得
      const updatedFriends = await fetchFriendsFromFirestore(currentUser.uid);
      setIsFriendList(updatedFriends);

      alert('フレンドを追加しました');
      handleCloseAddFriendModal();
    } catch (error) {
      console.error('フレンド追加中にエラーが発生しました:', error);
      alert('フレンド追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // グループ作成モーダルを開く
  const handleOpenCreateGroupModal = () => {
    setIsCreateGroupModalOpen(true);
  };

  // グループ作成モーダルを閉じる
  const handleCloseCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false);
    setGroupName('');
    setMemberId('');
    setGroupMembers([]);
  };

  // メンバー追加の処理
  const handleAddGroupMember = async () => {
    if (memberId.trim() && !groupMembers.some(m => m.userId === memberId.trim())) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('userId', '==', memberId.trim()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setGroupMembers([...groupMembers, {
            userId: memberId.trim(),
            username: userData.username,
            uid: querySnapshot.docs[0].id
          }]);
          setMemberId('');
          setSnackbar({
            open: true,
            message: 'メンバーを追加しました',
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: 'ユーザーが見つかりません',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('メンバー追加エラー:', error);
        setSnackbar({
          open: true,
          message: 'メンバーの追加に失敗しました',
          severity: 'error'
        });
      }
    }
  };

  // メンバー削除の処理
  const handleRemoveGroupMember = (memberToRemove) => {
    setGroupMembers(groupMembers.filter(member => member.userId !== memberToRemove.userId));
  };

  // グループ作成の処理
  const handleCreateGroup = async () => {
    if (!groupName.trim() || groupMembers.length === 0) return;

    setIsCreatingGroup(true);
    try {
      const newGroup = {
        name: groupName.trim(),
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        members: [
          {
            uid: currentUser.uid,
            userId: currentUser.userId || 'unknown',
            username: currentUser.username || 'unknown',
            role: 'admin'
          },
          ...groupMembers.map(member => ({
            uid: member.uid,
            userId: member.userId,
            username: member.username,
            role: 'member'
          }))
        ],
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'groups'), newGroup);

      setSnackbar({
        open: true,
        message: 'グループを作成しました',
        severity: 'success'
      });

      // グループリストを更新
      const updatedGroups = await fetchGroups();
      setGroupList(updatedGroups);

      handleCloseCreateGroupModal();
    } catch (error) {
      console.error('グループ作成エラー:', error);
      setSnackbar({
        open: true,
        message: 'グループの作成に失敗しました',
        severity: 'error'
      });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Snackbarを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!userInfo) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Box my={4}>
            {/* ユーザー検索フォーム */}
            <StyledPaper sx={{ mb: 4 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <StyledTextField
                    label="ユーザーを検索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    variant="outlined"
                    placeholder="ユーザー名またはIDで検索"
                  />
                </Grid>
              </Grid>
            </StyledPaper>

            {/* 検索結果表示エリア */}
            {searchQuery && (
              <StyledPaper sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  検索結果
                </Typography>
                {isSearching ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : searchResults.length > 0 ? (
                  <List>
                    {searchResults.map((user) => (
                      <ListItem
                        key={user.id}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={user.icon} alt={user.username} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.username}
                          secondary={`ID: ${user.userId}`}
                        />
                        <StyledButton
                          variant="contained"
                          startIcon={<PersonAdd />}
                          onClick={() => handleAddFriend(user)}
                          size="small"
                        >
                          フレンド追加
                        </StyledButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    ユーザーが見つかりませんでした
                  </Typography>
                )}
              </StyledPaper>
            )}

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

            {/* リスト表示 */}
            <StyledPaper>
              {isFriendClicked && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <StyledButton
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={handleOpenAddFriendModal}
                    >
                      フレンドを追加
                    </StyledButton>
                  </Box>
                  <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <FriendList friendList={isFriendList} />
                  </Box>
                </Box>
              )}
              {isGroupClicked && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <StyledButton
                      variant="contained"
                      startIcon={<GroupAdd />}
                      onClick={handleOpenCreateGroupModal}
                    >
                      グループを作成
                    </StyledButton>
                  </Box>
                  <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <GroupList groupList={groupList} />
                  </Box>
                </Box>
              )}
            </StyledPaper>
          </Box>
        </Container>
      </Box>

      {/* フレンド追加モーダル */}
      <Dialog
        open={isAddFriendModalOpen}
        onClose={handleCloseAddFriendModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>フレンドを追加</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ユーザーID"
            type="text"
            fullWidth
            variant="outlined"
            value={newFriendId}
            onChange={(e) => setNewFriendId(e.target.value)}
            placeholder="追加したいユーザーのIDを入力"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddFriendModal} color="primary">
            キャンセル
          </Button>
          <Button
            onClick={handleSubmitAddFriend}
            color="primary"
            variant="contained"
            disabled={isSubmitting || !newFriendId.trim()}
          >
            {isSubmitting ? <CircularProgress size={24} /> : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* グループ作成モーダル */}
      <Dialog
        open={isCreateGroupModalOpen}
        onClose={handleCloseCreateGroupModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>新しいグループを作成</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="グループ名"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              fullWidth
              variant="outlined"
            />
            
            <Box>
              <TextField
                label="メンバーのユーザーID"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                fullWidth
                variant="outlined"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGroupMember();
                  }
                }}
              />
              <Button 
                onClick={handleAddGroupMember}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                メンバーを追加
              </Button>
            </Box>

            {groupMembers.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  追加されたメンバー:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {groupMembers.map((member) => (
                    <Chip
                      key={member.userId}
                      label={`${member.username} (${member.userId})`}
                      onDelete={() => handleRemoveGroupMember(member)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateGroupModal} color="primary">
            キャンセル
          </Button>
          <Button
            onClick={handleCreateGroup}
            color="primary"
            variant="contained"
            disabled={isCreatingGroup || !groupName.trim() || groupMembers.length === 0}
          >
            {isCreatingGroup ? <CircularProgress size={24} /> : 'グループを作成'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default ChatListPage;
