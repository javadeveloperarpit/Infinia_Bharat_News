import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

const messaging =
  typeof window !== "undefined"
    ? (() => {

        try {

          if(
            "serviceWorker" in navigator &&
            "PushManager" in window
          ){

            return getMessaging(app);

          }

          return null;


        } catch {

          return null;

        }

      })()
    : null;

const analytics =
  typeof window !== "undefined"
    ? isSupported().then((supported) =>
        supported ? getAnalytics(app) : null
      )
    : null;

export { app, auth, db, messaging, analytics };