import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";



export interface PublicVideo {

  id:string;

  title:string;

  youtubeUrl:string;

  thumbnail:string;

  description:string;

  categoryId:string;

  status:string;

  createdAt?:string;

  updatedAt?:string;

}



// ================================
// TIMESTAMP FORMAT
// ================================

function formatTimestamp(value:any){

  if(!value){
    return undefined;
  }


  if(typeof value?.toDate === "function"){

    return value
    .toDate()
    .toISOString();

  }



  if(value?.seconds){

    return new Date(
      value.seconds * 1000
    )
    .toISOString();

  }



  const date =
  new Date(value);



  if(isNaN(date.getTime())){

    return undefined;

  }


  return date.toISOString();

}

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

// ================================
// FORMAT VIDEO
// ================================

function formatVideo(doc:any):PublicVideo{


  const data =
  doc.data();



  return {


    id:doc.id,


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
    data.status || "draft",



    createdAt:
    formatTimestamp(
      data.createdAt
    ),



    updatedAt:
    formatTimestamp(
      data.updatedAt
    )


  };


}




// ======================================
// CATEGORY VIDEOS
// index:
// categoryId + status + createdAt
// ======================================

export async function getPublishedVideosByCategory(
  categoryId:string
):Promise<PublicVideo[]> {



  const q =
  query(

    collection(
      db,
      "videos"
    ),


    where(
      "categoryId",
      "==",
      categoryId
    ),


    where(
      "status",
      "==",
      "published"
    ),


    orderBy(
      "createdAt",
      "desc"
    ),


    limit(18)

  );



  const snap =
  await getDocs(q);



  return snap.docs.map(
    formatVideo
  );


}




// ======================================
// ALL PUBLISHED VIDEOS
// No composite index
// ======================================

export async function getPublishedVideos()
:Promise<PublicVideo[]> {



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


    limit(50)


  );



  const snap =
  await getDocs(q);



  return snap.docs

  .map(formatVideo)


  .sort((a,b)=>{


    const dateA =
    new Date(
      a.createdAt || 0
    )
    .getTime();



    const dateB =
    new Date(
      b.createdAt || 0
    )
    .getTime();



    return dateB - dateA;


  })


  .slice(0,20);



}





// ======================================
// SINGLE VIDEO BY ID
// ======================================

export async function getVideoById(
  id:string
):Promise<PublicVideo|null>{



  if(!id){

    return null;

  }



  const snap =
  await getDoc(

    doc(
      db,
      "videos",
      id
    )

  );



  if(!snap.exists()){

    return null;

  }



  return formatVideo(
    snap
  );


}





// ======================================
// RELATED VIDEOS
// index:
// categoryId + status + createdAt
// ======================================

export async function getRelatedVideos(

  categoryId:string,

  currentId:string

):Promise<PublicVideo[]> {



  const q =
  query(


    collection(
      db,
      "videos"
    ),



    where(
      "categoryId",
      "==",
      categoryId
    ),



    where(
      "status",
      "==",
      "published"
    ),



    orderBy(
      "createdAt",
      "desc"
    ),



    limit(10)


  );



  const snap =
  await getDocs(q);



  return snap.docs

  .map(formatVideo)


  .filter(
    (video)=>
    video.id !== currentId
  )


  .slice(0,6);



}