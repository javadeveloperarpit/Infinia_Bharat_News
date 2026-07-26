import {
 createDocument,
 getCollection,
 getDocument,
 updateDocument,
 deleteDocument
} from "@/lib/firebase/firestore";


import { Advertisement } from "@/types/ad";


const COLLECTION="ads";



export async function createAd(
 data:Omit<Advertisement,"id">
){

 return await createDocument(
  COLLECTION,
  data
 );

}



export async function getAds(){

 return await getCollection(
  COLLECTION
 );

}



export async function getAd(
 id:string
){

 return await getDocument(
  COLLECTION,
  id
 );

}



export async function updateAd(
 id:string,
 data:Partial<Advertisement>
){

 return await updateDocument(
  COLLECTION,
  id,
  data
 );

}



export async function deleteAd(
 id:string
){

 return await deleteDocument(
  COLLECTION,
  id
 );

}
