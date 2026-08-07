import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  createSlug
} from "@/lib/utils/create-slug";


import { auth, db } from "@/lib/firebase/firebase";

export interface ArticleData {
  title: string;
  categoryId: string;
  thumbnail: string;
  shortDescription: string;
  content: string;
  seoTitle: string;
  seoDescription: string;

  slug?: string;

  author?: {
    uid: string;
    name: string;
    email: string;
    role: string;
  };

  featured?: boolean;
  breaking?: boolean;
  priority?: number;

  status: "draft" | "published";
}

// =========================
// GET ARTICLES
// =========================

export async function getArticles() {
  const snapshot = await getDocs(collection(db, "articles"));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as (ArticleData & { id: string })[];
}

// =========================
// GET SINGLE ARTICLE
// =========================

export async function getArticleById(
  id:string
):Promise<(ArticleData & {id:string}) | null> {

const ref =
doc(db,"articles",id);


const snap =
await getDoc(ref);


if(!snap.exists()){
 return null;
}


return {
 id:snap.id,
 ...snap.data()
} as ArticleData & {id:string};

}

// =========================
// UPDATE ARTICLE
// =========================

export async function updateArticle(
id:string,
data:any
){

const user = auth.currentUser;


if(!user){
throw new Error("Not logged in");
}


const token =
await user.getIdToken();



const res =
await fetch(
`/api/admin/articles/${id}`,
{
method:"PUT",

headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},

body:JSON.stringify(data)

}
);



const result =
await res.json();



if(!res.ok){

throw new Error(
result.message || "Update failed"
);

}


return result;

}
// =========================
// DELETE ARTICLE
// =========================

export async function deleteArticle(id: string) {
  await deleteDoc(doc(db, "articles", id));
}