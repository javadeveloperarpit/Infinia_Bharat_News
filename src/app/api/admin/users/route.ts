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
          message: "Authorization header missing",
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
          message: "Authentication token missing",
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
            message: "Admin user not found",
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

async function verifyAdmin(
  request: NextRequest
) {
  const auth =
    await verifyUser(request);

  if (auth.error) {
    return auth;
  }

  if (
    auth.user?.role !== "admin" &&
    auth.user?.role !== "superAdmin"
  ) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message:
            "Only admin can perform this action",
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
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    const auth =
      await verifyUser(request);

    if (auth.error) {
      return auth.error;
    }

    const role =
      auth.user?.role;

    if (
      role !== "admin" &&
      role !== "editor" &&
      role !== "superAdmin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Permission denied",
        },
        {
          status: 403,
        }
      );
    }

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
              data.createdAt
                ?.toDate
                ? data.createdAt
                    .toDate()
                    .toISOString()
                : null,

            updatedAt:
              data.updatedAt
                ?.toDate
                ? data.updatedAt
                    .toDate()
                    .toISOString()
                : null,
          };
        }
      );

    return NextResponse.json(
      users,
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

    const firebaseUser =
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

    await adminDb
      .collection("users")
      .doc(firebaseUser.uid)
      .set(authorData);

    // ======================================
    // 10. RESPONSE
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

    const auth =
      await verifyAdmin(request);

    if (auth.error) {
      return auth.error;
    }

    const body =
      await request.json();

    const uid =
      String(
        body.uid || ""
      ).trim();

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

    await adminAuth
      .deleteUser(uid);

    await userRef.delete();

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