import {
  collection,
  getCountFromServer
} from "firebase/firestore";


import {
  db
} from "@/lib/firebase/firebase";



export async function getDashboardStats(){


const articlesSnapshot =
await getCountFromServer(
  collection(db,"articles")
);



const videosSnapshot =
await getCountFromServer(
  collection(db,"videos")
);



const usersSnapshot =
await getCountFromServer(
  collection(db,"users")
);



const breakingNewsSnapshot =
await getCountFromServer(
  collection(db,"breakingNews")
);



const liveTvSnapshot =
await getCountFromServer(
  collection(db,"liveTv")
);

const adsSnapshot =
await getCountFromServer(
 collection(db,"businessAds")
);


return {


articles:
articlesSnapshot.data().count,


videos:
videosSnapshot.data().count,


users:
usersSnapshot.data().count,


breakingNews:
breakingNewsSnapshot.data().count,


liveTv:
liveTvSnapshot.data().count,

ads:
adsSnapshot.data().count
};


}