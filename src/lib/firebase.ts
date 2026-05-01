import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBan_FFSO_tYboqhKNTSDp4fuaMy0JzzDY',
  authDomain: 'ai-studio-applet-webapp-e9e3e.firebaseapp.com',
  projectId: 'ai-studio-applet-webapp-e9e3e',
  storageBucket: 'ai-studio-applet-webapp-e9e3e.firebasestorage.app',
  messagingSenderId: '324575580757',
  appId: '1:324575580757:web:250bc743038cb3599f7adc',
};

const FIRESTORE_DB_ID = 'ai-studio-c08e7ed7-fe05-482e-9b1e-511d3dc4d77a';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app, FIRESTORE_DB_ID);
export const storage = getStorage(app);
export const ADMIN_EMAIL = 'avayr2424@gmail.com';

export default app;
