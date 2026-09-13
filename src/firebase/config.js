/* ═══════════════════════════════════════════════
   AALUXE — Firebase Centralized Configuration
   Exporting initialized Firebase App and Services
   ═══════════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDmHDMcsngn63fqO9ya-w60WoWl5m8Rl7k",
  authDomain: "aaluxe-1627d.firebaseapp.com",
  projectId: "aaluxe-1627d",
  storageBucket: "aaluxe-1627d.firebasestorage.app",
  messagingSenderId: "1005965760649",
  appId: "1:1005965760649:web:2c9817725f393988e30e58",
  measurementId: "G-MVBZQXC58M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
