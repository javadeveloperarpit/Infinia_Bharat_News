import Image from "next/image";
import Link from "next/link";

import {
  FaInstagram,
  FaYoutube,
  FaFacebookF
} from "react-icons/fa6";

import {
  getCategories
} from "@/services/category.service";


export default async function Footer(){


const categories =
await getCategories();



return (

<footer

className="
bg-[#090909]
border-t
border-[#ECCA6D]/20
text-white
"
>


<div

className="
container-news
py-12
"

>


<div

className="
grid
grid-cols-1
md:grid-cols-2
lg:grid-cols-4
gap-10
"

>



{/* BRAND */}

<div>


<Image

src="/logo.webp"

alt="INFINIA Bharat News"

width={220}

height={70}

className="
w-[200px]
mb-5
"

/>



<p

className="
text-zinc-400
text-sm
leading-6
"

>

INFINIA BHARAT NEWS delivers breaking news,
India news, world news, politics, technology,
entertainment and latest updates.

</p>


</div>





{/* QUICK LINKS */}


<div>


<h3

className="
text-lg
font-black
mb-5
text-[#ECCA6D]
"

>

Quick Links

</h3>



<div

className="
flex
flex-col
gap-3
text-sm
text-zinc-400
"

>


<Link
href="/"
className="hover:text-white transition"
>

Home

</Link>



<Link
href="/latest"
className="hover:text-white transition"
>

Latest News

</Link>



<Link
href="/video"
className="hover:text-white transition"
>

Videos

</Link>



<Link
href="/live-tv"
className="hover:text-white transition"
>

Live TV

</Link>


</div>


</div>






{/* CATEGORIES */}



<div>


<h3

className="
text-lg
font-black
mb-5
text-[#ECCA6D]
"

>

Categories

</h3>



<div

className="
flex
flex-col
gap-3
text-sm
text-zinc-400
"

>


{
categories.map((category:any)=>(
<Link

key={category.id}

href={`/category/${category.slug}`}

className="
hover:text-white
transition
"

>

{category.name}

</Link>
))
}



</div>


</div>








{/* SOCIAL */}



<div>


<h3

className="
text-lg
font-black
mb-5
text-[#ECCA6D]
"

>

Follow Us

</h3>




<div

className="
flex
gap-4
"

>



<a

href="https://www.instagram.com/infiniabharatnews"

target="_blank"

rel="noopener noreferrer"

className="
w-11
h-11
rounded-full
bg-white/5
border
border-white/10
flex
items-center
justify-center
hover:border-pink-500
hover:text-pink-500
transition
"

>

<FaInstagram size={20}/>

</a>






<a

href="https://www.youtube.com/@Infinia_Bharat_News"

target="_blank"

rel="noopener noreferrer"

className="
w-11
h-11
rounded-full
bg-white/5
border
border-white/10
flex
items-center
justify-center
hover:border-red-500
hover:text-red-500
transition
"

>

<FaYoutube size={20}/>

</a>







<a

href="https://www.facebook.com/share/1jBhdb8phJ/"

target="_blank"

rel="noopener noreferrer"

className="
w-11
h-11
rounded-full
bg-white/5
border
border-white/10
flex
items-center
justify-center
hover:border-blue-500
hover:text-blue-500
transition
"

>

<FaFacebookF size={20}/>

</a>




</div>


</div>



</div>





{/* BOTTOM */}



<div

className="
mt-10
pt-6
border-t
border-white/10
text-center
text-sm
text-zinc-500
"

>


© {new Date().getFullYear()} INFINIA BHARAT NEWS. All Rights Reserved.


</div>



</div>



</footer>


);

}