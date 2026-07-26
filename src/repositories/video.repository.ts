import {
 createDocument,
 getCollection,
 getDocument,
 updateDocument,
 deleteDocument
} from "@/lib/firebase/firestore";


import { Video } from "@/types/video";


const COLLECTION="videos";



export async function createVideo(
 data:Omit<Video,"id">
){

 return await createDocument(
  COLLECTION,
  data
 );

}



export async function getVideos(){

 return await getCollection(
  COLLECTION
 );

}



export async function getVideo(
 id:string
){

 return await getDocument(
  COLLECTION,
  id
 );

}



export async function updateVideo(
 id:string,
 data:Partial<Video>
){

 return await updateDocument(
  COLLECTION,
  id,
  data
 );

}



export async function deleteVideo(
 id:string
){

 return await deleteDocument(
  COLLECTION,
  id
 );

}