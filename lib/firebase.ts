import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB8XJv4aIdcXe43FtJM0FD49NhSOiexack",
  authDomain: "ad-earn782.firebaseapp.com",
  projectId: "ad-earn782",
  storageBucket: "ad-earn782.firebasestorage.app",
  messagingSenderId: "746266055702",
  appId: "1:746266055702:web:782689" // Standard placeholder for web
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
