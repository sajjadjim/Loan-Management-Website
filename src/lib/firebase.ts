import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';

export const isFirebaseConfigured = true;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDLdkE0z4ViAnbtA_Y_RSYoVCQ9yWSZwu0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "loan-management-website-9d1bf.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "loan-management-website-9d1bf",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "loan-management-website-9d1bf.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "278835499176",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:278835499176:web:4474deedf227dc126eb29d"
};

// Initialize Firebase app singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in using Firebase Google Auth Popup
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Sign in using Email & Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return res.user;
  } catch (error: any) {
    console.error('Firebase Email Sign-In Error:', error);
    throw error;
  }
}

/**
 * Create new user with Email & Password
 */
export async function signUpWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    return res.user;
  } catch (error: any) {
    console.error('Firebase Email Sign-Up Error:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Firebase Logout Error:', error);
    throw error;
  }
}

export { onAuthStateChanged };
export type { FirebaseUser };
