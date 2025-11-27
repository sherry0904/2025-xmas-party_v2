import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Replace with your actual Firebase Config keys
// You can get these from Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyAvaqA8FkVmZfVPwVIgP4QBlbC3Vpf4f1o",
  authDomain: "christmas-party-2025-ada00.firebaseapp.com",
  databaseURL: "https://christmas-party-2025-ada00-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "christmas-party-2025-ada00",
  storageBucket: "christmas-party-2025-ada00.firebasestorage.app",
  messagingSenderId: "299681905860",
  appId: "1:299681905860:web:63fe510736e3cf43abdd91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
