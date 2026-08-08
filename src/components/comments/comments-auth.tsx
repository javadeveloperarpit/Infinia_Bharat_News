"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
} from "firebase/auth";

import {
  commentsAuth,
} from "@/lib/firebase/firebase-comments";

import {
  signInToComments,
  signOutFromComments,
} from "@/services/comments/comments-auth.service";

export default function CommentsAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      commentsAuth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleLogin() {
    try {
      setSigningIn(true);

      await signInToComments();
    } catch (error) {
      console.error(
        "COMMENTS GOOGLE LOGIN ERROR:",
        error
      );
    } finally {
      setSigningIn(false);
    }
  }

  async function handleLogout() {
    try {
      await signOutFromComments();
    } catch (error) {
      console.error(
        "COMMENTS LOGOUT ERROR:",
        error
      );
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-zinc-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={handleLogin}
        disabled={signingIn}
        className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {signingIn
          ? "Signing in..."
          : "Sign in with Google"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || "User"}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-bold text-white">
          {(user.displayName || "U")
            .charAt(0)
            .toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {user.displayName || "User"}
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="text-xs text-zinc-500 hover:text-red-600"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}