import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Votre configuration Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyDSr0KLIkCO5n9_3UiPE9cpLcikqAn80Iw",
  authDomain: "makeup-ecommerce-9d064.firebaseapp.com",
  projectId: "makeup-ecommerce-9d064",
  storageBucket: "makeup-ecommerce-9d064.firebasestorage.app",
  messagingSenderId: "553649359368",
  appId: "1:553649359368:web:7558d574094b2e2c49dfbd",
  measurementId: "G-29YK6BTM2D"
};

// Initialiser Firebase
export const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
