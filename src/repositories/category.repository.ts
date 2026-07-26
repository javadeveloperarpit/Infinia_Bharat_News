import {
 createDocument,
 getCollection,
 getDocument,
 updateDocument,
 deleteDocument
} from "@/lib/firebase/firestore";


import { Category } from "@/types/category";


const COLLECTION="categories";



export async function createCategory(
 data:Omit<Category,"id">
){

 return await createDocument(
  COLLECTION,
  data
 );

}



export async function getCategories(){

 return await getCollection(
  COLLECTION
 );

}



export async function getCategory(
 id:string
){

 return await getDocument(
  COLLECTION,
  id
 );

}



export async function updateCategory(
 id:string,
 data:Partial<Category>
){

 return await updateDocument(
  COLLECTION,
  id,
  data
 );

}



export async function deleteCategory(
 id:string
){

 return await deleteDocument(
  COLLECTION,
  id
 );

}