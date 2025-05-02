// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// Use the same Firebase project as the chords-app
const firebaseConfig = {
  apiKey: "AIzaSyAwZJ_vJBUR8ROm15XzC3gsU0ZrH5QEt1s",
  authDomain: "chords-app-ecd47.firebaseapp.com",
  projectId: "chords-app-ecd47",
  storageBucket: "chords-app-ecd47.firebasestorage.app",
  messagingSenderId: "481447097360",
  appId: "1:481447097360:web:6bc5b649641f11a8e5c695"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { app, auth };
