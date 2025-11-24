// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSr_O9RHE9uVp4puXiIWIwCgpJIiFjfqo",
  authDomain: "curso-f0f80.firebaseapp.com",
  projectId: "curso-f0f80",
  storageBucket: "curso-f0f80.firebasestorage.app",
  messagingSenderId: "718174337093",
  appId: "1:718174337093:web:cc3c8780abc8389b59cb2c",
  measurementId: "G-5GR9NH89FV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {db, auth};

