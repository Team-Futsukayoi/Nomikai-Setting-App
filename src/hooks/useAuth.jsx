import { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Firestoreから追加のユーザー情報を取得
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              username: userData.username || userData.userId, // usernameがない場合はuserIdを使用
              userId: userData.userId,
            });
          }
        } catch (error) {
          console.error('ユーザー情報の取得に失敗しました:', error);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return { currentUser };
};
