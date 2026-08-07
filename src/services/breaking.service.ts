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




export async function createBreakingNews(
data:BreakingNewsData
){

const ref =
await addDoc(

collection(db,"breakingNews"),

{

...data,

createdAt:serverTimestamp(),

updatedAt:serverTimestamp()

}

);


return ref.id;

}







export interface BreakingNewsData {

id:string;

text:string;

active:boolean;

expiry:string;

createdAt?:any;

updatedAt?:any;

}



export async function getBreakingNews()
:Promise<BreakingNewsData[]>{


const snapshot =
await getDocs(
collection(db,"breakingNews")
);



return snapshot.docs.map(
(item)=>(


{

id:item.id,

...item.data()

} as BreakingNewsData


)

);


}







export async function deleteBreakingNews(
id:string
){

await deleteDoc(

doc(
db,
"breakingNews",
id
)

);


}







export async function updateBreakingNews(
id:string,
data:Partial<BreakingNewsData>
){

await updateDoc(

doc(
db,
"breakingNews",
id
),

{

...data,

updatedAt:serverTimestamp()

}

);


}