import {
  cert,
  getApps,
  initializeApp,
  App,
} from "firebase-admin/app";

import {
  getAuth,
  Auth,
} from "firebase-admin/auth";

import {
  getFirestore,
} from "firebase-admin/firestore";

// ==========================================
// COMMENTS FIREBASE ADMIN APP
// ==========================================

const commentsAdminAppName =
  "comments-admin-app";

// ==========================================
// COMMENTS SERVICE ACCOUNT
// ==========================================

const commentsServiceAccount = {

  projectId:
    process.env
      .COMMENTS_FIREBASE_PROJECT_ID!,

  clientEmail:
    process.env
      .COMMENTS_FIREBASE_CLIENT_EMAIL!,

  privateKey:
    process.env
      .COMMENTS_FIREBASE_PRIVATE_KEY!
      .replace(/\\n/g, "\n"),
};

// ==========================================
// INITIALIZE APP
// ==========================================

const existingApp =
  getApps().find(
    (app) =>
      app.name ===
      commentsAdminAppName
  );

const commentsAdminApp: App =
  existingApp ||
  initializeApp(
    {
      credential:
        cert(
          commentsServiceAccount
        ),
    },
    commentsAdminAppName
  );

// ==========================================
// COMMENTS ADMIN AUTH
// ==========================================

export const commentsAdminAuth: Auth =
  getAuth(
    commentsAdminApp
  );

// ==========================================
// COMMENTS ADMIN FIRESTORE
// ==========================================

export const commentsAdminDb =
  getFirestore(
    commentsAdminApp
  );