/* ═══════════════════════════════════════════════
   AALUXE — Firebase Authentication Module
   Server-trusted authentication & role resolution
   ═══════════════════════════════════════════════ */

import { auth, db } from './config.js';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCredential,
  GoogleAuthProvider as GoogleCredentialProvider,
  signOut as firebaseSignOut, 
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Authoritative list of admin emails — NO OTHER EMAIL OR USER CAN EVER BECOME ADMIN
const INITIAL_ADMIN_EMAILS = ['aaluxe0509@gmail.com', 'dailykarma1910@gmail.com'];

export function isAuthorizedAdminEmail(email) {
  if (!email) return false;
  return INITIAL_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Ensures a user document exists in Firestore and returns their role
 */
export async function syncUserProfile(user) {
  if (!user) return null;
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    // Strict Admin check: ONLY aaluxe0509@gmail.com or dailykarma1910@gmail.com can be admin
    const role = isAuthorizedAdminEmail(user.email) ? 'admin' : 'customer';

    if (snap.exists()) {
      const data = snap.data();
      await setDoc(userRef, {
        displayName: user.displayName || data.displayName || 'Guest User',
        email: user.email,
        photoURL: user.photoURL || data.photoURL || '',
        lastLogin: serverTimestamp(),
        role: role
      }, { merge: true });
    } else {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || 'Guest User',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: role
      });
    }

    return role;
  } catch (err) {
    console.error("Error syncing user profile:", err);
    return isAuthorizedAdminEmail(user?.email) ? 'admin' : 'customer';
  }
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const role = await syncUserProfile(result.user);
    return { user: result.user, role };
  } catch (error) {
    console.error("Google Popup Sign In Error:", error);
    throw error;
  }
}

/**
 * Sign in with Google Credential (JWT token from GIS)
 */
export async function loginWithGoogleToken(idToken) {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const role = await syncUserProfile(result.user);
    return { user: result.user, role };
  } catch (error) {
    console.error("Google Token Sign In Error:", error);
    throw error;
  }
}

/**
 * Sign Out
 */
export async function logoutUser() {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem('aaluxe_user');
  } catch (error) {
    console.error("Sign Out Error:", error);
    throw error;
  }
}

/**
 * Listen to auth state changes and fetch verified database role
 */
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Strict role evaluation: ONLY aaluxe0509@gmail.com and dailykarma1910@gmail.com are admin
      const role = isAuthorizedAdminEmail(user.email) ? 'admin' : 'customer';

      const userPayload = {
        uid: user.uid,
        name: user.displayName || user.email || 'User',
        email: user.email,
        photoURL: user.photoURL || '',
        role: role
      };

      localStorage.setItem('aaluxe_user', JSON.stringify(userPayload));
      callback(userPayload);
    } else {
      localStorage.removeItem('aaluxe_user');
      callback(null);
    }
  });
}

/**
 * Synchronous UI role check helper (For UI display convenience ONLY. Never trusted for security authorization.)
 */
export function getCachedUser() {
  try {
    return JSON.parse(localStorage.getItem('aaluxe_user'));
  } catch {
    return null;
  }
}

