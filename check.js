require("dotenv").config({
  path: ".env.local"
});

const { cert, initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");


if(getApps().length === 0){

  initializeApp({

    credential: cert({

      projectId: process.env.FIREBASE_PROJECT_ID,

      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,

      privateKey: process.env.FIREBASE_PRIVATE_KEY
        .replace(/\\n/g, "\n")

    })

  });

}


const db = getFirestore();



async function checkCategories(){


const snapshot =
await db.collection("categories").get();



console.log(
"\nTotal Categories:",
snapshot.size
);



snapshot.forEach((doc)=>{


console.log("\n----------------");

console.log("ID:",doc.id);

console.log(doc.data());


});



process.exit();

}



checkCategories();