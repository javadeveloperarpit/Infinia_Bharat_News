"use client";

import { useState } from "react";

interface Props {
  open:boolean;
  setOpen:(value:boolean)=>void;
  reload:()=>void;
}

export default function AddUserModal({
  open,
  setOpen,
  reload
}:Props){

  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");



  async function createUser(){

    try{

      setLoading(true);
      setMessage("");

      const res =
        await fetch(
          "/api/admin/users",
          {
            method:"POST",
            headers:{
              "Content-Type":"application/json"
            },
            body:JSON.stringify({
              name,
              email,
              password
            })
          }
        );


      const data =
        await res.json();


      if(!data.success){

        setMessage(
          data.message ||
          "Something went wrong"
        );

        return;

      }


      setMessage(
        "Editor created successfully"
      );


      setName("");
      setEmail("");
      setPassword("");


      reload();


      setTimeout(()=>{

        setOpen(false);

        setMessage("");

      },1000);


    }
    catch(error:any){

      setMessage(
        error.message
      );

    }
    finally{

      setLoading(false);

    }

  }



  if(!open) return null;



  return (

    <div
      className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      z-50
      "
    >

      <div
        className="
       bg-white
text-black
        w-full
        max-w-md
        rounded-xl
        p-6
        space-y-5
        "
      >


        <div className="flex justify-between items-center">

          <h2 className="text-xl font-bold">

            Add Editor

          </h2>


          <button

            onClick={()=>setOpen(false)}

            className="text-zinc-500"

          >

            ✕


          </button>


        </div>



        <input

          placeholder="Full Name"

          value={name}

          onChange={
            e=>setName(e.target.value)
          }

          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "

        />



        <input

          placeholder="Email Address"

          type="email"

          value={email}

          onChange={
            e=>setEmail(e.target.value)
          }

          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "

        />



        <input

          placeholder="Password"

          type="password"

          value={password}

          onChange={
            e=>setPassword(e.target.value)
          }

          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "

        />



        {
          message && (

            <div
              className="
              text-sm
              text-center
              text-red-600
              "
            >

              {message}

            </div>

          )
        }



        <button

          onClick={createUser}

          disabled={loading}

          className="
          w-full
          bg-red-600
          text-white
          py-2
          rounded-lg
          hover:bg-red-700
          disabled:opacity-50
          "

        >

          {
            loading
            ?
            "Creating..."
            :
            "Create Editor"
          }


        </button>


      </div>


    </div>

  );

}