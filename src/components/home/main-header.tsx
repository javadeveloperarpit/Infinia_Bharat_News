"use client";

import {
  useState
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Search,
  X,
  Radio
} from "lucide-react";



export default function MainHeader(){


const [searchOpen,setSearchOpen] =
useState(false);


const [query,setQuery] =
useState("");



function handleSearch(e:any){

if(e.key==="Enter" && query.trim()){

window.location.href =
`/search?q=${encodeURIComponent(query)}`;

}


if(e.key==="Escape"){

setSearchOpen(false);

}

}



return (

<>

<header

className="
sticky
top-0
z-50
w-full
bg-[#090909]/95
backdrop-blur-xl
border-b
border-[#ECCA6D]/20
"

>


<div
className="
container-news
"
>


<div

className="
h-[85px]
flex
items-center
justify-between
gap-5
"

>


{/* LOGO */}


<Link

href="/"

className="
shrink-0
"

>


<Image

src="/logo.png"

alt="INFINIA Bharat News"

width={220}

height={70}

priority

className="
w-[150px]
sm:w-[180px]
lg:w-[220px]
h-auto
object-contain
"

/>


</Link>





{/* SPACE */}

<div
className="
flex-1
"
/>





{/* ACTIONS */}


<div

className="
flex
items-center
gap-3
"

>





{/* SEARCH */}


<button


onClick={()=>setSearchOpen(true)}


className="
flex
items-center
justify-center
gap-2
h-10
w-10
sm:w-auto
sm:px-4
rounded-xl
bg-white/[0.04]
border
border-white/15
text-white/70
hover:border-[#ECCA6D]
hover:text-[#ECCA6D]
transition-all
duration-300
"

>


<Search size={18}/>


<span

className="
hidden
sm:block
text-sm
font-medium
"

>

Search

</span>


</button>






{/* LIVE TV */}


<Link

href="/live-tv"


className="
relative
overflow-hidden
flex
items-center
gap-2
h-10
px-3
sm:px-5
rounded-xl
bg-black
border
border-red-600/50
text-white
font-semibold
text-xs
sm:text-sm
hover:border-[#ECCA6D]
transition-all
duration-300
group
"

>



<span

className="
absolute
inset-0
bg-red-600/10
opacity-0
group-hover:opacity-100
transition
"

/>




<span

className="
relative
flex
h-2.5
w-2.5
"

>


<span

className="
absolute
h-full
w-full
rounded-full
bg-red-500
animate-ping
opacity-75
"

/>


<span

className="
relative
h-2.5
w-2.5
rounded-full
bg-red-500
"

/>


</span>





<Radio

size={15}

className="
text-[#ECCA6D]
"

/>



LIVE TV


</Link>



</div>


</div>


</div>


</header>





{/* SEARCH OVERLAY */}


{

searchOpen && (


<div

className="
fixed
inset-0
z-[100]
bg-black/80
backdrop-blur-xl
flex
items-start
justify-center
pt-28
px-5
"

>


<div

className="
w-full
max-w-2xl
bg-[#111]
border
border-[#ECCA6D]/30
rounded-2xl
p-5
shadow-2xl
"

>


<div

className="
flex
items-center
gap-4
"

>


<Search

size={22}

className="
text-[#ECCA6D]
"

/>



<input


autoFocus


value={query}


onChange={
(e)=>setQuery(e.target.value)
}


onKeyDown={handleSearch}


placeholder="Search latest news..."


className="
flex-1
bg-transparent
outline-none
text-white
text-lg
placeholder:text-zinc-500
"

/>



<button

onClick={
()=>setSearchOpen(false)
}

>


<X

size={22}

className="
text-white
"

/>


</button>



</div>


</div>


</div>


)

}


</>

);

}