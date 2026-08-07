export const runtime = "nodejs";

import {
 NextRequest,
 NextResponse
} from "next/server";

import {
 adminDb
} from "@/lib/firebase/firebase-admin";

import {
 verifyRole
} from "@/lib/auth/verify-role";

import {
 FieldValue
} from "firebase-admin/firestore";



export async function PUT(
 request: NextRequest,
 context: {
  params: Promise<{
   id:string
  }>
 }
){


try{


const {
 id
}= await context.params;



console.log(
"UPDATE ARTICLE ID:",
id
);



if(!id){

return NextResponse.json(
{
success:false,
message:"Article ID missing"
},
{
status:400
}
);

}



const token =
request.headers
.get("authorization")
?.replace(
"Bearer ",
""
);



if(!token){

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



const user:any =
await verifyRole(
token,
[
"admin",
"editor",
"superAdmin"
]
);



const body =
await request.json();



const ref =
adminDb
.collection("articles")
.doc(id);



const old =
await ref.get();



if(!old.exists){

return NextResponse.json(
{
success:false,
message:"Article not found"
},
{
status:404
}
);

}



await ref.update({

...body,


author:
old.data()?.author || {

uid:user.uid,

name:user.name || "INFINIA BHARAT NEWS",

email:user.email || "",

role:user.role || "admin"

},


updatedAt:
FieldValue.serverTimestamp()


});



return NextResponse.json(
{
success:true,
message:"Updated successfully"
}
);



}
catch(error:any){

console.error(
"UPDATE ERROR:",
error
);


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