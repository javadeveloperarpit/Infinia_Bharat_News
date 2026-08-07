"use client";

import {
  useLanguageStore
} from "@/store/language-store";


interface Props {
  name:string;
  nameHi:string;
}


export default function CategoryHero({

name,

nameHi

}:Props){


const language =
useLanguageStore(
state=>state.language
);



return (

<div
className="
container-news
pt-8
mb-10
"
>


<div
className="
border-b
border-zinc-200
pb-6
"
>


<div
className="
flex
items-center
gap-3
mb-3
"
>

<div
className="
h-7
w-1
bg-[#AD0000]
rounded-full
"
/>


<span
className="
text-sm
font-bold
uppercase
tracking-wider
text-[#AD0000]
"
>

CATEGORY

</span>


</div>




<h1
className="
text-4xl
md:text-3xl
font-black
tracking-tight
text-[#18181B]
"
>

{
language==="hi"
?
nameHi
:
name
}

</h1>



</div>


</div>

);

}