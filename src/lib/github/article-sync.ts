
// ======================================================
// ARTICLE SYNC
// Firebase -> GitHub
// ======================================================

import {
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  serializeValue,
  writeGitHubJson,
} from "./github-utils";


// ======================================================
// PATH
// ======================================================

const ARTICLES_PATH =
  "public/data/articles.json";


// ======================================================
// GET AUTHOR PHOTO
// ======================================================
//
// Article ke author.uid se users collection me
// actual profile photo find karega.
//
// Supported fields:
// photo
// photoURL
// profilePhoto
// profileImage
// image
// imageUrl
// avatar
//
// ======================================================

async function getAuthorPhoto(
  author: any
): Promise<string> {

  if (!author?.uid) {
    return "";
  }

  try {

    const userDoc =
      await adminDb
        .collection("users")
        .doc(author.uid)
        .get();


    if (!userDoc.exists) {
      return "";
    }


    const user =
      userDoc.data() || {};


    const photo =
      user.photo ||
      user.photoURL ||
      user.profilePhoto ||
      user.profileImage ||
      user.image ||
      user.imageUrl ||
      user.avatar ||
      "";


    return photo
      ? String(photo)
      : "";

  } catch (error) {

    console.error(
      `AUTHOR PHOTO ERROR [${author.uid}]:`,
      error
    );

    return "";
  }
}


// ======================================================
// FORMAT AUTHOR
// ======================================================

async function enrichAuthor(
  author: any
) {

  if (!author) {
    return author;
  }


  const photo =
    await getAuthorPhoto(author);


  return {

    ...author,

    photo:
      photo ||
      author.photo ||
      author.photoURL ||
      author.profilePhoto ||
      author.profileImage ||
      author.image ||
      author.imageUrl ||
      author.avatar ||
      "",

  };

}


// ======================================================
// GET ALL ARTICLES
// ======================================================

async function getAllFirebaseArticles() {
  const snapshot = await adminDb
    .collection("articles")
    .get();

  const userCache = new Map<string, any>();

  const articles = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();

      let author = data.author || {};

      const uid = author?.uid;

      if (uid) {
        let user = userCache.get(uid);

        if (!user) {
          const userDoc = await adminDb
            .collection("users")
            .doc(uid)
            .get();

          if (userDoc.exists) {
            user = userDoc.data();
            userCache.set(uid, user);
          }
        }

        if (user) {
          author = {
            uid,

            name:
              user.name ||
              author.name ||
              "",

            email:
              user.email ||
              author.email ||
              "",

            role:
              user.role ||
              author.role ||
              "editor",

            photo:
              user.photo ||
              author.photo ||
              "",

            slug:
              user.slug ||
              author.slug ||
              "",

            bio:
              user.bio ||
              author.bio ||
              "",
          };
        }
      }

      return serializeValue({
        id: doc.id,
        ...data,
        author,
      });
    })
  );

  return articles;
}

// ======================================================
// MAIN ARTICLE SYNC
// ======================================================

export async function syncArticlesFromFirebase() {

  console.log(
    "=========================================="
  );

  console.log(
    "ARTICLE SYNC START"
  );

  console.log(
    "=========================================="
  );


  const articles =
    await getAllFirebaseArticles();


  console.log(
    "Firebase articles:",
    articles.length
  );


  await writeGitHubJson(
    ARTICLES_PATH,
    articles,
    "Sync articles.json from Firebase"
  );


  console.log(
    "ARTICLE SYNC SUCCESS:",
    articles.length
  );


  return {

    success: true,

    count:
      articles.length,

  };

}


// ======================================================
// ALIASES
// ======================================================

export async function syncArticleCreate(
  _article?: Record<string, any>
) {

  return syncArticlesFromFirebase();

}


export async function syncArticleUpdate(
  _article?: Record<string, any>
) {

  return syncArticlesFromFirebase();

}


export async function syncArticleDelete(
  _articleId?: string
) {

  return syncArticlesFromFirebase();

}