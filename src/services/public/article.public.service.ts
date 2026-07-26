import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";


import {
 db
} from "@/lib/firebase/firebase";



export async function getPublishedArticles(){


const q = query(

collection(db,"articles"),

where(
"status",
"==",
"published"
),

orderBy(
"createdAt",
"desc"
),

limit(20)

);



const snap =
await getDocs(q);



return snap.docs.map(
doc=>({

id:doc.id,

...doc.data()

})

);


}





export async function getFeaturedArticles(){


const q=query(

collection(db,"articles"),

where(
"featured",
"==",
true
),

where(
"status",
"==",
"published"
),

limit(5)

);



const snap =
await getDocs(q);



return snap.docs.map(
doc=>({

id:doc.id,

...doc.data()

})

);


}