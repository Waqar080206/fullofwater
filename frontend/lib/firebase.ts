import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAju1AzC9qslTzoNT2EnnneuQszbWoEMzM",
  authDomain: "laplogic-974be.firebaseapp.com",
  projectId: "laplogic-974be",
  storageBucket: "laplogic-974be.firebasestorage.app",
  messagingSenderId: "555348472571",
  appId: "1:555348472571:web:149b2504226ea3d981765e"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
