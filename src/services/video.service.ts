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



export interface VideoData {


title:string;

youtubeId:string;

thumbnail:string;

categoryId:string;

description:string;

status:"draft"|"published";


}




export async function createVideo(
data:VideoData
){

const ref =
await addDoc(

collection(db,"videos"),

{

...data,

createdAt:serverTimestamp(),

updatedAt:serverTimestamp()

}

);


return ref.id;

}





export async function getVideos(){


const snapshot =
await getDocs(
collection(db,"videos")
);



return snapshot.docs.map(
(item)=>({

id:item.id,

...item.data()

})
);


}






export async function deleteVideo(
id:string
){

await deleteDoc(
doc(
db,
"videos",
id
)
);

}







export async function updateVideo(
id:string,
data:Partial<VideoData>
){


await updateDoc(

doc(
db,
"videos",
id
),

{

...data,

updatedAt:serverTimestamp()

}

);


}