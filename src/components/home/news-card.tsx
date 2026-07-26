import Link from "next/link";


export default function NewsCard({
article
}:{
article:any
}){


return (

<Link

href={`/news/${article.id}`}

className="
bg-white
rounded-xl
overflow-hidden
border
hover:shadow-lg
transition
"

>


<img

src={article.thumbnail}

className="
w-full
h-48
object-cover
"

/>



<div className="p-4">


<h2 className="
font-bold
text-lg
text-zinc-900
">

{article.title}

</h2>



<p className="
text-sm
text-zinc-500
mt-2
">

{article.shortDescription}

</p>


</div>


</Link>

)


}
