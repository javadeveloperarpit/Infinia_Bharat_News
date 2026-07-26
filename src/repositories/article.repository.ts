import {
  createDocument,
  getCollection,
  getDocument,
  updateDocument,
  deleteDocument
} from "@/lib/firebase/firestore";


import { Article } from "@/types/article";



const COLLECTION = "articles";



export async function createArticle(
 article:Omit<Article,"id">
){

 return await createDocument(
  COLLECTION,
  article
 );

}



export async function getArticle(
 id:string
){

 return await getDocument(
  COLLECTION,
  id
 );

}



export async function getArticles(){

 return await getCollection(
  COLLECTION
 );

}



export async function updateArticle(
 id:string,
 data:Partial<Article>
){

 return await updateDocument(
  COLLECTION,
  id,
  data
 );

}



export async function deleteArticle(
 id:string
){

 return await deleteDocument(
  COLLECTION,
  id
 );

}