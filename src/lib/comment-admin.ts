import {
  cert,
  getApps,
  initializeApp,
  App,
} from "firebase-admin/app";

import {
  getFirestore,
  Firestore,
} from "firebase-admin/firestore";

let commentsApp: App | null = null;

export function getCommentsAdminApp(): App {
  if (commentsApp) {
    return commentsApp;
  }

  const existingApp = getApps().find(
    (app) =>
      app.name === "comments-admin"
  );

  if (existingApp) {
    commentsApp = existingApp;
    return existingApp;
  }

  const projectId =
    process.env.COMMENTS_FIREBASE_PROJECT_ID;

  const clientEmail =
    process.env.COMMENTS_FIREBASE_CLIENT_EMAIL;

  const privateKey =
    process.env.COMMENTS_FIREBASE_PRIVATE_KEY;

  if (
    !projectId ||
    !clientEmail ||
    !privateKey
  ) {
    throw new Error(
      "Comments Firebase Admin environment variables are missing."
    );
  }

  commentsApp = initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey:
          privateKey.replace(/\\n/g, "\n"),
      }),
    },
    "comments-admin"
  );

  return commentsApp;
}

export function getCommentsDb(): Firestore {
  return getFirestore(
    getCommentsAdminApp()
  );
}