"use client";

import { useState } from "react";

import type { UserType } from "./users-page";
import { auth } from "@/lib/firebase/firebase";


interface Props{

  users:UserType[];

  loading:boolean;

  reload:()=>void;

}



export default function UsersTable({

  users,

  loading,

  reload

}:Props){


  const [search,setSearch]=useState("");

  const [deleting,setDeleting]=useState("");



  async function deleteUser(uid:string){


    const confirmDelete =
      confirm(
        "Are you sure you want to delete this editor?"
      );


    if(!confirmDelete) return;



    try{


      setDeleting(uid);


      const currentUser = auth.currentUser;


if(!currentUser){

  alert(
    "Please login again"
  );

  return;

}


const token =
await currentUser.getIdToken();



await fetch(
"/api/admin/users",
{

method:"DELETE",

headers:{

"Content-Type":"application/json",

"Authorization":
`Bearer ${token}`

},

body:JSON.stringify({

uid

})

}
);


      reload();


    }
    catch(error){

      console.log(error);

    }
    finally{

      setDeleting("");

    }


  }



  const filteredUsers =
    users.filter(
      (user)=>

        user.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )

        ||

        user.email
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )

    );



  return(

    <div
className="
bg-white
text-zinc-900
rounded-xl
shadow-lg
p-5
space-y-5
border
border-zinc-200
"
>


      <div>


        <input

          placeholder="Search users..."

          value={search}

          onChange={
            e=>setSearch(e.target.value)
          }

          className="
w-full
border
rounded-lg
px-3
py-2
bg-white
text-black
placeholder:text-zinc-400
"

        />


      </div>



      {

        loading ?


        (

          <div className="text-center py-10">

            Loading users...

          </div>

        )


        :


        filteredUsers.length===0 ?


        (

          <div className="text-center py-10 text-zinc-500">

            No users found

          </div>

        )


        :


        (

        <div className="overflow-x-auto">


          <table className="w-full">


            <thead>


              <tr
className="
border-b
text-left
text-sm
text-zinc-700
"
>

                <th className="py-3">
                  Name
                </th>

                <th>
                  Email
                </th>

                <th>
                  Role
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>


              </tr>


            </thead>



            <tbody>


            {

              filteredUsers.map(
                (user)=>(


                <tr

                  key={user.id}

                  className="
                  border-b
                  hover:bg-zinc-50
                  dark:hover:bg-zinc-800
                  "

                >


                  <td className="py-4 font-medium">

                    {user.name}

                  </td>



                  <td>

                    {user.email}

                  </td>



                  <td>


                    <span

                      className="
                      bg-blue-100
                      text-blue-700
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      "

                    >

                      {user.role}

                    </span>


                  </td>



                  <td>


                    <span

                      className="
                      bg-green-100
                      text-green-700
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      "

                    >

                      {user.status}

                    </span>


                  </td>



                  <td>


                    <button

                      onClick={()=>
                        deleteUser(user.uid)
                      }

                      disabled={
                        deleting===user.uid
                      }

                      className="
                      bg-red-600
                      text-white
                      px-3
                      py-1
                      rounded-lg
                      text-sm
                      disabled:opacity-50
                      "

                    >

                      {
                        deleting===user.uid
                        ?
                        "Deleting..."
                        :
                        "Delete"
                      }


                    </button>


                  </td>



                </tr>


                )

              )

            }


            </tbody>


          </table>


        </div>

        )

      }



    </div>

  );

}