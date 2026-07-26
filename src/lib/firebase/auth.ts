import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

import { auth } from "./firebase";


// Register User
export async function registerUser(
  email: string,
  password: string
) {

  const result =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  return result.user;
}


// Login User
export async function loginUser(
  email: string,
  password: string
) {

  const result =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  return result.user;
}


// Logout
export async function logoutUser(){

  await signOut(auth);

}


// Current User
export function getCurrentUser(){

  return auth.currentUser;

}


// Auth State Listener
export function authStateListener(
  callback:(user:User|null)=>void
){

 return onAuthStateChanged(
    auth,
    callback
 );

}