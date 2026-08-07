export const runtime = "nodejs";


import {
  NextRequest,
  NextResponse
} from "next/server";


import {
  adminDb
} from "@/lib/firebase/firebase-admin";


import {
  FieldValue
} from "firebase-admin/firestore";


import {
  verifyRole
} from "@/lib/auth/verify-role";


import {
  createSlug
} from "@/lib/utils/create-slug";




// ================================
// CREATE ARTICLE
// ================================

export async function POST(
  request: NextRequest
){


try{


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




// only verify access

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





const slug =
createSlug(
body.title
);





const articleData = {


...body,


slug,



author: {


uid: user?.uid || "",


name: user?.name || "",


email: user?.email || "",


role: user?.role || ""


},



createdAt:
FieldValue.serverTimestamp(),



updatedAt:
FieldValue.serverTimestamp()


};





const ref =
await adminDb
.collection("articles")
.add(articleData);





return NextResponse.json({

success:true,

id:ref.id,

slug

});



}
catch(error:any){


console.error(
"CREATE ARTICLE ERROR:",
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







// ================================
// GET ARTICLES
// ================================


export async function GET(){


try{


const snapshot =
await adminDb
.collection("articles")
.get();




const articles =
snapshot.docs.map(
(doc)=>({

id:doc.id,

...doc.data()

})
);




return NextResponse.json(
articles
);



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