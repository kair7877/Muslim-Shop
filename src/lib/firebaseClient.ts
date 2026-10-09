import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Public Firebase Web App configuration supplied by the store owner.
 * Project: muslim-shop-55c12
 */
const firebaseConfig = {
  apiKey:
    (import.meta as any).env?.VITE_FIREBASE_API_KEY ||
    "AIzaSyCCNwtzhDTBPB8GU_Ls7ogvN5xyUDOez3M",
  authDomain:
    (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN ||
    "muslim-shop-55c12.firebaseapp.com",
  projectId:
    (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID ||
    "muslim-shop-55c12",
  storageBucket:
    (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET ||
    "muslim-shop-55c12.firebasestorage.app",
  messagingSenderId:
    (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "716225520823",
  appId:
    (import.meta as any).env?.VITE_FIREBASE_APP_ID ||
    "1:716225520823:web:7a82d8b680dd7251489932",
};

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let authInstance: Auth | null = null;

export function getFirebaseClientApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return appInstance;
}

export function getFirebaseClientFirestore(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(getFirebaseClientApp());
  }
  return dbInstance;
}

export function getFirebaseClientStorage(): FirebaseStorage {
  if (!storageInstance) {
    storageInstance = getStorage(getFirebaseClientApp());
  }
  return storageInstance;
}

export function getFirebaseClientAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseClientApp());
  }
  return authInstance;
}

export function getFirebaseClientInfo(): {
  projectId: string;
  appId: string;
  configured: boolean;
} {
  return {
    projectId: firebaseConfig.projectId ?? "",
    appId: firebaseConfig.appId ?? "",
    configured: Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId),
  };
}
