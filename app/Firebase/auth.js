import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAakNvLSPuE05_ZLdIFQotawBhuG1pRyN4",
  authDomain: "fir-practice-f845a.firebaseapp.com",
  databaseURL: "https://fir-practice-f845a-default-rtdb.firebaseio.com",
  projectId: "fir-practice-f845a",
  storageBucket: "fir-practice-f845a.firebasestorage.app",
  messagingSenderId: "16029513777",
  appId: "1:16029513777:web:750576216ced5859db7d10",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth setup
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
