import {
  loginUser,
  registerUser,
  logoutUser,
} from "@/lib/firebase/auth";

import {
  createUserProfile,
} from "@/repositories/user.repository";


import { UserRole } from "@/types/user";



export async function registerNewUser(
  email:string,
  password:string,
  name:string,
  role:UserRole="user"
){

  const user =
    await registerUser(
      email,
      password
    );


  await createUserProfile({

    uid:user.uid,

    name,

    email:user.email || "",

    role,

    status:"active",

    photoURL:"",

    createdAt:new Date(),

    updatedAt:new Date()

  });


  return user;

}




export async function loginAccount(
 email:string,
 password:string
){

 return await loginUser(
  email,
  password
 );

}



export async function logoutAccount(){

 await logoutUser();

}