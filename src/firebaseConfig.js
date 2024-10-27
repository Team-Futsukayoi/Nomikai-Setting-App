import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  // apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: "AIzaSyC0-fbFaBoyGZlGaBL3m9nVtXLIt8KY0Tc",
  authDomain: "nomikai-setting-app.firebaseapp.com",
  databaseURL: "https://nomikai-setting-app-default-rtdb.firebaseio.com",
  projectId: "nomikai-setting-app",
  storageBucket: "nomikai-setting-app.appspot.com",
  messagingSenderId: "168958283475",
  appId: "1:168958283475:web:5738d39f97e573d4bece26"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
