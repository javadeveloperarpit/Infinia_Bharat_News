import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

export interface PublicArticle {
  id: string;

  title: string;

  slug: string;

  thumbnail: string;

  shortDescription: string;

  content: string;

  seoTitle: string;

  seoDescription: string;

  categoryId: string;

  featured: boolean;

  breaking: boolean;

  priority: number;

  status: "draft" | "published";

  author?: {
  uid?: string;
  name?: string;
  email?: string;
  role?: string;
};

  createdAt?: string;

  updatedAt?: string;
}
function formatTimestamp(value:any){

  if(!value){
    return undefined;
  }


  // Firestore Timestamp
  if(value?.seconds){

    return new Date(
      value.seconds * 1000
    ).toISOString();

  }


  // Timestamp object
  if(typeof value.toDate === "function"){

    return value
      .toDate()
      .toISOString();

  }


  // Normal date/string
  const date = new Date(value);


  if(isNaN(date.getTime())){
    return undefined;
  }


  return date.toISOString();

}

function formatArticle(doc: any): PublicArticle {
  const data = doc.data();

  return {
    id: doc.id,

    title: data.title || "",

    slug: data.slug || "",

    thumbnail: data.thumbnail || "",

    shortDescription: data.shortDescription || "",

    content: data.content || "",

    seoTitle: data.seoTitle || "",

    seoDescription: data.seoDescription || "",

    categoryId: data.categoryId || "",

    featured: data.featured || false,

    breaking: data.breaking || false,

    priority: data.priority || 0,

    status: data.status,

    author: data.author || {
  name:"INFINIA BHARAT NEWS",
  role:"admin"
},

    createdAt: formatTimestamp(
  data.createdAt
),


updatedAt: formatTimestamp(
  data.updatedAt
),
  };
}

// ======================================
// CATEGORY ARTICLES
// ======================================

export async function getPublishedArticlesByCategory(
  categoryId: string
): Promise<PublicArticle[]> {
  const q = query(
    collection(db, "articles"),

    where("status", "==", "published"),

    where("categoryId", "==", categoryId),

    orderBy("createdAt", "desc"),

    limit(18)
  );

  const snap = await getDocs(q);

  return snap.docs.map(formatArticle);
}

// ======================================
// LATEST ARTICLES
// ======================================

export async function getPublishedArticles(): Promise<PublicArticle[]> {
  const q = query(
    collection(db, "articles"),

    where("status", "==", "published"),

    orderBy("priority", "desc"),
    orderBy("createdAt", "desc"),

    limit(20)
  );

  const snap = await getDocs(q);

  return snap.docs.map(formatArticle);
}

// ======================================
// FEATURED ARTICLES
// ======================================

export async function getFeaturedArticles(): Promise<PublicArticle[]> {
  const q = query(
    collection(db, "articles"),

    where("featured", "==", true),

    where("status", "==", "published"),

    orderBy("priority", "desc"),

    orderBy("createdAt", "desc"),

    limit(5)
  );

  const snap = await getDocs(q);

  return snap.docs.map(formatArticle);
}

// ======================================
// SINGLE ARTICLE
// ======================================

export async function getArticleBySlug(
slug:string
): Promise<PublicArticle | null>{


if(!slug){
return null;
}


const q=query(
collection(db,"articles"),
where(
"slug",
"==",
slug
)
);


const snapshot =
await getDocs(q);



if(snapshot.empty){

return null;

}



return formatArticle(
snapshot.docs[0]
);


}
// ======================================
// RELATED ARTICLES
// ======================================

export async function getRelatedArticles(
  categoryId: string,
  currentSlug: string
): Promise<PublicArticle[]> {
  const q = query(
    collection(db, "articles"),

    where("status", "==", "published"),

    where("categoryId", "==", categoryId),

    orderBy("priority", "desc"),
    orderBy("createdAt", "desc"),

    limit(6)
  );

  const snap = await getDocs(q);

  return snap.docs
    .map(formatArticle)
    .filter((item) => item.slug !== currentSlug)
    .slice(0, 5);
}