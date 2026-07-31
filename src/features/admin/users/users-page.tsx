"use client";

import { useEffect, useState } from "react";

import AddUserModal from "./add-user-modal";
import UsersTable from "./users-table";

export interface UserType{

  id:string;

  uid:string;

  name:string;

  email:string;

  role:string;

  status:string;

}

export default function UsersPage(){

  const [users,setUsers]=
    useState<UserType[]>([]);

  const [loading,setLoading]=
    useState(true);

  const [open,setOpen]=
    useState(false);

  async function loadUsers(){

  try{

    setLoading(true);


    const res =
      await fetch(
        "/api/admin/users"
      );


    const data =
      await res.json();


    if(Array.isArray(data)){

      setUsers(data);

    }
    else{

      console.error(
        "API ERROR:",
        data
      );

      setUsers([]);

    }


  }
  catch(error){

    console.error(error);

    setUsers([]);

  }
  finally{

    setLoading(false);

  }

}

  useEffect(()=>{

    loadUsers();

  },[]);

  return(
  <div className="
    min-h-screen
    bg-zinc-100
    text-zinc-900
    p-6
    space-y-6
  ">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold">

            Users

          </h1>

          <p className="text-zinc-500">

            Manage Editors

          </p>

        </div>

        <button

          onClick={()=>setOpen(true)}

          className="
          bg-red-600
          text-white
          px-4
          py-2
          rounded-lg
          hover:bg-red-700
          "

        >

          + Add Editor

        </button>

      </div>

      <UsersTable

        users={users}

        loading={loading}

        reload={loadUsers}

      />

      <AddUserModal

        open={open}

        setOpen={setOpen}

        reload={loadUsers}

      />

    </div>

  );

}