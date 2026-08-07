"use client";


import {
useEffect,
useRef,
useState
} from "react";

import Image from "next/image";

import {
getBreakingNews,
BreakingNewsData
} from "@/services/breaking.service";


import {
useLanguageStore
} from "@/store/language-store";


import {
translations
} from "@/constants/translations";



interface BreakingNewsExtended extends BreakingNewsData{

textHi?:string;

}



export default function BreakingStrip(){


const [news,setNews]
=
useState<BreakingNewsExtended[]>([]);


const [position,setPosition]
=
useState(0);


const trackRef = useRef<HTMLDivElement>(null);



const {language}=useLanguageStore();


const t =
translations[language];





// FETCH NEWS

useEffect(()=>{


async function fetchNews(){


try{


const data:any =
await getBreakingNews();



const active =
data.filter(
(item:any)=>item.active
);



/*
extra copies rakhenge
taaki screen kabhi empty na ho
*/

setNews([
...active,
...active,
...active
]);


}

catch(error){

console.log(
"Breaking error",
error
);

}



}


fetchNews();


},[]);







// CONTINUOUS MOVEMENT

useEffect(()=>{


const timer =
setInterval(()=>{


setPosition(
prev=>prev-1
);



},20);



return ()=>clearInterval(timer);



},[]);








// RESET WITHOUT JUMP

useEffect(()=>{


const track =
trackRef.current;


if(!track)
return;



const firstChild =
track.firstElementChild as HTMLElement | null;



if(
firstChild &&
Math.abs(position) >= firstChild.offsetWidth
){


setNews(prev=>{


if(prev.length===0)
return prev;



return [
...prev.slice(1),
prev[0]
];


});



setPosition(0);


}



},[position]);







if(news.length===0)
return null;






return(


<section
className="
w-full
bg-[#fffafa]
border-y
border-zinc-200
overflow-hidden
shadow-sm
"
>


<div
className="
flex
h-11
sm:h-12
md:h-14
items-center
"
>



{/* LABEL */}

<div
className="
h-full
shrink-0
flex
items-center
justify-center
px-1
md:px-2
"
>
  <Image
    src={
      language === "hi"
        ? "/images/breaking news tag.png"
        : "/images/breaking news tag2.png"
    }
    alt="Breaking News"
    width={170}
    height={48}
    priority
    className="
    h-9
    md:h-11
    w-auto
    select-none
    pointer-events-none
    "
  />
</div>





{/* STREAM */}


<div
className="
overflow-hidden
flex-1
"
>


<div


ref={trackRef}


style={{

transform:
`translateX(${position}px)`

}}


className="
flex
items-center
whitespace-nowrap
will-change-transform
"

>


{

news.map(
(item,index)=>(


<div

key={item.id + index}

className="
flex
items-center
px-8
font-semibold
text-[13px]
sm:text-sm
md:text-[15px]
tracking-normal
text-zinc-800
shrink-0
"

>


{

language==="hi"

?

item.textHi || item.text

:

item.text

}
<span
className="
mx-6
h-4
w-px
bg-red-600
"
></span>

</div>


)

)


}


</div>



</div>


</div>


</section>


);


}