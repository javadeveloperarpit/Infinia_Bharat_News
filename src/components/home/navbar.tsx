"use client";


import Link from "next/link";

import {
useEffect,
useState
} from "react";


import {
usePathname
} from "next/navigation";


import {
getCategories
} from "@/services/category.service";


import {
useLanguageStore
} from "@/store/language-store";




export default function Navbar(){


const pathname = usePathname();


const [categories,setCategories] =
useState<any[]>([]);



const language =
useLanguageStore(
(state)=>state.language
);



useEffect(()=>{


async function loadCategories(){


try{


const data =
await getCategories();


setCategories(data);


}

catch(error){

console.error(
"Category Load Error:",
error
);

}


}


loadCategories();


},[]);





return (

<nav

className="
w-full
bg-[#090909]
border-b
border-[#ECCA6D]/20
"

>


<div
  className="
    container-news
    overflow-x-auto
  "
  style={{
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  }}
>

<div
  className="
    flex
    items-center
    gap-8
    h-12
    min-w-max
  "
>


<Link

href="/"

className={`
text-sm
font-semibold
transition

${
pathname === "/"
?
"text-[#ECCA6D]"
:
"text-white/80 hover:text-[#ECCA6D]"
}

`}

>

{
language==="hi"
?
"होम"
:
"HOME"
}

</Link>





{

categories.map((category)=>(


<Link

key={category.id}

href={`/category/${category.slug}`}


className={`
text-sm
font-semibold
transition

${
pathname === `/category/${category.slug}`
?
"text-[#ECCA6D]"
:
"text-white/80 hover:text-[#ECCA6D]"
}

`}

>


{
language==="hi"
?
category.nameHi
:
category.name
}


</Link>


))


}



</div>


</div>


</nav>


);

}