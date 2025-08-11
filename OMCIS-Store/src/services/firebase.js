// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKLN-tsw0r7kpVYrRXunx9vaqUILIUXFo",
  authDomain: "omcis-store.firebaseapp.com",
  projectId: "omcis-store",
  storageBucket: "omcis-store.firebasestorage.app",
  messagingSenderId: "460289730503",
  appId: "1:460289730503:web:6926535a8c36c1024f9be2",
  measurementId: "G-W6WDF1WCVD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
