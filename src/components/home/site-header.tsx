"use client";

import Link from "next/link";


export default function SiteHeader(){


return (

<header className="
bg-black
text-white
border-b
border-zinc-800
">


<div className="
max-w-7xl
mx-auto
px-6
py-4
flex
items-center
justify-between
">


{/* Logo */}

<Link
href="/"
className="
text-2xl
font-extrabold
tracking-wide
"
>

<span className="text-red-600">
INFINIA
</span>

<span className="text-white">
 BHARAT
</span>

<span className="text-yellow-400">
 NEWS
</span>


</Link>





<div className="
flex
items-center
gap-5
text-sm
">


<Link href="/live-tv">

LIVE TV

</Link>


<button>

Search

</button>



<Link href="/login">

Login

</Link>



</div>


</div>


</header>

);


}