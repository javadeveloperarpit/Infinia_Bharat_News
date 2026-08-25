export const runtime = "nodejs";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  verifyRole,
} from "@/lib/auth/verify-role";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  syncArticleUpdate,
} from "@/lib/github/article-sync";

import {
  createSlug,
} from "@/lib/utils/create-slug";

// ======================================================
// TYPES
// ======================================================

type FeaturedUpdate = {
  id: string;
  featured: boolean;
  priority?: number | null;
};

// ======================================================
// PUT
// BATCH FEATURED + PRIORITY UPDATE
// ======================================================

export async function PUT(
  request: NextRequest
) {
  try {
    // ==================================================
    // AUTH
    // ==================================================

    const token =
      request.headers
        .get("authorization")
        ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const user: any =
      await verifyRole(
        token,
        [
          "admin",
          "editor",
          "superAdmin",
        ]
      );

    // ==================================================
    // BODY
    // ==================================================

    const body =
      await request.json();

    const updates =
      Array.isArray(body?.updates)
        ? body.updates
        : [];

    if (!updates.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No featured updates supplied.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // NORMALIZE INPUT
    // ==================================================

    const normalizedUpdates:
      FeaturedUpdate[] =
      updates.map(
        (item: any) => ({
          id: String(item?.id || ""),
          featured:
            item?.featured === true,
          priority:
            item?.priority === null ||
            item?.priority === undefined ||
            item?.priority === ""
              ? null
              : Number(item.priority),
        })
      );

    // ==================================================
    // DUPLICATE ARTICLE IDs
    // ==================================================

    const ids =
      normalizedUpdates.map(
        (item) => item.id
      );

    if (
      ids.some((id) => !id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid article ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      new Set(ids).size !==
      ids.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Duplicate article IDs found in request.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // LOAD ALL AFFECTED ARTICLES
    // ==================================================

    const articleRefs =
      normalizedUpdates.map(
        (item) =>
          adminDb
            .collection("articles")
            .doc(item.id)
      );

    const snapshots =
      await adminDb.getAll(
        ...articleRefs
      );

    const articleMap =
      new Map<string, any>();

    snapshots.forEach(
      (snapshot) => {
        if (snapshot.exists) {
          articleMap.set(
            snapshot.id,
            snapshot.data() || {}
          );
        }
      }
    );

    // ==================================================
    // ARTICLE EXISTENCE
    // ==================================================

    for (const update of normalizedUpdates) {
      if (
        !articleMap.has(update.id)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Article not found: ${update.id}`,
          },
          {
            status: 404,
          }
        );
      }
    }

    // ==================================================
    // BUILD FINAL FEATURED STATE
    //
    // IMPORTANT:
    // We validate the FINAL state, not the
    // current database state.
    //
    // This allows:
    //
    // A = 4
    // B = 5
    //
    // to become:
    //
    // A = 5
    // B = 4
    // ==================================================

    const finalFeatured =
      new Map<string, boolean>();

    const finalPriority =
      new Map<string, number | null>();

    // Start with current Firebase state.
    articleMap.forEach(
      (data, id) => {
        finalFeatured.set(
          id,
          data?.featured === true
        );

        finalPriority.set(
          id,
          data?.priority ?? null
        );
      }
    );

    // Apply requested changes.
    for (const update of normalizedUpdates) {
      finalFeatured.set(
        update.id,
        update.featured
      );

      if (!update.featured) {
        finalPriority.set(
          update.id,
          null
        );
      } else {
        finalPriority.set(
          update.id,
          update.priority ?? null
        );
      }
    }

    // ==================================================
    // LOAD EXISTING FEATURED ARTICLES
    //
    // Needed because the admin may only be changing
    // 2 articles while other featured articles already
    // exist.
    // ==================================================

    const featuredSnapshot =
      await adminDb
        .collection("articles")
        .where(
          "featured",
          "==",
          true
        )
        .get();

    // Add untouched featured articles to final state.
    featuredSnapshot.docs.forEach(
      (snapshot) => {
        if (
          !finalFeatured.has(
            snapshot.id
          )
        ) {
          const data =
            snapshot.data();

          finalFeatured.set(
            snapshot.id,
            true
          );

          finalPriority.set(
            snapshot.id,
            data?.priority ??
              null
          );
        }
      }
    );

    // ==================================================
    // FINAL FEATURED ARTICLES
    // ==================================================

    const finalFeaturedIds =
      Array.from(
        finalFeatured.entries()
      )
        .filter(
          ([, featured]) =>
            featured === true
        )
        .map(([id]) => id);

    // ==================================================
    // MAX 5 FEATURED
    // ==================================================

    if (
      finalFeaturedIds.length > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Maximum 5 featured articles are allowed.",
        },
        {
          status: 409,
        }
      );
    }

    // ==================================================
    // PRIORITY VALIDATION
    // ==================================================

    const priorityOwners =
      new Map<number, string>();

    for (
      const articleId
      of finalFeaturedIds
    ) {
      const priority =
        finalPriority.get(
          articleId
        );

      if (
        !Number.isInteger(
          priority
        ) ||
        Number(priority) < 1 ||
        Number(priority) > 5
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Priority must be between 1 and 5 for article ${articleId}.`,
          },
          {
            status: 400,
          }
        );
      }

      const numericPriority =
        Number(priority);

      const existingOwner =
        priorityOwners.get(
          numericPriority
        );

      if (
        existingOwner &&
        existingOwner !==
          articleId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Priority ${numericPriority} is already assigned to another featured article.`,
          },
          {
            status: 409,
          }
        );
      }

      priorityOwners.set(
        numericPriority,
        articleId
      );
    }

    // ==================================================
    // FINAL STATE IS VALID
    // ==================================================

    // IMPORTANT:
    // Do not call ref.update() one-by-one.
    //
    // Firestore batch guarantees that all Firebase
    // changes are committed together.
    // ==================================================

    const batch =
      adminDb.batch();

    const changedArticles:
      Array<{
        id: string;
        oldData: any;
        newFeatured: boolean;
        newPriority: number | null;
      }> = [];

    for (
      const update
      of normalizedUpdates
    ) {
      const ref =
        adminDb
          .collection("articles")
          .doc(update.id);

      const oldData =
        articleMap.get(
          update.id
        ) || {};

      const newFeatured =
        finalFeatured.get(
          update.id
        ) === true;

      const newPriority =
        newFeatured
          ? Number(
              finalPriority.get(
                update.id
              )
            )
          : null;

      // ----------------------------------------------
      // FIREBASE DATA
      // ----------------------------------------------

      const updateData:
        Record<string, any> = {
          featured:
            newFeatured,

          updatedAt:
            FieldValue.serverTimestamp(),
        };

      if (newFeatured) {
        updateData.priority =
          newPriority;
      } else {
        updateData.priority =
          FieldValue.delete();
      }

      batch.update(
        ref,
        updateData
      );

      changedArticles.push({
        id: update.id,
        oldData,
        newFeatured,
        newPriority,
      });
    }

    // ==================================================
    // FIREBASE COMMIT
    // ==================================================

    await batch.commit();

    // ==================================================
    // GITHUB SYNC
    //
    // Firebase has already been updated completely.
    //
    // Now sync every changed article sequentially.
    //
    // IMPORTANT:
    // No Promise.all() here.
    //
    // This prevents multiple GitHub requests from
    // fighting over the same articles.json SHA.
    // ==================================================

    const githubResults: Array<{
      id: string;
      synced: boolean;
      error?: string;
    }> = [];

    for (
      const changed
      of changedArticles
    ) {
      try {
        const oldData =
          changed.oldData || {};

        const slug =
          oldData.slug ||
          "";

        const githubArticle = {
          id:
            changed.id,

          ...oldData,

          featured:
            changed.newFeatured,

          priority:
            changed.newFeatured
              ? changed.newPriority
              : null,

          slug,

          author:
            oldData.author || {
              uid:
                user?.uid || "",

              name:
                user?.name ||
                "INFINIA BHARAT NEWS",

              email:
                user?.email || "",

              role:
                user?.role ||
                "admin",
            },

          updatedAt:
            new Date()
              .toISOString(),
        };

        await syncArticleUpdate(
          githubArticle
        );

        githubResults.push({
          id:
            changed.id,
          synced: true,
        });
      } catch (githubError: any) {
        console.error(
          "BATCH GITHUB SYNC FAILED:",
          changed.id,
          githubError
        );

        githubResults.push({
          id:
            changed.id,

          synced: false,

          error:
            githubError?.message ||
            "GitHub sync failed",
        });
      }
    }

    // ==================================================
    // GITHUB STATUS
    // ==================================================

    const githubSynced =
      githubResults.every(
        (item) =>
          item.synced === true
      );

    // ==================================================
    // SUCCESS
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Featured settings updated successfully.",

        updatedCount:
          changedArticles.length,

        githubSynced,

        githubResults,
      }
    );
  } catch (error: any) {
    console.error(
      "BATCH FEATURED UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to update featured settings.",
      },
      {
        status: 500,
      }
    );
  }
}