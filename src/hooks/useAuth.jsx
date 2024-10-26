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
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              username: userDoc.data().userId, // userIdをusernameとして使用
              // avatarUrl: userDoc.data().avatarUrl, // 必要に応じて他のフィールドも追加
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
