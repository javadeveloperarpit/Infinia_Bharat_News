"use client";

import { useState } from "react";

interface Props {
open: boolean;
setOpen: (value: boolean) => void;
reload: () => void;
}

export default function AddUserModal({
open,
setOpen,
reload,
}: Props) {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [photo, setPhoto] = useState("");
const [bio, setBio] = useState("");

const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [success, setSuccess] = useState(false);
const [imageError, setImageError] = useState(false);

// ==========================================
// CREATE USER
// ==========================================

async function createUser() {
if (loading) return;


setMessage("");
setSuccess(false);

// ==========================================
// CLIENT SIDE VALIDATION
// ==========================================

if (!name.trim()) {
  setMessage("Please enter author name.");
  return;
}

if (!email.trim()) {
  setMessage("Please enter email address.");
  return;
}

if (!password) {
  setMessage("Please enter password.");
  return;
}

if (password.length < 6) {
  setMessage(
    "Password must be at least 6 characters."
  );
  return;
}

if (!photo.trim()) {
  setMessage(
    "Please enter profile photo URL."
  );
  return;
}

if (!bio.trim()) {
  setMessage(
    "Please enter author biography."
  );
  return;
}

try {
  setLoading(true);

  // ==========================================
  // GET CURRENT FIREBASE AUTH USER
  // ==========================================

  const { getAuth } =
    await import("firebase/auth");

  const firebaseAuth =
    getAuth();

  const currentUser =
    firebaseAuth.currentUser;

  if (!currentUser) {
    setMessage(
      "You are not logged in. Please login again."
    );
    return;
  }

  console.log(
    "CREATE EDITOR - ADMIN UID:",
    currentUser.uid
  );

  // ==========================================
  // GET FRESH ID TOKEN
  // ==========================================

  const token =
    await currentUser.getIdToken(true);

  if (!token) {
    setMessage(
      "Authentication token not available."
    );
    return;
  }

  // ==========================================
  // SEND DATA TO API
  // ==========================================

  const payload = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    photo: photo.trim(),
    bio: bio.trim(),
  };

  console.log(
    "CREATE EDITOR PAYLOAD:",
    {
      ...payload,
      password: "***",
    }
  );

  const response =
    await fetch(
      "/api/admin/users",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(payload),
      }
    );

  // ==========================================
  // READ RESPONSE
  // ==========================================

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  let data: any = null;

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    data =
      await response.json();
  } else {
    const text =
      await response.text();

    console.error(
      "CREATE USER NON JSON RESPONSE:",
      text
    );

    throw new Error(
      "Server returned an invalid response."
    );
  }

  console.log(
    "CREATE USER API RESPONSE:",
    response.status,
    data
  );

  // ==========================================
  // API ERROR
  // ==========================================

  if (!response.ok) {
    setMessage(
      data?.message ||
        "Failed to create editor."
    );

    return;
  }

  if (!data?.success) {
    setMessage(
      data?.message ||
        "Editor creation failed."
    );

    return;
  }

  // ==========================================
  // SUCCESS
  // ==========================================

  console.log(
    "EDITOR CREATED SUCCESSFULLY:",
    data
  );

  setSuccess(true);

  setMessage(
    "Editor created successfully."
  );

  // ==========================================
  // CLEAR FORM
  // ==========================================

  setName("");
  setEmail("");
  setPassword("");
  setPhoto("");
  setBio("");
  setImageError(false);

  // ==========================================
  // RELOAD USERS
  // ==========================================

  await reload();

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  setTimeout(() => {
    setOpen(false);
    setMessage("");
    setSuccess(false);
  }, 1200);

} catch (error: any) {
  console.error(
    "CREATE USER ERROR:",
    error
  );

  setMessage(
    error?.message ||
      "Failed to create editor."
  );

  setSuccess(false);

} finally {
  setLoading(false);
}


}

// ==========================================
// PHOTO CHANGE
// ==========================================

function handlePhotoChange(
value: string
) {
setPhoto(value);
setImageError(false);
}

// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {
if (loading) return;


setOpen(false);
setMessage("");
setSuccess(false);
setImageError(false);


}

if (!open) {
return null;
}

