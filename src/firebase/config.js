
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDAKjpdn4NS4CcTPzhLj6Ej8wZtBtrWAnQ",
  authDomain: "shopmanagemnt-c0bad.firebaseapp.com",
  projectId: "shopmanagemnt-c0bad",
  storageBucket: "shopmanagemnt-c0bad.firebasestorage.app",
  messagingSenderId: "648756820369",
  appId: "1:648756820369:web:442dbeae380dc1f562c230",
  measurementId: "G-R137TDWJW6"
};


const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)



