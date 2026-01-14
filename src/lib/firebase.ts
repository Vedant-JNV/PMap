import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// These are public/publishable keys - safe to include in frontend code
const firebaseConfig = {
  apiKey: "AIzaSyBf9BpN2fcmV_HnqmSHWQLfl4PMI6PoWFk",
  authDomain: "vedmaps-1fafb.firebaseapp.com",
  projectId: "vedmaps-1fafb",
  storageBucket: "vedmaps-1fafb.firebasestorage.app",
  messagingSenderId: "840837100741",
  appId: "1:840837100741:web:03e95416c2d6d4bc1eacac",
  measurementId: "G-46DQ19C3JY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
