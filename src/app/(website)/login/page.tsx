"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";


export default function LoginPage(){

  const router = useRouter();


  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const [error,setError] = useState("");

  const [loading,setLoading] = useState(false);



  async function handleLogin(){

  try{

    setLoading(true);
    setError("");


    const result = await signInWithEmailAndPassword(
 auth,
 email,
 password
);

router.replace("/admin");


  }
  catch(err){

    console.error(
      "LOGIN ERROR:",
      err
    );


    setError(
      "Invalid email or password"
    );

  }
  finally{

    setLoading(false);

  }

}



  return (

    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-zinc-100
    ">


      <div className="
        bg-white
        p-8
        rounded-xl
        shadow
        w-96
      ">


        <h1 className="
          text-2xl
          font-bold
          mb-6
        ">
          INFINIA BHARAT NEWS
        </h1>



        <input

          className="
          w-full
          border
          p-3
          mb-3
          rounded
          "

          placeholder="Email"

          value={email}

          onChange={
            e=>setEmail(e.target.value)
          }

        />



        <input

          className="
          w-full
          border
          p-3
          mb-3
          rounded
          "

          type="password"

          placeholder="Password"

          value={password}

          onChange={
            e=>setPassword(e.target.value)
          }

        />



        {
          error &&
          <p className="text-red-500 mb-3">
            {error}
          </p>
        }



        <button

        onClick={handleLogin}

        className="
        w-full
        bg-red-600
        text-white
        p-3
        rounded
        "

        >

        {
          loading
          ?
          "Logging in..."
          :
          "Login"
        }


        </button>



      </div>


    </div>

  );

}