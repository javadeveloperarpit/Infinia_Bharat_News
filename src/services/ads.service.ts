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



export interface AdsData{

title:string;

image:string;

link:string;

position:string;

active:boolean;

}




export async function createAd(
data:AdsData
){

return await addDoc(

collection(db,"businessAds"),

{

...data,

createdAt:serverTimestamp(),

updatedAt:serverTimestamp()

}

);

}




export async function getAds(){


const snap =
await getDocs(
collection(db,"businessAds")
);


return snap.docs.map(
d=>({

id:d.id,

...d.data()

})
);


}





export async function deleteAd(
id:string
){

await deleteDoc(
doc(
 db,
 "businessAds",
 id
)
);

}





export async function updateAd(
id:string,
data:Partial<AdsData>
){

await updateDoc(

doc(
db,
"ads",
id
),

{

...data,

updatedAt:serverTimestamp()

}

);


}