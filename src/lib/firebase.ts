import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAYrDqzlJ10ALppVBHG4vD1iiqKDtWGnYg",
  authDomain: "csm-event.firebaseapp.com",
  projectId: "csm-event",
  storageBucket: "csm-event.firebasestorage.app",
  messagingSenderId: "748468084967",
  appId: "1:748468084967:web:84599299143738ad530242",
  measurementId: "G-04PTE8MHFW"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only in the browser
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };