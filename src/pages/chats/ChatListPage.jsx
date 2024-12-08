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
  IconButton,
  InputAdornment,
  AvatarGroup,
  Divider,
} from '@mui/material';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Groups from '@mui/icons-material/Groups';
import People from '@mui/icons-material/People';
import GroupAdd from '@mui/icons-material/GroupAdd';
import SearchIcon from '@mui/icons-material/Search';
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
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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

  // グループリストを取得する関数
  const fetchGroups = async () => {
    if (!currentUser) return [];
    
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
      
      return groups;
    } catch (error) {
      console.error('グループリスト���取得に失敗しました:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadGroups = async () => {
      if (currentUser) {
        const groups = await fetchGroups();
        setGroupList(groups);
      }
    };

    loadGroups();
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

      // フレンドシップドキュメントのID含める
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
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      if (isFriendClicked) {
        // フレンドリストから検索
        const filteredFriends = isFriendList.filter(friend => {
          if (!friend) return false;
          
          const searchTerm = query.toLowerCase();
          return (
            (friend.userId && friend.userId.toLowerCase().includes(searchTerm)) ||
            (friend.username && friend.username.toLowerCase().includes(searchTerm))
          );
        });
        
        setSearchResults(filteredFriends);
      } else {
        // グループリストから検索
        const filteredGroups = groupList.filter(group => {
          if (!group || !group.name || !Array.isArray(group.members)) return false;

          const searchTerm = query.toLowerCase();
          const nameMatch = group.name.toLowerCase().includes(searchTerm);
          const memberMatch = group.members.some(member => 
            member && (
              (member.userId && member.userId.toLowerCase().includes(searchTerm)) ||
              (member.username && member.username.toLowerCase().includes(searchTerm))
            )
          );
          
          return nameMatch || memberMatch;
        });
        setSearchResults(filteredGroups);
      }
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
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isFriendClicked, isFriendList, groupList]);

  // チャットページへの遷移
  const handleChatNavigation = (item) => {
    if (isFriendClicked) {
      // フレンドとのチャットへ
      navigate(`/chat/${item.friendId}`);
    } else {
      // グループチャットへ
      navigate(`/chat/group/${item.id}`);
    }
    handleCloseSearchModal();
  };

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
      // ユーザーIDでユーザー検索
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '==', newFriendId.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSnackbar({
          open: true,
          message: 'ユーザーが見つかりません',
          severity: 'error'
        });
        return;
      }

      const friendUser = querySnapshot.docs[0];
      const friendId = friendUser.id;

      // 自分自身をフレンドに追加しようとしていないか確認
      if (friendId === currentUser.uid) {
        setSnackbar({
          open: true,
          message: '自分自身をフレンドに追加することはできません',
          severity: 'warning'
        });
        return;
      }

      // すでにフレンドかどうか確認
      const friendsRef = collection(db, 'friends');
      const friendCheckQuery = query(
        friendsRef,
        where('users', 'array-contains-any', [currentUser.uid, friendId])
      );
      
      const friendSnapshot = await getDocs(friendCheckQuery);
      const existingFriendship = friendSnapshot.docs.some(doc => {
        const data = doc.data();
        return data.users.includes(currentUser.uid) && data.users.includes(friendId);
      });

      if (existingFriendship) {
        setSnackbar({
          open: true,
          message: 'すでにフレンドです',
          severity: 'warning'
        });
        return;
      }

      // フレンドを追加
      await addDoc(collection(db, 'friends'), {
        users: [currentUser.uid, friendId],
        createdAt: serverTimestamp(),
      });

      // フレンドリストを更新
      const friendsData = await Promise.all(
        friendSnapshot.docs.map(async (doc) => {
          const friendData = doc.data();
          const targetId = friendData.users.find(id => id !== currentUser.uid);
          if (!targetId) return null;

          const userDoc = await getDoc(doc(db, 'users', targetId));
          if (!userDoc.exists()) return null;

          const userData = userDoc.data();
          return {
            id: doc.id,
            friendId: targetId,
            username: userData.username,
            userId: userData.userId,
            icon: userData.photoURL
          };
        })
      );

      setIsFriendList(friendsData.filter(friend => friend !== null));
      setSnackbar({
        open: true,
        message: 'フレンドを追加しました',
        severity: 'success'
      });
      handleCloseAddFriendModal();
    } catch (error) {
      console.error('フレンド追加中にエラーが発生しました:', error);
      setSnackbar({
        open: true,
        message: 'フレンド追加に失敗しました',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // グループ作成モーダルを開く
  const handleOpenCreateGroupModal = () => {
    // 自分をメンバーとして初期設定
    setGroupMembers([{
      uid: currentUser.uid,
      userId: currentUser.userId,
      username: currentUser.username,
      role: 'admin',
      isCurrentUser: true // 自分であることを示すフラグ
    }]);
    setIsCreateGroupModalOpen(true);
  };

  // メンバー追加の処理
  const handleAddGroupMember = async () => {
    if (!memberId.trim()) return;

    // 自分のIDと同じ場合は追加しない
    if (memberId.trim() === currentUser.userId) {
      setSnackbar({
        open: true,
        message: '自分自身を追加することはできません',
        severity: 'warning'
      });
      setMemberId('');
      return;
    }

    // 既に追加済みのメンバーかチェック
    if (groupMembers.some(m => m.userId === memberId.trim())) {
      setSnackbar({
        open: true,
        message: '既に追加されているメンバーです',
        severity: 'warning'
      });
      setMemberId('');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '==', memberId.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setGroupMembers([...groupMembers, {
          userId: memberId.trim(),
          username: userData.username,
          uid: querySnapshot.docs[0].id,
          role: 'member'
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
  };

  // メンバー削除の処理
  const handleRemoveGroupMember = (memberToRemove) => {
    // 自分（管理者）は削除できない
    if (memberToRemove.isCurrentUser) {
      setSnackbar({
        open: true,
        message: '管理者は削除できません',
        severity: 'warning'
      });
      return;
    }
    setGroupMembers(groupMembers.filter(member => member.userId !== memberToRemove.userId));
  };

  // グループ作成の処理
  const handleCreateGroup = async () => {
    if (!groupName.trim() || groupMembers.length <= 1) {
      setSnackbar({
        open: true,
        message: 'グループ名と少なくとも1人のメンバーを追加してください',
        severity: 'warning'
      });
      return;
    }

    setIsCreatingGroup(true);
    try {
      const newGroup = {
        name: groupName.trim(),
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        members: groupMembers.map(member => ({
          uid: member.uid,
          userId: member.userId,
          username: member.username,
          role: member.role
        })),
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

  // グループ作成モーダルを閉じる
  const handleCloseCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false);
    setGroupName('');
    setMemberId('');
    setGroupMembers([]);
  };

  // Snackbarを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 検索モーダルを開く
  const handleOpenSearchModal = () => {
    setIsSearchModalOpen(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  // 検索モーダルを閉じる
  const handleCloseSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchQuery('');
    setSearchResults([]);
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
      <Box sx={{ 
        bgcolor: 'background.default',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }
      }}>
        {/* サイドナビゲーション - デスクトップでは左側、モバイルでは上部 */}
        <Box
          sx={{
            width: { xs: '100%', md: '280px' },
            height: { xs: 'auto', md: '100vh' },
            bgcolor: 'background.paper',
            borderRight: { md: 1 },
            borderBottom: { xs: 1, md: 0 },
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            py: { xs: 1, md: 3 },
            px: { xs: 2, md: 3 },
          }}
        >
          {/* フレンド/グループ切替ボタン */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            gap: 2,
            mb: { xs: 2, md: 4 }
          }}>
            <StyledButton
              variant={isFriendClicked ? 'contained' : 'outlined'}
              onClick={() => {
                setIsFriendClicked(true);
                setIsGroupClicked(false);
              }}
              sx={{ 
                flex: { xs: 1, md: 'auto' },
                py: 1.5,
                fontSize: '1rem',
                justifyContent: 'flex-start',
                px: 3,
              }}
            >
              フレンド
            </StyledButton>
            <StyledButton
              variant={isGroupClicked ? 'contained' : 'outlined'}
              onClick={() => {
                setIsGroupClicked(true);
                setIsFriendClicked(false);
              }}
              sx={{ 
                flex: { xs: 1, md: 'auto' },
                py: 1.5,
                fontSize: '1rem',
                justifyContent: 'flex-start',
                px: 3,
              }}
            >
              グループ
            </StyledButton>
          </Box>

          {/* 検索ボタン */}
          <StyledButton
            variant="outlined"
            onClick={handleOpenSearchModal}
            startIcon={<SearchIcon />}
            sx={{
              width: '100%',
              py: 1.5,
              justifyContent: 'flex-start',
              px: 3,
              display: { xs: 'none', md: 'flex' }
            }}
          >
            検索
          </StyledButton>

          {/* モバイル用検索ボタン */}
          <IconButton
            onClick={handleOpenSearchModal}
            sx={{
              display: { xs: 'flex', md: 'none' },
              position: 'fixed',
              bottom: 72,
              right: 16,
              zIndex: 1000,
              bgcolor: 'background.paper',
              boxShadow: 3,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <SearchIcon />
          </IconButton>
        </Box>

        {/* メインコンテンツ */}
        <Box sx={{ 
          flex: 1,
          p: { xs: 1, sm: 2, md: 3 },
          maxWidth: { md: '800px' },
          mx: 'auto',
          width: '100%'
        }}>
          <StyledPaper
            sx={{
              height: { xs: 'calc(100vh - 140px)', md: 'calc(100vh - 48px)' },
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* リストヘッダー */}
            <Box sx={{ 
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" component="h2">
                {isFriendClicked ? 'フレンドリスト' : 'グループリスト'}
              </Typography>
              <StyledButton
                variant="contained"
                startIcon={isFriendClicked ? <PersonAdd /> : <GroupAdd />}
                onClick={isFriendClicked ? handleOpenAddFriendModal : handleOpenCreateGroupModal}
                size="medium"
              >
                {isFriendClicked ? 'フレンドを追加' : 'グループを作成'}
              </StyledButton>
            </Box>

            {/* リスト表示エリア */}
            <Box sx={{ 
              flex: 1,
              overflow: 'auto',
              px: 2,
              py: 1
            }}>
              {isFriendClicked && <FriendList friendList={isFriendList} />}
              {isGroupClicked && <GroupList groupList={groupList} />}
            </Box>
          </StyledPaper>
        </Box>

        {/* 検索モーダル */}
        <Dialog
          open={isSearchModalOpen}
          onClose={handleCloseSearchModal}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              margin: { xs: '16px', sm: '32px' },
              width: { xs: 'calc(100% - 32px)', sm: '600px' }
            }
          }}
        >
          <DialogTitle>
            {isFriendClicked ? "フレン��を検索" : "グループを検索"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                autoFocus
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isFriendClicked ? "フレンド名またはIDで検索" : "グループ名またはメンバー名で検索"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {isSearching ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : searchResults.length > 0 ? (
              <List sx={{ mt: 2 }}>
                {searchResults.map((item) => (
                  <ListItem
                    key={isFriendClicked ? item.id : item.id}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                    onClick={() => handleChatNavigation(item)}
                  >
                    {isFriendClicked ? (
                      <>
                        <ListItemAvatar>
                          <Avatar src={item.icon} alt={item.userId || item.username} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.username || item.userId}
                          secondary={item.username ? `ID: ${item.userId}` : null}
                        />
                      </>
                    ) : (
                      <>
                        <ListItemAvatar>
                          <AvatarGroup
                            max={3}
                            sx={{
                              '& .MuiAvatar-root': {
                                width: 40,
                                height: 40,
                                fontSize: '1rem',
                              },
                            }}
                          >
                            {item.members.map((member, index) => (
                              <Avatar
                                key={`${item.id}_${member.uid}_${index}`}
                                alt={member.userId || member.username}
                                src={member.icon}
                              />
                            ))}
                          </AvatarGroup>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.name}
                          secondary={`${item.members.length}人のメンバー`}
                        />
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : searchQuery ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {isFriendClicked ? 'フレンドが見つかりません' : 'グループが見つかりません'}
                </Typography>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSearchModal} color="primary">
              閉じる
            </Button>
          </DialogActions>
        </Dialog>

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
                    メンバー:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {groupMembers.map((member) => (
                      <Chip
                        key={member.userId}
                        label={`${member.username}${member.isCurrentUser ? ' (管理者)' : ''}`}
                        onDelete={member.isCurrentUser ? undefined : () => handleRemoveGroupMember(member)}
                        color={member.isCurrentUser ? 'primary' : 'default'}
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
      </Box>
    </ThemeProvider>
  );
};

export default ChatListPage;
