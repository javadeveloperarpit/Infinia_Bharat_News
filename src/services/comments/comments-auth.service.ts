"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  commentsAuth,
} from "@/lib/firebase/firebase-comments";

// ==========================================
// GOOGLE AUTH PROVIDER
// ==========================================

const provider =
  new GoogleAuthProvider();

// Optional:
// Google account selection ko force
// karne ke liye ye useful hai.
provider.setCustomParameters({
  prompt: "select_account",
});
let commentLoginPromise:
  Promise<any> | null = null;
// ==========================================
// SIGN IN
// ==========================================

export async function signInToComments() {
  if (commentLoginPromise) {
    return commentLoginPromise;
  }

  commentLoginPromise =
    (async () => {
      try {
        const result =
          await signInWithPopup(
            commentsAuth,
            provider
          );

        const user =
          result.user;

        return {
          uid: user.uid,

          name:
            user.displayName ||
            "User",

          email:
            user.email ||
            "",

          photo:
            user.photoURL ||
            "",
        };
      } catch (error) {
        console.error(
          "COMMENTS GOOGLE LOGIN ERROR:",
          error
        );

        throw error;
      } finally {
        commentLoginPromise = null;
      }
    })();

  return commentLoginPromise;
}

// ==========================================
// SIGN OUT
// ==========================================

export async function signOutFromComments() {
  try {
    await signOut(
      commentsAuth
    );
  } catch (error) {
    console.error(
      "COMMENTS SIGN OUT ERROR:",
      error
    );

    throw error;
  }
}