"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";

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
  const [loginLoading, setLoginLoading] =
    useState(false);

  const [user, setUser] =
    useState<any>(null);

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
  //
  // IMPORTANT:
  // Firebase Auth session restore hone ke baad
  // hi getShortsConfig() call hoga.
  // ==========================================

  useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      commentsAuth,
      (currentUser) => {

        setUser(currentUser);

        if (!currentUser) {
          setLoading(false);
          return;
        }

        loadShorts();
      }
    );

  return () => {
    unsubscribe();
  };
}, []);

async function handleGoogleLogin() {
  try {
    setLoginLoading(true);
    setError("");

    const provider =
      new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
    });

    await signInWithPopup(
      commentsAuth,
      provider
    );

    setSuccess(
      "Login successful. Shorts loading..."
    );

  } catch (error) {
    console.error(
      "GOOGLE LOGIN ERROR:",
      error
    );

    setError(
      error instanceof Error
        ? error.message
        : "Google login nahi ho paaya."
    );
  } finally {
    setLoginLoading(false);
  }
}

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
        error instanceof Error
          ? error.message
          : "Shorts data load nahi ho paaya."
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

      if (
        !Array.isArray(parsed)
      ) {
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
  // FETCH LATEST YOUTUBE SHORTS
  // ==========================================

  async function handleFetchLatestShorts() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      setStats(null);

      // ======================================
      // 1. GET CURRENT FIREBASE DATA
      // ======================================

      const firebaseData =
        await getShortsConfig();

      const firebaseShorts =
        Array.isArray(
          firebaseData.videos
        )
          ? firebaseData.videos
          : [];

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
      // 2. FETCH YOUTUBE
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

      const fetchedShorts: AdminShort[] =
  [...result.shorts].sort(
    (a, b) => {
      const dateA = a.publishedAt
        ? new Date(a.publishedAt).getTime()
        : 0;

      const dateB = b.publishedAt
        ? new Date(b.publishedAt).getTime()
        : 0;

      return dateB - dateA;
    }
  );

      // ======================================
      // 3. YOUTUBE COUNT
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
      // ======================================

      let existingJsonShorts:
        AdminShort[] = [];

      if (json.trim()) {
        try {
          const parsed =
            JSON.parse(json);

          if (
            !Array.isArray(parsed)
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
      // 7. JSON DUPLICATES
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
      // OLD JSON AFTER
      // ======================================

     const mergedShorts: AdminShort[] = [
  ...trulyNewShorts,
  ...existingJsonShorts,
];

mergedShorts.sort((a, b) => {
  const timeA = Date.parse(
    a.publishedAt || ""
  );

  const timeB = Date.parse(
    b.publishedAt || ""
  );

  const safeA =
    Number.isFinite(timeA)
      ? timeA
      : 0;

  const safeB =
    Number.isFinite(timeB)
      ? timeB
      : 0;

  return safeB - safeA;
});

      // ======================================
      // 10. UPDATE EDITOR ONLY
      // ======================================

      setJson(
        JSON.stringify(
          mergedShorts,
          null,
          2
        )
      );

      // ======================================
      // 11. SUCCESS MESSAGE
      // ======================================

      if (
        trulyNewShorts.length ===
        0
      ) {
        setSuccess(
          `${fetchedCount} Shorts YouTube se fetch hue • ${alreadyExisting.length} already Firebase mein hain • koi naya Short nahi mila.`
        );
      } else {
        setSuccess(
          `${fetchedCount} Shorts YouTube se fetch hue • ${alreadyExisting.length} already Firebase mein hain • ${trulyNewShorts.length} naye Shorts mile. Update dabakar Firebase mein save karein.`
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
                `Item ${
                  index + 1
                } invalid hai.`
              );
            }

            if (
              typeof item.id !==
                "string" ||
              !item.id.trim()
            ) {
              throw new Error(
                `Item ${
                  index + 1
                } ka id missing hai.`
              );
            }

            if (
              typeof item.url !==
                "string" ||
              !item.url.trim()
            ) {
              throw new Error(
                `Item ${
                  index + 1
                } ka url missing hai.`
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

            // undefined NEVER send

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
      // SAVE
      // ======================================

      const result =
        await updateShortsConfig(
          shorts
        );

      // ======================================
      // SUCCESS
      // ======================================

      setSuccess(
        `${result.count} Shorts successfully saved to Firebase.`
      );

      // ======================================
      // STATS
      // ======================================

      setStats({
        fetched:
          stats?.fetched ?? 0,

        alreadyExists:
          stats?.alreadyExists ?? 0,

        newShorts:
          stats?.newShorts ?? 0,

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
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="h-[500px] rounded-xl bg-zinc-100" />
      </div>
    );
  }
  if (!user) {
  return (
    <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl">

        {/* Logo */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <img
            src="/loader.webp"
            alt="Infinia Bharat News"
            className="h-full w-full object-contain p-2"
          />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-zinc-900">
          Shorts Manager
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          YouTube Shorts manage karne ke liye
          pehle Google account se login karein.
        </p>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loginLoading}
          className="
            mt-6
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-xl
            border
            border-zinc-300
            bg-white
            px-5
            py-3.5
            text-sm
            font-bold
            text-zinc-800
            shadow-sm
            transition
            hover:bg-zinc-50
            hover:shadow-md
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >

          {/* Google Icon */}
          {!loginLoading && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.27c0-.78-.07-1.53-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
              />
              <path
                fill="#34A853"
                d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
              />
              <path
                fill="#FBBC05"
                d="M6.54 13.84A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.84V7.63H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.37l3.24-2.53Z"
              />
              <path
                fill="#EA4335"
                d="M12 6.13c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.18 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.38l3.24 2.53C7.31 7.85 9.46 6.13 12 6.13Z"
              />
            </svg>
          )}

          {loginLoading
            ? "Google se login ho raha hai..."
            : "Continue with Google"}
        </button>

        <p className="mt-5 text-xs text-zinc-400">
          Secure Google authentication
        </p>

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

          {/* UPDATE */}

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
          Firebase: shorts/config
        </span>

      </div>

    </div>
  );
}