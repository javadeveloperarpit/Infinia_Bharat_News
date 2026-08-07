"use client";

import {
  FaFacebookF,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";

import {
  Link2
} from "lucide-react";


interface Props {

  title:string;

  url:string;

}



export default function VideoShareButtons({
  title,
  url
}:Props){



function copyLink(){

navigator.clipboard.writeText(url);

alert("Link copied");

}



return (

<div
className="
flex
items-center
gap-3
"
>


{/* Facebook */}

<a

href={
`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

target="_blank"

rel="noopener noreferrer"

className="
w-11
h-11
rounded-full
bg-blue-600
text-white
flex
items-center
justify-center
shadow-lg
hover:scale-110
transition
"

>

<FaFacebookF size={18}/>

</a>





{/* X */}

<a

href={
`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
}

target="_blank"

rel="noopener noreferrer"

className="
w-11
h-11
rounded-full
bg-black
text-white
flex
items-center
justify-center
shadow-lg
hover:scale-110
transition
"

>

<FaXTwitter size={18}/>

</a>





{/* WhatsApp */}

<a

href={
`https://wa.me/?text=${encodeURIComponent(title+" "+url)}`
}

target="_blank"

rel="noopener noreferrer"

className="
w-11
h-11
rounded-full
bg-green-600
text-white
flex
items-center
justify-center
shadow-lg
hover:scale-110
transition
"

>

<FaWhatsapp size={18}/>

</a>





{/* Copy */}

<button

onClick={copyLink}

className="
w-11
h-11
rounded-full
bg-zinc-800
text-white
flex
items-center
justify-center
shadow-lg
hover:scale-110
transition
"

>

<Link2 size={18}/>

</button>



</div>

);

}