import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase/firebase";


// ======================================================
// VIDEO DATA
// ======================================================

export interface VideoData {

  title: string;

  youtubeUrl: string;

  categoryId: string;

  description: string;

  status: "draft" | "published";

  featured?: boolean;

}


// ======================================================
// CREATE VIDEO
// Firebase direct nahi.
// API route use hoga.
//
// Flow:
//
// Admin
//   ↓
// /api/admin/videos
//   ↓
// Firebase
//   ↓
// GitHub videos.json
// ======================================================

export async function createVideo(
  data: VideoData
) {

  const user =
    auth.currentUser;

  if (!user) {

    throw new Error(
      "Not logged in"
    );

  }

  const token =
    await user.getIdToken();


  const response =
    await fetch(
      "/api/admin/videos",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(data),
      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    throw new Error(
      result?.message ||
      "Failed to create video"
    );

  }


  return result;

}


// ======================================================
// GET VIDEOS
//
// Admin listing ke liye Firebase read
// ======================================================

export async function getVideos() {

  const snapshot =
    await getDocs(
      collection(
        db,
        "videos"
      )
    );


  return snapshot.docs.map(
    (item) => ({

      id:
        item.id,

      ...item.data(),

    })
  );

}


// ======================================================
// GET SINGLE VIDEO
// ======================================================

export async function getVideoById(
  id: string
) {

  const response =
    await fetch(
      `/api/admin/videos/${id}`,
      {
        cache: "no-store",
      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    throw new Error(
      result?.message ||
      "Failed to fetch video"
    );

  }


  return result;

}


// ======================================================
// UPDATE VIDEO
//
// IMPORTANT:
// Firebase direct update nahi.
// API route use hoga.
// API route GitHub sync karega.
// ======================================================

export async function updateVideo(
  id: string,
  data: Partial<VideoData>
) {

  const user =
    auth.currentUser;

  if (!user) {

    throw new Error(
      "Not logged in"
    );

  }

  const token =
    await user.getIdToken();


  const response =
    await fetch(
      `/api/admin/videos/${id}`,
      {
        method: "PUT",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,

        },

        body:
          JSON.stringify(data),

      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    throw new Error(
      result?.message ||
      "Failed to update video"
    );

  }


  return result;

}


// ======================================================
// DELETE VIDEO
//
// IMPORTANT:
// Firebase direct delete nahi.
// API route use hoga.
// API route GitHub sync karega.
// ======================================================

export async function deleteVideo(
  id: string
) {

  const user =
    auth.currentUser;

  if (!user) {

    throw new Error(
      "Not logged in"
    );

  }

  const token =
    await user.getIdToken();


  const response =
    await fetch(
      `/api/admin/videos/${id}`,
      {
        method: "DELETE",

        headers: {

          Authorization:
            `Bearer ${token}`,

        },

      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    throw new Error(
      result?.message ||
      "Failed to delete video"
    );

  }


  return result;

}