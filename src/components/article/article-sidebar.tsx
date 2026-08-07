import {
TrendingUp
} from "lucide-react";


export default function ArticleSidebar({
related=[]
}:{
related:any[]
}){


return (

<aside className="
bg-white
rounded-2xl
border
p-5
">


<h2 className="
flex
items-center
gap-2
font-black
text-xl
mb-5
">

<TrendingUp
className="text-red-600"
/>

Trending News

</h2>



<div className="
space-y-4
">


{
related.slice(0,5).map((item:any)=>(


<div
key={item.id}
className="
border-b
pb-3
"
>


<h3 className="
font-bold
text-sm
line-clamp-2
">

{item.title}

</h3>


</div>


))
}


</div>


</aside>

)

}