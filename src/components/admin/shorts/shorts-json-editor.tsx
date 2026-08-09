"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  commentsAuth,
} from "@/lib/firebase/firebase-comments";

import {
  getShortsConfig,
  updateShortsConfig,
  AdminShort,
} from "@/services/admin/shorts.admin.service";

// ==========================================
// COMPONENT
// ==========================================

export default function ShortsJsonEditor() {
  const [json, setJson] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================
  // FETCH STATS
  // ==========================================

  const [stats, setStats] =
    useState<{
      fetched: number;
      alreadyExists: number;
      newShorts: number;
      existingTotal: number;
    } | null>(null);

  // ==========================================
  // LOAD FIRESTORE DATA
  // ==========================================

  useEffect(() => {
    loadShorts();
  }, []);

  async function loadShorts() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getShortsConfig();

      const videos =
        Array.isArray(data.videos)
          ? data.videos
          : [];

      setJson(
        JSON.stringify(
          videos,
          null,
          2
        )
      );

      // Initial Firebase total
      setStats({
        fetched: 0,
        alreadyExists: 0,
        newShorts: 0,
        existingTotal:
          videos.length,
      });
    } catch (error) {
      console.error(
        "LOAD SHORTS ERROR:",
        error
      );

      setError(
        "Shorts data load nahi ho paaya."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // FORMAT JSON
  // ==========================================

  function formatJson() {
    try {
      const parsed =
        JSON.parse(json);

      if (!Array.isArray(parsed)) {
        throw new Error();
      }

      setJson(
        JSON.stringify(
          parsed,
          null,
          2
        )
      );

      setError("");

      setSuccess(
        "JSON formatted successfully."
      );
    } catch {
      setSuccess("");

      setError(
        "Invalid JSON. Pehle JSON ko sahi karein."
      );
    }
  }

  // ==========================================
  // GET FRESH FIREBASE DATA
  // ==========================================

  async function getFreshFirebaseShorts(): Promise<AdminShort[]> {
  const user =
    commentsAuth.currentUser;

  if (!user) {
    throw new Error(
      "Admin login required."
    );
  }

  const token =
    await user.getIdToken(false);

  const response =
    await fetch(
      "/api/admin/shorts",
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        cache: "no-store",
      }
    );

  const result =
    await response.json();

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
        "Firebase Shorts load nahi ho paaye."
    );
  }

  return Array.isArray(
    result.videos
  )
    ? result.videos
    : [];
}

  // ==========================================
  // FETCH LATEST YOUTUBE SHORTS
  // ==========================================

  async function handleFetchLatestShorts() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      setStats(null);

      // ======================================
      // 1. FETCH FRESH FIREBASE DATA
      // ======================================

      const firebaseShorts =
        await getFreshFirebaseShorts();

      const firebaseIds =
        new Set(
          firebaseShorts
            .map(
              (item) =>
                item.id
            )
            .filter(Boolean)
        );

      // ======================================
      // 2. FETCH YOUTUBE SHORTS
      // ======================================

      const response =
        await fetch(
          "/api/admin/shorts/fetch",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Latest Shorts fetch nahi ho paaye."
        );
      }

      if (
        !Array.isArray(
          result.shorts
        )
      ) {
        throw new Error(
          "Invalid Shorts response."
        );
      }

      const fetchedShorts:
        AdminShort[] =
        result.shorts;

      // ======================================
      // 3. YOUTUBE FETCH COUNT
      // ======================================

      const fetchedCount =
        fetchedShorts.length;

      // ======================================
      // 4. ALREADY IN FIREBASE
      // ======================================

      const alreadyExisting =
        fetchedShorts.filter(
          (short) =>
            firebaseIds.has(
              short.id
            )
        );

      // ======================================
      // 5. NEW FOR FIREBASE
      // ======================================

      const newShorts =
        fetchedShorts.filter(
          (short) =>
            !firebaseIds.has(
              short.id
            )
        );

      // ======================================
      // 6. CURRENT JSON
      //
      // User ke manually existing JSON
      // ko preserve karna hai.
      // ======================================

      let existingJsonShorts:
        AdminShort[] = [];

      if (json.trim()) {
        try {
          const parsed =
            JSON.parse(json);

          if (
            !Array.isArray(
              parsed
            )
          ) {
            throw new Error();
          }

          existingJsonShorts =
            parsed;
        } catch {
          throw new Error(
            "Current JSON invalid hai. Pehle JSON ko repair karein."
          );
        }
      }

      // ======================================
      // 7. PREVENT DUPLICATES
      //
      // Agar new Shorts Firebase me nahi hain
      // lekin JSON me already manually present hain,
      // to unhe dobara add nahi karna.
      // ======================================

      const jsonIds =
        new Set(
          existingJsonShorts
            .map(
              (item) =>
                item.id
            )
            .filter(Boolean)
        );

      const trulyNewShorts =
        newShorts.filter(
          (short) =>
            !jsonIds.has(
              short.id
            )
        );

      // ======================================
      // 8. STATS
      // ======================================

      setStats({
        fetched:
          fetchedCount,

        alreadyExists:
          alreadyExisting.length,

        newShorts:
          trulyNewShorts.length,

        existingTotal:
          firebaseShorts.length,
      });

      // ======================================
      // 9. MERGE
      //
      // NEW YOUTUBE SHORTS FIRST
      // EXISTING JSON AFTER
      //
      // Existing JSON untouched.
      // ======================================

      const mergedShorts:
        AdminShort[] = [
          ...trulyNewShorts,
          ...existingJsonShorts,
        ];

      // ======================================
      // 10. UPDATE EDITOR ONLY
      //
      // FIREBASE SAVE NAHI HOGA
      // ======================================

      setJson(
        JSON.stringify(
          mergedShorts,
          null,
          2
        )
      );

      // ======================================
      // 11. MESSAGE
      // ======================================

      if (
        trulyNewShorts.length ===
        0
      ) {
        setSuccess(
          `${fetchedCount} Shorts YouTube se fetch hue • ${alreadyExisting.length} already Firebase mein hain • koi naya Short add nahi hua.`
        );
      } else {
        setSuccess(
          `${fetchedCount} Shorts YouTube se fetch hue • ${alreadyExisting.length} already Firebase mein hain • ${trulyNewShorts.length} naye Shorts JSON mein add hue. Firebase save karne ke liye Update dabayein.`
        );
      }

    } catch (error) {
      console.error(
        "FETCH LATEST SHORTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Latest Shorts fetch nahi ho paaye."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // SAVE JSON
  // ==========================================

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const parsed =
        JSON.parse(json);

      if (
        !Array.isArray(parsed)
      ) {
        throw new Error(
          "JSON array hona chahiye."
        );
      }

      // ======================================
      // VALIDATE SHORTS
      // ======================================

      const shorts:
        AdminShort[] =
        parsed.map(
          (
            item: any,
            index: number
          ) => {

            if (
              !item ||
              typeof item !==
                "object"
            ) {
              throw new Error(
                `Item ${index + 1} invalid hai.`
              );
            }

            if (
              typeof item.id !==
                "string" ||
              !item.id.trim()
            ) {
              throw new Error(
                `Item ${index + 1} ka id missing hai.`
              );
            }

            if (
              typeof item.url !==
                "string" ||
              !item.url.trim()
            ) {
              throw new Error(
                `Item ${index + 1} ka url missing hai.`
              );
            }

            const cleaned:
              AdminShort = {
                id:
                  item.id.trim(),

                url:
                  item.url.trim(),

                title:
                  typeof item.title ===
                  "string"
                    ? item.title.trim()
                    : "",

                thumbnail:
                  typeof item.thumbnail ===
                  "string"
                    ? item.thumbnail.trim()
                    : "",
              };

            // IMPORTANT:
            // undefined Firestore mein nahi bhejna

            if (
              typeof item.publishedAt ===
                "string" &&
              item.publishedAt.trim()
            ) {
              cleaned.publishedAt =
                item.publishedAt.trim();
            }

            return cleaned;
          }
        );

      // ======================================
      // SAVE TO FIRESTORE
      // ======================================

      await updateShortsConfig(
        shorts
      );

      // ======================================
      // SUCCESS
      // ======================================

      setSuccess(
        `${shorts.length} Shorts successfully saved to Firestore.`
      );

      // ======================================
      // UPDATE STATS
      // ======================================

      setStats({
        fetched:
          stats?.fetched ??
          0,

        alreadyExists:
          stats?.alreadyExists ??
          0,

        newShorts:
          stats?.newShorts ??
          0,

        existingTotal:
          shorts.length,
      });

    } catch (error) {
      console.error(
        "SAVE SHORTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Shorts save nahi ho paaye."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-zinc-200" />

          <div className="h-[500px] rounded-xl bg-zinc-100" />
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-5">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h2 className="text-xl font-bold text-zinc-900">
            Shorts JSON
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            YouTube Shorts data manage karein.
          </p>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap gap-2">

          {/* FETCH */}

          <button
            type="button"
            disabled={saving}
            onClick={
              handleFetchLatestShorts
            }
            className="
              rounded-xl
              border
              border-zinc-300
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-zinc-800
              transition
              hover:bg-zinc-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {saving
              ? "Fetching..."
              : "Fetch Latest Shorts"}
          </button>

          {/* FORMAT */}

          <button
            type="button"
            onClick={formatJson}
            disabled={saving}
            className="
              rounded-xl
              border
              border-zinc-300
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-zinc-800
              transition
              hover:bg-zinc-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Format JSON
          </button>

          {/* SAVE */}

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="
              rounded-xl
              bg-red-600
              px-5
              py-2.5
              text-sm
              font-bold
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {saving
              ? "Saving..."
              : "Update"}
          </button>

        </div>
      </div>

      {/* ======================================
          STATS
      ====================================== */}

      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

          {/* FETCHED */}

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              YouTube Fetched
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-900">
              {stats.fetched}
            </p>

            <p className="mt-1 text-xs text-blue-700">
              Latest Shorts
            </p>
          </div>

          {/* ALREADY EXISTS */}

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
              Already in Firebase
            </p>

            <p className="mt-1 text-2xl font-bold text-zinc-900">
              {stats.alreadyExists}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Already saved
            </p>
          </div>

          {/* NEW */}

          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
              New Shorts
            </p>

            <p className="mt-1 text-2xl font-bold text-green-900">
              {stats.newShorts}
            </p>

            <p className="mt-1 text-xs text-green-700">
              Ready to add
            </p>
          </div>

          {/* FIREBASE TOTAL */}

          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
              Firebase Total
            </p>

            <p className="mt-1 text-2xl font-bold text-purple-900">
              {stats.existingTotal}
            </p>

            <p className="mt-1 text-xs text-purple-700">
              Saved Shorts
            </p>
          </div>

        </div>
      )}

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================
          SUCCESS
      ====================================== */}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ======================================
          EDITOR
      ====================================== */}

      <div className="rounded-2xl border border-zinc-200 bg-[#111] p-3 shadow-sm sm:p-4">

        <textarea
          value={json}
          onChange={(event) => {
            setJson(
              event.target.value
            );

            setError("");
            setSuccess("");
          }}
          spellCheck={false}
          className="
            min-h-[600px]
            w-full
            resize-y
            rounded-xl
            border
            border-white/10
            bg-[#090909]
            p-4
            font-mono
            text-[13px]
            leading-6
            text-green-400
            outline-none
            placeholder:text-zinc-600
            focus:border-[#ECCA6D]/50
          "
          placeholder={`[
  {
    "id": "short-id",
    "url": "https://www.youtube.com/shorts/short-id",
    "title": "Short title",
    "thumbnail": "https://i.ytimg.com/vi/short-id/hqdefault.jpg",
    "publishedAt": "2026-08-09T10:00:00.000Z"
  }
]`}
        />

      </div>

      {/* ======================================
          FOOTER
      ====================================== */}

      <div className="flex flex-col gap-2 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">

        <span>
          JSON array required
        </span>

        <span>
          Firestore: shorts/config
        </span>

      </div>

    </div>
  );
}