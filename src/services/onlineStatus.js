import {
  ref,
  onDisconnect,
  set,
  onValue,
  off,
  get,
  remove,
} from 'firebase/database';
import { realTimeDb } from '../firebaseConfig';

export const initializeOnlineStatus = (userId) => {
  if (!userId) return;

  const userStatusRef = ref(realTimeDb, `/status/${userId}`);

  // 接続が切れた時の処理を設定
  onDisconnect(userStatusRef).set({
    state: 'offline',
    lastSeen: new Date().toISOString(),
  });

  // オンラインステータスを設定
  set(userStatusRef, {
    state: 'online',
    lastSeen: new Date().toISOString(),
  });

  // クリーンアップ関数を返す
  return async () => {
    try {
      // ステータスノードを完全に削除
      await remove(userStatusRef);
      // onDisconnectハンドラーをキャンセル
      await onDisconnect(userStatusRef).cancel();
    } catch (error) {
      console.error('オンラインステータスのクリーンアップに失敗:', error);
    }
  };
};

export const subscribeToUserStatus = (userId, callback) => {
  if (!userId) return () => {};

  const userStatusRef = ref(realTimeDb, `/status/${userId}`);

  onValue(userStatusRef, (snapshot) => {
    const data = snapshot.val();
    callback(data?.state || 'offline');
  });

  // クリーンアップ関数を返す
  return () => off(userStatusRef);
};

export const subscribeToMultipleUserStatus = (userIds, callback) => {
  if (!userIds || userIds.length === 0) return () => {};

  const statusRefs = userIds.map((userId) =>
    ref(realTimeDb, `/status/${userId}`)
  );
  const unsubscribes = statusRefs.map((statusRef, index) => {
    const onValueChange = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      callback(
        userIds[index],
        data?.state || 'offline',
        data?.lastSeen || null
      );
    });
    return () => off(statusRef, onValueChange);
  });

  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
};
