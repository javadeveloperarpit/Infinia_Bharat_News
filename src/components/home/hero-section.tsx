import Link from "next/link";


export default function HeroSection({

featured

}:{

featured:any[]

}){


if(!featured || featured.length===0){

return null;

}



const main =
featured[0];



const side =
featured.slice(1,5);





return (

<section className="
max-w-7xl
mx-auto
px-6
py-8
">


<div className="
grid
grid-cols-1
lg:grid-cols-3
gap-5
">



{/* MAIN NEWS */}

<Link

href={`/news/${main.id}`}

className="
lg:col-span-2
bg-white
rounded-xl
overflow-hidden
border
"

>


<img

src={main.thumbnail}

className="
w-full
h-[420px]
object-cover
"

/>



<div className="
p-5
">


<h1 className="
text-3xl
font-bold
text-zinc-900
">

{main.title}

</h1>



<p className="
mt-3
text-zinc-500
">

{main.shortDescription}

</p>


</div>


</Link>







{/* SIDE NEWS */}


<div className="
space-y-5
">


{

side.map(
(item)=>(


<Link

key={item.id}

href={`/news/${item.id}`}

className="
flex
gap-3
bg-white
border
rounded-xl
p-3
"

>


<img

src={item.thumbnail}

className="
w-32
h-24
object-cover
rounded-lg
"

/>



<div>

<h2 className="
font-bold
text-sm
text-zinc-900
">

{item.title}

</h2>


</div>



</Link>


))

}



</div>



</div>



</section>

);

}