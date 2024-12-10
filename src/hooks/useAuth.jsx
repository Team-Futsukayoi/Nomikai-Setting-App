import { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { initializeOnlineStatus } from '../services/onlineStatus';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [cleanupOnlineStatus, setCleanupOnlineStatus] = useState(null);

  const signOut = async () => {
    try {
      if (cleanupOnlineStatus) {
        await cleanupOnlineStatus();
        setCleanupOnlineStatus(null);
      }
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('サインアウトエラー:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              username: userData.username || userData.userId,
              userId: userData.userId,
            });
            const cleanup = initializeOnlineStatus(user.uid);
            setCleanupOnlineStatus(() => cleanup);
          }
        } catch (error) {
          console.error('ユーザー情報の取得に失敗しました:', error);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { currentUser, signOut };
};