return (
<div
className="
fixed
inset-0
z-[100]
flex
items-center
justify-center
bg-black/60
p-4
backdrop-blur-sm
"
onMouseDown={(event) => {
if (
event.target ===
event.currentTarget
) {
closeModal();
}
}}
>


  <div
    className="
      w-full
      max-w-xl
      max-h-[92vh]
      overflow-y-auto
      rounded-2xl
      bg-white
      shadow-2xl
    "
    onMouseDown={(event) =>
      event.stopPropagation()
    }
  >

    {/* ======================================
        HEADER
    ====================================== */}

    <div
      className="
        flex
        items-center
        justify-between
        border-b
        border-zinc-200
        px-6
        py-5
      "
    >

      <div>

        <h2
          className="
            text-xl
            font-black
            text-zinc-950
          "
        >
          Add Editor
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-zinc-500
          "
        >
          Create a new author profile
        </p>

      </div>

      <button
        type="button"
        onClick={closeModal}
        disabled={loading}
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          text-xl
          text-zinc-500
          transition
          hover:bg-zinc-100
          hover:text-zinc-950
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        ×
      </button>

    </div>


    {/* ======================================
        FORM
    ====================================== */}

    <div className="space-y-5 px-6 py-6">

      {/* NAME */}

      <div>

        <label
          className="
            mb-1.5
            block
            text-sm
            font-bold
            text-zinc-800
          "
        >
          Full Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          placeholder="e.g. Arpit Mishra"
          disabled={loading}
          className="
            w-full
            rounded-xl
            border
            border-zinc-300
            bg-white
            px-4
            py-3
            text-sm
            text-zinc-900
            outline-none
            transition
            placeholder:text-zinc-400
            focus:border-red-500
            focus:ring-4
            focus:ring-red-500/10
            disabled:bg-zinc-100
          "
        />

      </div>


      {/* EMAIL */}

      <div>

        <label
          className="
            mb-1.5
            block
            text-sm
            font-bold
            text-zinc-800
          "
        >
          Email Address
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="editor@example.com"
          disabled={loading}
          className="
            w-full
            rounded-xl
            border
            border-zinc-300
            bg-white
            px-4
            py-3
            text-sm
            text-zinc-900
            outline-none
            transition
            placeholder:text-zinc-400
            focus:border-red-500
            focus:ring-4
            focus:ring-red-500/10
            disabled:bg-zinc-100
          "
        />

      </div>


      {/* PASSWORD */}

      <div>

        <label
          className="
            mb-1.5
            block
            text-sm
            font-bold
            text-zinc-800
          "
        >
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          placeholder="Minimum 6 characters"
          disabled={loading}
          className="
            w-full
            rounded-xl
            border
            border-zinc-300
            bg-white
            px-4
            py-3
            text-sm
            text-zinc-900
            outline-none
            transition
            placeholder:text-zinc-400
            focus:border-red-500
            focus:ring-4
            focus:ring-red-500/10
            disabled:bg-zinc-100
          "
        />

      </div>


      {/* ======================================
          PHOTO
      ====================================== */}

      <div>

        <label
          className="
            mb-1.5
            block
            text-sm
            font-bold
            text-zinc-800
          "
        >
          Profile Photo URL
        </label>

        <input
          type="url"
          value={photo}
          onChange={(event) =>
            handlePhotoChange(
              event.target.value
            )
          }
          placeholder="https://example.com/profile.jpg"
          disabled={loading}
          className="
            w-full
            rounded-xl
            border
            border-zinc-300
            bg-white
            px-4
            py-3
            text-sm
            text-zinc-900
            outline-none
            transition
            placeholder:text-zinc-400
            focus:border-red-500
            focus:ring-4
            focus:ring-red-500/10
            disabled:bg-zinc-100
          "
        />

        <p
          className="
            mt-1.5
            text-xs
            text-zinc-500
          "
        >
          Use a publicly accessible image URL.
        </p>


        {/* ==================================
            LIVE IMAGE PREVIEW
        ================================== */}

        {photo.trim() && (

          <div
            className="
              mt-4
              rounded-2xl
              border
              border-zinc-200
              bg-zinc-50
              p-4
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
              "
            >

              {/* IMAGE */}

              {!imageError ? (

                <img
                  src={photo.trim()}
                  alt={
                    name.trim() ||
                    "Author preview"
                  }
                  onError={() =>
                    setImageError(true)
                  }
                  className="
                    h-20
                    w-20
                    shrink-0
                    rounded-full
                    object-cover
                    border-4
                    border-white
                    shadow-md
                    ring-1
                    ring-zinc-200
                  "
                />

              ) : (

                <div
                  className="
                    flex
                    h-20
                    w-20
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border-4
                    border-white
                    bg-red-100
                    text-2xl
                    font-black
                    text-red-600
                    shadow-md
                  "
                >
                  {name
                    .trim()
                    .charAt(0)
                    .toUpperCase() || "A"}
                </div>

              )}


              {/* PREVIEW INFO */}

              <div className="min-w-0">

                <p
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-zinc-400
                  "
                >
                  Profile Preview
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    text-base
                    font-black
                    text-zinc-950
                  "
                >
                  {name.trim() ||
                    "Author Name"}
                </p>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-zinc-500
                  "
                >
                  {imageError
                    ? "Unable to load this image URL"
                    : "Image loaded successfully"}
                </p>

              </div>

            </div>

          </div>

        )}

      </div>


      {/* BIO */}

      <div>

        <label
          className="
            mb-1.5
            block
            text-sm
            font-bold
            text-zinc-800
          "
        >
          About the Author
        </label>

        <textarea
          value={bio}
          onChange={(event) =>
            setBio(
              event.target.value
            )
          }
          placeholder="Write a short professional biography of the author..."
          rows={6}
          disabled={loading}
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-zinc-300
            bg-white
            px-4
            py-3
            text-sm
            leading-6
            text-zinc-900
            outline-none
            transition
            placeholder:text-zinc-400
            focus:border-red-500
            focus:ring-4
            focus:ring-red-500/10
            disabled:bg-zinc-100
          "
        />

        <p
          className="
            mt-1.5
            text-xs
            text-zinc-500
          "
        >
          This bio will appear on the public
          author profile.
        </p>

      </div>


      {/* ======================================
          MESSAGE
      ====================================== */}

      {message && (

        <div
          className={`
            rounded-xl
            border
            px-4
            py-3
            text-center
            text-sm
            font-semibold
            ${
              success
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }
          `}
        >
          {message}
        </div>

      )}


      {/* ======================================
          BUTTON
      ====================================== */}

      <button
        type="button"
        onClick={createUser}
        disabled={loading}
        className="
          flex
          w-full
          items-center
          justify-center
          rounded-xl
          bg-red-600
          px-5
          py-3.5
          text-sm
          font-bold
          text-white
          shadow-sm
          transition
          hover:bg-red-700
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading
          ? "Creating Editor..."
          : "Create Editor"}
      </button>

    </div>

  </div>

</div>


);
}
