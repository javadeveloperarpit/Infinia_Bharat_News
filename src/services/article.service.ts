import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";


import {
  db
} from "@/lib/firebase/firebase";



export interface ArticleData {


  title:string;

  categoryId:string;

  thumbnail:string;

  shortDescription:string;

  content:string;

  seoTitle:string;

  seoDescription:string;


  featured?:boolean;

  breaking?:boolean;

  priority?:number;


  status:"draft"|"published";


}





// CREATE ARTICLE

export async function createArticle(
data:ArticleData
){


const ref =
await addDoc(

collection(
db,
"articles"
),

{

...data,

createdAt:
serverTimestamp(),

updatedAt:
serverTimestamp()

}

);


return ref.id;


}






// GET ARTICLES

export async function getArticles(){


const snapshot =
await getDocs(
collection(
db,
"articles"
)
);



return snapshot.docs.map(
(item)=>({


id:item.id,

...item.data()


} as ArticleData & {id:string})

);


}






// DELETE ARTICLE

export async function deleteArticle(
id:string
){


await deleteDoc(

doc(
db,
"articles",
id
)

);


}






// UPDATE ARTICLE

export async function updateArticle(
id:string,
data:Partial<ArticleData>
){


await updateDoc(

doc(
db,
"articles",
id
),

{

...data,

updatedAt:
serverTimestamp()

}

);


}