import {
  Radio,
  Tv
} from "lucide-react";


export default function LiveTvPage(){


return (

<main

className="
min-h-[calc(100vh-85px)]
bg-black
flex
items-center
justify-center
px-5
"

>


<div

className="
text-center
max-w-xl
"

>


{/* TV ICON */}


<div

className="
relative
mx-auto
w-40
h-28
rounded-3xl
border-4
border-[#ECCA6D]
bg-zinc-900
flex
items-center
justify-center
shadow-[0_0_50px_rgba(236,202,109,0.4)]
"

>


<div

className="
absolute
top-3
right-3
flex
items-center
gap-2
"

>

<span

className="
w-3
h-3
rounded-full
bg-red-600
animate-ping
"

/>

<span

className="
w-3
h-3
rounded-full
bg-red-600
absolute
"

/>


</div>



<Tv

size={65}

className="
text-[#ECCA6D]
animate-pulse
"

/>



</div>






{/* LIVE TEXT */}


<div

className="
mt-8
flex
items-center
justify-center
gap-2
text-red-500
font-black
tracking-widest
"

>


<Radio

size={22}

className="
animate-pulse
"

/>


LIVE TV


</div>





<h1

className="
mt-5
text-4xl
md:text-6xl
font-black
text-white
"

>

INFINIA BHARAT NEWS

</h1>



<h2

className="
mt-3
text-2xl
font-bold
text-[#ECCA6D]
"

>

LIVE TV

</h2>




<p

className="
mt-6
text-zinc-400
text-lg
"

>

Our live news channel is coming soon.
Stay tuned for 24×7 breaking news,
updates and exclusive coverage.

</p>





<div

className="
mt-8
inline-flex
items-center
gap-3
px-8
py-4
rounded-full
bg-red-600/10
border
border-red-600/40
text-red-500
font-bold
"

>


<span

className="
w-3
h-3
rounded-full
bg-red-500
animate-ping
"

/>


Launching Soon


</div>



</div>


</main>

);

}