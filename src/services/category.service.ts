import {

  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp

} from "firebase/firestore";


import {
  db
} from "@/lib/firebase/firebase";





export interface CategoryData {

id:string;

name:string;

nameHi:string;

slug:string;

status:"active"|"inactive";

}






// GET CATEGORY BY ID

export async function getCategoryById(
id:string
):Promise<CategoryData|null>{



const snapshot =
await getDoc(

doc(
db,
"categories",
id
)

);




if(snapshot.exists()){



return {


id:snapshot.id,


...snapshot.data()


} as CategoryData;



}




return null;



}








// CREATE CATEGORY

export async function createCategory(
data:Omit<CategoryData,"id">
){



const ref =
await addDoc(

collection(
db,
"categories"
),

{


...data,


createdAt:
serverTimestamp(),


updatedAt:
serverTimestamp()


}

);



return ref.id;



}









// GET CATEGORIES

export async function getCategories(){



const snapshot =
await getDocs(

collection(
db,
"categories"
)

);




return snapshot.docs.map(

(item)=>(


{


id:item.id,


...item.data()


} as CategoryData


)

);



}









// DELETE CATEGORY

export async function deleteCategory(
id:string
){



await deleteDoc(

doc(
db,
"categories",
id
)

);



}









// UPDATE CATEGORY

export async function updateCategory(

id:string,

data:Partial<CategoryData>

){



await updateDoc(

doc(
db,
"categories",
id
),

{


...data,


updatedAt:
serverTimestamp()


}

);



}