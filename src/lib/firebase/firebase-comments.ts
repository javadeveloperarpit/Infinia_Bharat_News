import {
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";

import {
  getAuth,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";

// ==========================================
// COMMENTS FIREBASE CONFIG
// ==========================================

const firebaseCommentsConfig = {
  apiKey:
    process.env
      .NEXT_PUBLIC_COMMENTS_FIREBASE_API_KEY,

  authDomain:
    process.env
      .NEXT_PUBLIC_COMMENTS_FIREBASE_AUTH_DOMAIN,

  projectId:
    process.env
      .NEXT_PUBLIC_COMMENTS_FIREBASE_PROJECT_ID,

  storageBucket:
    process.env
      .NEXT_PUBLIC_COMMENTS_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    process.env
      .NEXT_PUBLIC_COMMENTS_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    process.env
      .NEXT_PUBLIC_COMMENTS_FIREBASE_APP_ID,
};

// ==========================================
// COMMENTS FIREBASE APP
// ==========================================

const commentsApp =
  getApps().some(
    (app) =>
      app.name === "comments-app"
  )
    ? getApp("comments-app")
    : initializeApp(
        firebaseCommentsConfig,
        "comments-app"
      );

// ==========================================
// COMMENTS AUTH
// ==========================================

export const commentsAuth =
  getAuth(commentsApp);

// ==========================================
// COMMENTS FIRESTORE
// ==========================================

export const commentsDb =
  getFirestore(commentsApp);