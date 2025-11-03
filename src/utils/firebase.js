
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkvI_ZgimxGcCEzmQFqX8cJd0E7rGcciM",
  authDomain: "workout-trackerr-6366232-c4e78.firebaseapp.com",
  projectId: "workout-trackerr-6366232-c4e78",
  storageBucket: "workout-trackerr-6366232-c4e78.firebasestorage.app",
  messagingSenderId: "1063046638507",
  appId: "1:1063046638507:web:43de633975cbec94cb40ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
