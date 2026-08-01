export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase/firebase-admin";

import { FieldValue } from "firebase-admin/firestore";
import { verifyRole } from "@/lib/auth/verify-role";


export async function POST(
  request: NextRequest
) {

  try {

    const body = await request.json();

    const {
      name,
      email,
      password
    } = body;



    if(
      !name ||
      !email ||
      !password
    ){

      return NextResponse.json(
        {
          success:false,
          message:"All fields are required."
        },
        {
          status:400
        }
      );

    }



    const user =
      await adminAuth.createUser({

        displayName:name,

        email,

        password

      });



    await adminDb
      .collection("users")
      .doc(user.uid)
      .set({

        uid:user.uid,

        name,

        email,

        role:"editor",

        status:"active",

        createdAt:FieldValue.serverTimestamp(),

        updatedAt:FieldValue.serverTimestamp()

      });



    return NextResponse.json({

      success:true,

      message:"Editor created successfully."

    });

  }

  catch(error:any){

    return NextResponse.json(

      {

        success:false,

        message:error.message

      },

      {

        status:500

      }

    );

  }

}
export async function GET(){

  try{

    const snapshot =
      await adminDb
      .collection("users")
      .get();


    const users =
      snapshot.docs.map(
        (doc)=>({

          id:doc.id,

          ...doc.data()

        })
      );


    console.log(
      "USERS:",
      users
    );


    return NextResponse.json(users);


  }

  catch(error:any){

    console.error(
      "FIREBASE ERROR:",
      error
    );


    return NextResponse.json(
      {
        success:false,
        message:error.message,
        code:error.code
      },
      {
        status:500
      }
    );

  }

}
export async function DELETE(
request:NextRequest
){

try{


const authHeader =
request.headers.get(
"authorization"
);


if(!authHeader){

return NextResponse.json(
{
success:false,
message:"Unauthorized"
},
{
status:401
}
);

}


const token =
authHeader.replace(
"Bearer ",
"");



const currentUser = await verifyRole(
 token,
 [
 "admin",
 "superAdmin"
 ]
) as {
 uid: string;
 role: "admin" | "superAdmin";
};



const {uid}=await request.json();



const target =
await adminDb
.collection("users")
.doc(uid)
.get();



const targetData =
target.data();



if(
uid === currentUser.uid
){

return NextResponse.json(
{
success:false,
message:"Cannot delete yourself"
},
{
status:400
}
);

}



if(
targetData?.role==="superAdmin"
){

return NextResponse.json(
{
success:false,
message:"Cannot delete super admin"
},
{
status:403
}
);

}



if(
currentUser.role==="admin" &&
targetData?.role==="admin"
){

return NextResponse.json(
{
success:false,
message:"Admin cannot delete admin"
},
{
status:403
}
);

}



await adminAuth.deleteUser(uid);


await adminDb
.collection("users")
.doc(uid)
.delete();



return NextResponse.json(
{
success:true,
message:"User deleted"
}
);



}
catch(error:any){

return NextResponse.json(
{
success:false,
message:error.message
},
{
status:403
}
);

}

}