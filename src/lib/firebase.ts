import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// These are public/publishable keys - safe to include in frontend code
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "vedmaps-1fafb.firebaseapp.com",
  projectId: "vedmaps-1fafb",
  storageBucket: "vedmaps-1fafb.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
