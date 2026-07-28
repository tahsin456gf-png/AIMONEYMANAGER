import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfigData?.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigData?.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfigData?.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData?.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigData?.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfigData?.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const databaseId = metaEnv.VITE_FIREBASE_DATABASE_ID || firebaseConfigData?.firestoreDatabaseId;

export const db = databaseId
  ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, databaseId)
  : initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
