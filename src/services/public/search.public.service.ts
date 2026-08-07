import {
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

import {
  PublicArticle
} from "./article.public.service";

import {
  PublicVideo
} from "./video.public.service";



// ================================
// TIMESTAMP FORMAT
// ================================

function formatTimestamp(value:any){

  if(!value){
    return undefined;
  }



  // Firestore Timestamp

  if(typeof value?.toDate === "function"){

    return value
    .toDate()
    .toISOString();

  }



  // Timestamp seconds object

  if(value?.seconds){

    return new Date(
      value.seconds * 1000
    )
    .toISOString();

  }



  // Normal date/string

  const date =
  new Date(value);



  if(isNaN(date.getTime())){

    return undefined;

  }



  return date.toISOString();

}





// ================================
// SEARCH ARTICLES
// ================================

export async function searchArticles(
keyword:string
):Promise<PublicArticle[]> {



if(!keyword){

  return [];

}



const q =
query(

  collection(
    db,
    "articles"
  ),


  where(
    "status",
    "==",
    "published"
  ),


  limit(100)

);




const snap =
await getDocs(q);



const search =
keyword.toLowerCase();




return snap.docs

.map((doc:any)=>{


const data =
doc.data();



return {


id:doc.id,


title:
data.title || "",


slug:
data.slug || "",


thumbnail:
data.thumbnail || "",


shortDescription:
data.shortDescription || "",


content:
data.content || "",


seoTitle:
data.seoTitle || "",


seoDescription:
data.seoDescription || "",


categoryId:
data.categoryId || "",


featured:
data.featured || false,


breaking:
data.breaking || false,


priority:
data.priority || 0,


status:
data.status,



createdAt:
formatTimestamp(
  data.createdAt
),


};


})


.filter(

(article)=>

article.title
.toLowerCase()
.includes(search)

||

article.shortDescription
.toLowerCase()
.includes(search)

)

.slice(0,20);



}






// ================================
// SEARCH VIDEOS
// ================================

export async function searchVideos(

keyword:string

):Promise<PublicVideo[]> {



if(!keyword){

return [];

}



const q =
query(

collection(
db,
"videos"
),


where(
"status",
"==",
"published"
),


limit(100)

);




const snap =
await getDocs(q);



const search =
keyword.toLowerCase();

function getYoutubeThumbnail(url:string){

try{

const videoId =
new URL(url)
.searchParams
.get("v");


if(videoId){

return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

}


}catch{

return "";

}


return "";

}



return snap.docs


.map((doc:any)=>{


const data =
doc.data();



return {


id:
doc.id,


title:
data.title || "",



youtubeUrl:
data.youtubeUrl || "",



thumbnail:
data.thumbnail ||
getYoutubeThumbnail(
data.youtubeUrl
),



description:
data.description || "",



categoryId:
data.categoryId || "",



status:
data.status,



createdAt:
formatTimestamp(
  data.createdAt
),



};


})



.filter(

(video)=>

video.title
.toLowerCase()
.includes(search)

||

video.description
.toLowerCase()
.includes(search)

)



.slice(0,20);



}