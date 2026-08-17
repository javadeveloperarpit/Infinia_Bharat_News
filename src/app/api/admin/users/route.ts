export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  FieldValue,
} from "firebase-admin/firestore";

// ==========================================
// CREATE SLUG
// ==========================================

function createAuthorSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ==========================================
// VERIFY CURRENT USER
// ==========================================

async function verifyUser(request: NextRequest) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message:
            "Authorization header missing",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const token =
    authorization.startsWith("Bearer ")
      ? authorization.substring(7)
      : authorization;

  if (!token) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message:
            "Authentication token missing",
        },
        {
          status: 401,
        }
      ),
    };
  }

  try {
    const decoded =
      await adminAuth.verifyIdToken(token);

    const userRef =
      adminDb
        .collection("users")
        .doc(decoded.uid);

    const userSnapshot =
      await userRef.get();

    if (!userSnapshot.exists) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message:
              "Admin user not found",
          },
          {
            status: 404,
          }
        ),
      };
    }

    const user =
      userSnapshot.data();

    return {
      decoded,
      user,
    };

  } catch (error) {
    console.error(
      "VERIFY USER ERROR:",
      error
    );

    return {
      error: NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired authentication token",
        },
        {
          status: 401,
        }
      ),
    };
  }
}

// ==========================================
// VERIFY ADMIN
// ==========================================

// ==========================================
// VERIFY ADMIN
// ==========================================

async function verifyAdmin(
  request: NextRequest
) {
  const auth = await verifyUser(request);

  if (auth.error) {
    return auth;
  }

  const role = String(
    auth.user?.role || ""
  )
    .trim()
    .toLowerCase();

  console.log("ADMIN CHECK:", {
    uid: auth.decoded?.uid,
    email: auth.decoded?.email,
    role,
  });

  if (
    role !== "admin" &&
    role !== "superadmin"
  ) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message:
            "Only admin can perform this action",
          role,
        },
        {
          status: 403,
        }
      ),
    };
  }

  return auth;
}
// ==========================================
// GET ALL USERS
// ADMIN ONLY
// ==========================================

