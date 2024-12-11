import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Paper,
  Container,
  ThemeProvider,
  AvatarGroup,
  Collapse,
  Fab,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { useAuth } from '../../hooks/useAuth';
import theme from '../../styles/theme';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import GroupEvent from '../events/components/GroupEventPreview';
import EventGenerationTest from '../events/tests/EventGenerationTest';
import GroupEventPreview from '../events/components/GroupEventPreview';
import { generateEvent } from '../events/services/eventGenerator';
import { getLoader } from '../events/api/googlePlacesApi';
import AddIcon from '@mui/icons-material/Add';
import GroupEventDetail from '../events/components/GroupEventDetail';

function GroupChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { groupId } = useParams();
  const { currentUser } = useAuth();
  const [groupInfo, setGroupInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const [groupEvent, setGroupEvent] = useState(null);
  const [isEventExpanded, setIsEventExpanded] = useState(false);
  const navigate = useNavigate();
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // グループ情報とメッセージの取得
  useEffect(() => {
    if (!currentUser || !groupId) return;

    // グループ情報を取得
    const fetchGroupInfo = async () => {
      try {
        const groupRef = doc(db, 'groups', groupId);
        const groupSnap = await getDoc(groupRef);
        if (groupSnap.exists()) {
          setGroupInfo(groupSnap.data());
        } else {
          console.error('グループが見つかりません');
        }
      } catch (error) {
        console.error('グループ情報の取得エラー:', error);
      }
    };

    fetchGroupInfo();

    // グループメッセージを取得
    const q = query(
      collection(db, 'groupMessages'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedMessages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          readBy: doc.data().readBy || [],
        }));

        // 未読メッセージを既読状態に更新
        fetchedMessages.forEach((message) => {
          if (
            !message.readBy.includes(currentUser.uid) &&
            message.userId !== currentUser.uid
          ) {
            markAsRead(message.id);
          }
        });

        setMessages(fetchedMessages);
      },
      (error) => {
        console.error('メッセージ取得エラー:', error);
      }
    );

    // イベント情報を取得
    const fetchGroupEvent = async () => {
      if (!groupId) return;

      const eventRef = doc(db, 'groups', groupId, 'events', 'current');
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        setGroupEvent(eventSnap.data());
      }
    };

    fetchGroupEvent();

    return () => {
      unsubscribe();
    };
  }, [currentUser, groupId]);

  // 自動スクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Google Maps APIの初期化
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        await getLoader().load();
        setMapsLoaded(true);
      } catch (error) {
        console.error('Google Maps API初期化エラー:', error);
      }
    };

    initGoogleMaps();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      const messageData = {
        text: newMessage,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        username: currentUser.username || 'unknown',
        groupId: groupId,
        readBy: [currentUser.uid],
      };

      await addDoc(collection(db, 'groupMessages'), messageData);
      setNewMessage('');
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const messageRef = doc(db, 'groupMessages', messageId);
      await updateDoc(messageRef, {
        readBy: arrayUnion(currentUser.uid),
      });
    } catch (error) {
      console.error('既読状態の更新に失敗しました:', error);
    }
  };

  const getReadStatus = (message) => {
    const totalMembers = groupInfo?.members?.length || 0;
    const readCount = message.readBy?.length || 0;
    if (readCount <= 1) return '';
    return `既読 ${readCount - 1}`;
  };

  const handleToggleEvent = () => {
    setIsEventExpanded(!isEventExpanded);
  };

  // イベントの取得処理
  useEffect(() => {
    if (!groupId) return;

    const eventRef = doc(db, 'groups', groupId, 'events', 'current');
    const unsubscribe = onSnapshot(eventRef, (doc) => {
      if (doc.exists()) {
        console.log('取得したイベントデータ:', doc.data()); // デバッグ用
        setGroupEvent(doc.data());
      } else {
        setGroupEvent(null);
      }
    });

    return () => unsubscribe();
  }, [groupId]);

  // イベント生成処理
  const handleGenerateEvent = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const commonTimeSlots = ['evening', 'night', 'latenight'];
      const result = await generateEvent(commonTimeSlots, groupId);

      const eventRef = doc(db, 'groups', groupId, 'events', 'current');
      const today = new Date();
      const formattedDate = format(today, 'yyyy/MM/dd');

      console.log('保存する日付:', formattedDate); // デバッグ用

      await setDoc(
        eventRef,
        {
          store: result.store,
          timeSlot: result.timeSlot,
          date: formattedDate, // 日付を文字列として保存
          participants: {},
          createdAt: serverTimestamp(),
        },
        { merge: false }
      );
    } catch (error) {
      console.error('イベント生成エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          bgcolor: '#EAEAEA',
          height: 'calc(100vh - 144px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ヘッダー */}
        <Box
          sx={{
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            borderRadius: '0 0 24px 24px',
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AvatarGroup
                max={2}
                sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}
              >
                {groupInfo?.members?.map((member) => (
                  <Avatar
                    key={member.uid}
                    alt={member.username}
                    sx={{
                      width: 44,
                      height: 44,
                      border: 2,
                      borderColor: 'primary.light',
                    }}
                  />
                ))}
              </AvatarGroup>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  {groupInfo?.name || 'グループチャット'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {groupInfo?.members?.length || 0}人のメンバー
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* メッセージエリア */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            mt: '88px',
            mb: '75px',
            zIndex: 1,
            height: 'calc(100vh - 280px)',
            maxHeight: 'calc(100vh - 280px)',
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems:
                  message.userId === currentUser.uid
                    ? 'flex-end'
                    : 'flex-start',
              }}
            >
              {message.userId !== currentUser.uid && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    ml: 2,
                    mb: 0.5,
                  }}
                >
                  {message.username}
                </Typography>
              )}
              <Box
                sx={{
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    px: 2,
                    background:
                      message.userId === currentUser.uid
                        ? 'linear-gradient(135deg, #FFD700, #FFC400)'
                        : 'linear-gradient(135deg, #FFFFFF, #F5F5F5)',
                    color:
                      message.userId === currentUser.uid
                        ? 'white'
                        : 'text.primary',
                    borderRadius:
                      message.userId === currentUser.uid
                        ? '20px 20px 0 20px'
                        : '20px 20px 20px 0',
                    wordBreak: 'break-word',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    px: 0.5,
                  }}
                >
                  {message.createdAt &&
                    format(message.createdAt.toDate(), 'HH:mm', { locale: ja })}
                  {' '}
                  {getReadStatus(message)}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* イベントコンポーネント */}
        {groupEvent && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 144,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '92%',
              maxWidth: '450px',
              zIndex: 2,
              mb: 3,
            }}
          >
            <Collapse in={isEventExpanded}>
              <GroupEventDetail
                event={groupEvent}
                groupId={groupId}
                onClose={() => setIsEventExpanded(false)}
              />
            </Collapse>
            <GroupEventPreview
              event={groupEvent}
              isExpanded={isEventExpanded}
              onToggle={handleToggleEvent}
              sx={{ mb: 2 }}
            />
          </Box>
        )}

        {/* コメント入力セクション */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 72,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            zIndex: 2,
          }}
        >
          <Paper
            component="form"
            onSubmit={sendMessage}
            elevation={0}
            sx={{
              p: 2,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '24px 24px 0 0',
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              position: 'fixed',
              bottom: '80px',
              left: 0,
              right: 0,
              boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <TextField
              fullWidth
              variant="standard"
              placeholder="メッセージを入力"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: {
                  bgcolor: 'rgba(245, 245, 245, 0.8)',
                  borderRadius: '16px',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    bgcolor: 'rgba(245, 245, 245, 0.9)',
                  },
                },
              }}
            />
            <IconButton
              type="submit"
              disabled={!newMessage.trim()}
              sx={{
                background: 'linear-gradient(135deg, #FFD700, #FFC400)',
                color: 'white',
                width: 48,
                height: 48,
                borderRadius: '50%',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFC400, #FFB300)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <SendRoundedIcon />
            </IconButton>
          </Paper>
        </Box>

        {/* イベント生成ボタン */}
        {/* <Tooltip title="イベントを生成"> */}
        {/* <Fab */}
        {/* color="primary" */}
        {/* sx={{ */}
        {/* position: 'fixed', */}
        {/* right: 24, */}
        {/* bottom: 96, */}
        {/* bgcolor: 'warning.main', */}
        {/* '&:hover': { */}
        {/* bgcolor: 'warning.dark', */}
        {/* }, */}
        {/* }} */}
        {/* onClick={handleGenerateEvent} */}
        {/* disabled={loading} */}
        {/* > */}
        {/* {loading ? <CircularProgress size={24} /> : <AddIcon />} */}
        {/* </Fab> */}
        {/* </Tooltip> */}
      </Box>
    </ThemeProvider>
  );
}

export default GroupChatPage;
