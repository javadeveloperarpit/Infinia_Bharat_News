import Image from "next/image";


interface Props{

article:any;

}



export default function ArticleHeader({

article

}:Props){



function formatDate(date:string){

if(!date) return "";


const d = new Date(date);


if(isNaN(d.getTime())){
return "";
}


return d.toLocaleDateString(
"hi-IN",
{
day:"numeric",
month:"long",
year:"numeric"
}
);

}


function readingTime(content:string){

if(!content) return 1;

const words =
content
.replace(/<[^>]*>/g," ")
.split(/\s+/)
.length;


return Math.ceil(words / 200);

}



return (

<header className="mb-10">



{/* CATEGORY */}

<div className="
flex
items-center
gap-3
mb-5
">


{article.breaking && (

<span className="
bg-black
text-white
px-4
py-1.5
rounded-md
text-xs
font-bold
">

Breaking 

</span>

)}



</div>




{/* TITLE */}


<h1 className="
text-3xl
md:text-5xl
xl:text-6xl
font-black
leading-[1.1]
tracking-tight
text-zinc-900
">

{article.title}

</h1>





{/* SHORT DESCRIPTION */}

{

article.shortDescription &&

<p className="
mt-5
text-lg
md:text-xl
text-zinc-600
leading-relaxed
max-w-4xl
">

{article.shortDescription}

</p>

}





{/* META */}


<div className="
flex
flex-wrap
items-center
gap-4
mt-6
text-sm
text-zinc-500
border-b
pb-6
">


<span className="flex items-center gap-2">

✍️

<strong className="
text-zinc-800
">

{
article.author?.name || "INFINIA BHARAT NEWS"
}

</strong>

</span>



<span>
•
</span>



<span>

📅

{" "}

{

formatDate(
article.createdAt
)

}

</span>




<span>
•
</span>



<span>

⏱️

{" "}

{

readingTime(
article.content
)

}

min read

</span>


</div>






{/* HERO IMAGE */}


<div className="
relative
w-full
aspect-[16/9]
mt-8
rounded-2xl
overflow-hidden
shadow-xl
bg-zinc-100
">


<Image

src={article.thumbnail}

alt={article.title}

fill

priority

sizes="
100vw
"

className="
object-cover
"

/>


</div>



</header>

);


}