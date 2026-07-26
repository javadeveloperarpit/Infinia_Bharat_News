import {
 getUserProfile
} from "@/repositories/user.repository";


export async function checkUserRole(
 uid:string,
 role:string
){

 const user =
   await getUserProfile(uid);


 if(!user){
   return false;
 }


 return user.role === role;

}