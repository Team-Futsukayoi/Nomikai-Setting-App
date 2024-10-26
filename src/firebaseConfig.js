import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Firestoreのインポート

// Firebaseの設定をプロジェクトに適用
const firebaseConfig = {
  apiKey: "AIzaSyC0-fbFaBoyGZlGaBL3m9nVtXLIt8KY0Tc",
  authDomain: "nomikai-setting-app.firebaseapp.com",
  projectId: "nomikai-setting-app",
  storageBucket: "nomikai-setting-app.appspot.com",
  messagingSenderId: "168958283475",
  appId: "1:168958283475:web:8fff28c2f72dafacbece26"
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// 認証機能のエクスポート
export const auth = getAuth(app);

// Firestoreのエクスポート
export const db = getFirestore(app);

