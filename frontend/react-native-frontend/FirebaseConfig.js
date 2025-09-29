// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjoVc56VjDjaFBXlFHTB0gKZ2Pjl1AVoI",
  authDomain: "sunpath-37cbe.firebaseapp.com",
  projectId: "sunpath-37cbe",
  storageBucket: "sunpath-37cbe.firebasestorage.app",
  messagingSenderId: "918481098380",
  appId: "1:918481098380:web:5406c56bdae18787e0cda9"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);