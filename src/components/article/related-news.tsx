import Image from "next/image";


interface Props{

articles:any[];

}



export default function RelatedNews({

articles

}:Props){



return (

<section className="
mt-16
">


<h2 className="
text-3xl
font-black
mb-8
border-l-4
border-red-600
pl-4
">

Related News

</h2>




<div className="
grid
grid-cols-1
md:grid-cols-3
gap-6
">


{

articles.map((item)=>(


<div

key={item.id}

className="
rounded-2xl
overflow-hidden
border
bg-white
hover:shadow-lg
transition
"


>


<div className="
relative
h-48
">


<Image

src={item.thumbnail}

alt={item.title}

fill

className="
object-cover
"

/>


</div>



<div className="
p-5
">


<h3 className="
font-black
leading-snug
line-clamp-3
">

{item.title}

</h3>


</div>



</div>


))

}



</div>


</section>

);

}