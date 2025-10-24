import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Validate required Firebase env vars. If they are missing, avoid initializing
// Firebase so the app can fail gracefully with a clear message instead of
// triggering obscure errors inside the vendor bundle (e.g. reading
// properties of undefined).
const requiredVars = [
  firebaseConfig.apiKey,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

let app = null;
let db = null;
let auth = null;
let storage = null;

if (requiredVars.every((v) => typeof v === 'string' && v.length > 0)) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  console.warn(
    'Firebase not initialized: missing required VITE_ environment variables.\n',
    {
      VITE_API_KEY: import.meta.env.VITE_API_KEY,
      VITE_PROJECT_ID: import.meta.env.VITE_PROJECT_ID,
      VITE_APP_ID: import.meta.env.VITE_APP_ID,
    }
  );
}

export { app, db, auth, storage };
console.log('Firebase config (api key):', import.meta.env.VITE_API_KEY);

