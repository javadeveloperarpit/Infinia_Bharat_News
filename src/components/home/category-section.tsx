"use client";

import SectionHeader from "./section-header";
import NewsCard from "./news-card";
import VideoCard from "./video-card";

import {
  useLanguageStore
} from "@/store/language-store";



interface Article {

id:string;

title:string;

thumbnail:string;

shortDescription?:string;

categoryId:string;

createdAt?:string;

views?:number;

}



interface Video {

id:string;

title:string;

thumbnail:string;

youtubeUrl:string;

categoryId:string;

createdAt?:string;

views?:number;

}



interface NativeAd {
  id: string;
  type: "native";
  title: string;
  image: string;
  link: string;
  position: string;
  active: boolean;
  priority?: number;
  mobileEnabled?: boolean;
  desktopEnabled?: boolean;
  openInNewTab?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface Props {
  name: string;
  nameHi: string;
  slug: string;
  articles: Article[];
  videos: Video[];
  nativeAds?: NativeAdItem[];
}


type NativeAdItem = {
  id: string;
  type: "native";
  title: string;
  image: string;
  link: string;
  active: boolean;
  priority: number;
  mobileEnabled: boolean;
  desktopEnabled: boolean;
  openInNewTab: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};



export default function CategorySection({
  name,
  nameHi,
  slug,
  articles,
  videos,
  nativeAds = [],
}: Props) {



const language =
useLanguageStore(
state=>state.language
);



const articleList =
articles?.slice(0,18) || [];



const videoList =
videos?.slice(0,6) || [];





const cards:any[] = [];



let a = 0;

let v = 0;





for(let i=0;i<18;i++){



if(
(i+1)%3===0 &&
v < videoList.length
){


cards.push({

type:"video",

data:videoList[v++]

});


}



else if(
a < articleList.length
){


cards.push({

type:"article",

data:articleList[a++]

});


}



else if(
v < videoList.length
){


cards.push({

type:"video",

data:videoList[v++]

});


}



else{


cards.push({

type:"fallback"

});


}


}



let nativeIndex = 0;

const cardsWithAds: any[] = [];

let realContentCount = 0;

cards.forEach((item) => {

  cardsWithAds.push(item);

  if (
    item.type === "article" ||
    item.type === "video"
  ) {

    realContentCount++;

    if (
      realContentCount % 3 === 0 &&
      nativeAds.length > 0
    ) {

      cardsWithAds.push({
        type: "native",
        data:
          nativeAds[
            nativeIndex %
              nativeAds.length
          ],
      });

      nativeIndex++;
    }
  }
});


// ======================================
// FEWER THAN 3 REAL CONTENT ITEMS
// Show ad immediately after real content
// ======================================

if (
  realContentCount > 0 &&
  realContentCount < 3 &&
  nativeAds.length > 0
) {

  const lastRealIndex =
    cardsWithAds.reduce(
      (last, item, index) =>
        item.type === "article" ||
        item.type === "video"
          ? index
          : last,
      -1
    );

  if (lastRealIndex !== -1) {

    cardsWithAds.splice(
      lastRealIndex + 1,
      0,
      {
        type: "native",
        data:
          nativeAds[
            nativeIndex %
              nativeAds.length
          ],
      }
    );
  }
}


const mobileCards =
  cardsWithAds.slice(0, 6);





function renderCard(
item:any,
index:number
){

if (item.type === "native") {
  return (
    <NewsCard
    key={`native-${item.data.id}-${index}`}
      article={{
        id: item.data.id,
        title: item.data.title,
        thumbnail: item.data.image,

        isNativeAd: true,

        adLink: item.data.link,

        openInNewTab:
          item.data.openInNewTab,
      }}
    />
  );
}

if(item.type==="article"){


return(

<NewsCard

key={item.data.id}

article={item.data}

/>

);


}





if(item.type==="video"){


return(

<VideoCard

key={item.data.id}

{...item.data}

/>

);


}






return(


<div

key={index}

className="

flex

gap-3

rounded-xl

overflow-hidden

border

border-zinc-200

p-3

aspect-[16/6]

bg-zinc-100

"

>


<div

className="

w-32

sm:w-40

aspect-video

rounded-lg

bg-gradient-to-br

from-zinc-300

via-zinc-200

to-zinc-100

blur-sm

"

></div>



<div

className="

flex-1

space-y-3

"

>


<div

className="

h-4

bg-zinc-300

rounded

"

/>


<div

className="

h-4

w-3/4

bg-zinc-300

rounded

"

/>


<div

className="

h-3

w-1/2

bg-zinc-200

rounded

"

/>


</div>



</div>


);



}







return(


<section>



<SectionHeader

title={
language==="hi"
?
nameHi
:
name
}

slug={slug}

/>







{/* MOBILE */}

<div

className="

grid

grid-cols-1

gap-4

xl:hidden

"

>


{

mobileCards.map(
renderCard
)

}


</div>








{/* DESKTOP */}


<div


className="


hidden


xl:grid


grid-cols-3


gap-5


"


>



{


cardsWithAds.map(
(item,index)=>



<div


key={
  item.type === "native"
    ? `native-desktop-${item.data.id}-${index}`
    : item.data?.id || `fallback-desktop-${index}`
}


className="


col-span-1


"


>



{


renderCard(
item,
index
)


}




</div>



)



}




</div>





</section>


);


}