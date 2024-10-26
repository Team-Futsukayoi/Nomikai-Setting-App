import React, { useEffect, useState } from 'react';
import { auth } from './firebaseConfig'; // Firebase設定をインポート
import { onAuthStateChanged } from 'firebase/auth'; // Firebaseのログイン状態を監視
import { Routes, Route } from 'react-router-dom';
import { SignUp } from './pages/auth/SignUp';
import { SignIn } from './pages/auth/SignIn';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Firebaseのログイン状態を監視
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log(`ログインユーザー: ${currentUser.email}`);
      } else {
        console.log('ログインしていません');
      }
    });

    return () => unsubscribe(); // クリーンアップ
  }, []);


  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
    </Routes>
  );
}

export default App;