// ==========================================
// GET ALL USERS
// AUTHENTICATED USERS
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {

    // ======================================
    // VERIFY LOGIN
    // ======================================

    const auth =
      await verifyUser(request);

    if (auth.error) {
      return auth.error;
    }

    // ======================================
    // GET ALL USERS FROM FIRESTORE
    // ======================================

    const snapshot =
      await adminDb
        .collection("users")
        .get();

    const users =
      snapshot.docs.map(
        (doc) => {

          const data =
            doc.data();

          return {
            id: doc.id,

            uid:
              data.uid ||
              doc.id,

            name:
              data.name ||
              "",

            email:
              data.email ||
              "",

            role:
              data.role ||
              "editor",

            status:
              data.status ||
              "active",

            photo:
              data.photo ||
              "",

            bio:
              data.bio ||
              "",

            slug:
              data.slug ||
              createAuthorSlug(
                data.name || ""
              ),

            createdAt:
              data.createdAt?.toDate
                ? data.createdAt
                    .toDate()
                    .toISOString()
                : null,

            updatedAt:
              data.updatedAt?.toDate
                ? data.updatedAt
                    .toDate()
                    .toISOString()
                : null,
          };
        }
      );

    console.log(
      "USERS LOADED:",
      users.length
    );

    return NextResponse.json(
      {
        success: true,
        count: users.length,
        users,
      },
      {
        status: 200,
      }
    );

  } catch (error: any) {

    console.error(
      "GET USERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to fetch users",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// CREATE EDITOR
// ==========================================

export async function POST(
  request: NextRequest
) {
  let firebaseUser:
    | Awaited<
        ReturnType<
          typeof adminAuth.createUser
        >
      >
    | null = null;

  try {

    // ======================================
    // 1. VERIFY ADMIN
    // ======================================

    const auth =
      await verifyAdmin(request);

    if (auth.error) {
      return auth.error;
    }

    // ======================================
    // 2. READ REQUEST BODY
    // ======================================

    const body =
      await request.json();

    console.log(
      "CREATE USER BODY:",
      {
        ...body,
        password: "***",
      }
    );

    // ======================================
    // 3. CLEAN DATA
    // ======================================

    const name =
      String(
        body.name || ""
      ).trim();

    const email =
      String(
        body.email || ""
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        body.password || ""
      );

    const photo =
      String(
        body.photo || ""
      ).trim();

    const bio =
      String(
        body.bio || ""
      ).trim();

    // ======================================
    // 4. VALIDATION
    // ======================================

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password is required",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 6 characters",
        },
        {
          status: 400,
        }
      );
    }

    if (!photo) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Profile photo URL is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!bio) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Author bio is required",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // 5. CREATE SLUG
    // ======================================

    const slug =
      createAuthorSlug(name);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to create author slug",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // 6. CHECK FIRESTORE EMAIL
    // ======================================

    const existingEmail =
      await adminDb
        .collection("users")
        .where(
          "email",
          "==",
          email
        )
        .limit(1)
        .get();

    if (!existingEmail.empty) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A user with this email already exists",
        },
        {
          status: 409,
        }
      );
    }

    // ======================================
    // 7. CHECK SLUG
    // ======================================

    const existingSlug =
      await adminDb
        .collection("users")
        .where(
          "slug",
          "==",
          slug
        )
        .limit(1)
        .get();

    if (!existingSlug.empty) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An author with this name already exists",
        },
        {
          status: 409,
        }
      );
    }

    // ======================================
    // 8. CREATE FIREBASE AUTH ACCOUNT
    // ======================================

    firebaseUser =
      await adminAuth.createUser({
        email,
        password,
        displayName: name,
        photoURL: photo,
      });

    // ======================================
    // 9. CREATE FIRESTORE AUTHOR DOCUMENT
    // ======================================

    const authorData = {
      uid:
        firebaseUser.uid,

      name,

      email,

      role:
        "editor",

      status:
        "active",

      photo,

      bio,

      slug,

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),
    };

    try {

      await adminDb
        .collection("users")
        .doc(firebaseUser.uid)
        .set(authorData);

    } catch (firestoreError) {

      // ====================================
      // ROLLBACK FIREBASE AUTH
      // ====================================

      console.error(
        "FIRESTORE CREATE FAILED. ROLLING BACK AUTH USER:",
        firestoreError
      );

      try {
        await adminAuth.deleteUser(
          firebaseUser.uid
        );
      } catch (rollbackError) {
        console.error(
          "AUTH ROLLBACK FAILED:",
          rollbackError
        );
      }

      throw firestoreError;
    }

    // ======================================
    // 10. SUCCESS LOG
    // ======================================

    console.log(
      "AUTHOR CREATED:",
      {
        uid:
          firebaseUser.uid,

        name,

        email,

        role:
          "editor",

        status:
          "active",

        photo,

        bio,

        slug,
      }
    );

    // ======================================
    // 11. RESPONSE
    // ======================================

    return NextResponse.json(
      {
        success: true,

        user: {
          uid:
            firebaseUser.uid,

          name,

          email,

          role:
            "editor",

          status:
            "active",

          photo,

          bio,

          slug,
        },

        message:
          "Editor created successfully",
      },
      {
        status: 201,
      }
    );

  } catch (error: any) {

    console.error(
      "CREATE USER ERROR:",
      error
    );

    // ======================================
    // EXTRA AUTH ROLLBACK
    // ======================================

    if (
      firebaseUser?.uid
    ) {

      try {

        const firestoreDoc =
          await adminDb
            .collection("users")
            .doc(firebaseUser.uid)
            .get();

        if (
          !firestoreDoc.exists
        ) {

          await adminAuth
            .deleteUser(
              firebaseUser.uid
            );

        }

      } catch (rollbackError) {

        console.error(
          "FINAL AUTH ROLLBACK ERROR:",
          rollbackError
        );

      }
    }

    // ======================================
    // RESPONSE
    // ======================================

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to create editor",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE USER
// ==========================================

export async function DELETE(
  request: NextRequest
) {
  try {

    // ======================================
    // 1. VERIFY ADMIN
    // ======================================

    const auth =
      await verifyAdmin(request);

    if (auth.error) {
      return auth.error;
    }

    // ======================================
    // 2. READ BODY
    // ======================================

    const body =
      await request.json();

    const uid =
      String(
        body.uid || ""
      ).trim();

    // ======================================
    // 3. VALIDATE UID
    // ======================================

    if (!uid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User UID is required",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // 4. PREVENT SELF DELETE
    // ======================================

    if (
      uid ===
      auth.decoded.uid
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot delete your own admin account",
        },
        {
          status: 403,
        }
      );
    }

    // ======================================
    // 5. GET USER DOCUMENT
    // ======================================

    const userRef =
      adminDb
        .collection("users")
        .doc(uid);

    const userDoc =
      await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // ======================================
    // 6. CHECK TARGET ROLE
    // ======================================

    const targetUser =
      userDoc.data();

    if (
      targetUser?.role !==
      "editor"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only editor accounts can be deleted",
        },
        {
          status: 403,
        }
      );
    }

    // ======================================
    // 7. DELETE FIREBASE AUTH
    // ======================================

    try {

      await adminAuth
        .deleteUser(uid);

    } catch (authError: any) {

      console.error(
        "FIREBASE AUTH DELETE ERROR:",
        authError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            authError?.message ||
            "Failed to delete Firebase Authentication user",
        },
        {
          status: 500,
        }
      );
    }

    // ======================================
    // 8. DELETE FIRESTORE DOCUMENT
    // ======================================

    try {

      await userRef.delete();

    } catch (firestoreError: any) {

      console.error(
        "FIRESTORE DELETE ERROR:",
        firestoreError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Firebase Authentication user was deleted, but Firestore profile could not be deleted.",
        },
        {
          status: 500,
        }
      );
    }

    // ======================================
    // 9. SUCCESS
    // ======================================

    console.log(
      "EDITOR DELETED:",
      uid
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "Editor deleted successfully",
      },
      {
        status: 200,
      }
    );

  } catch (error: any) {

    console.error(
      "DELETE USER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to delete editor",
      },
      {
        status: 500,
      }
    );
  }
}