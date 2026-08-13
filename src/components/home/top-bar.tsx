"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useLanguageStore
} from "@/store/language-store";


import {
  MapPin,
  Radio
} from "lucide-react";


import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaXTwitter
} from "react-icons/fa6";



export default function TopBar(){


const [date,setDate] = useState("");

const [location,setLocation] = useState("India");


const {
  language,
  setLanguage
} = useLanguageStore();



const texts = [

"देश की हर बड़ी खबर सबसे पहले",

"सच के साथ, सबसे आगे",

"भारत की आवाज़, INFINIA के साथ"

];



const [typing,setTyping] = useState("");

const [index,setIndex] = useState(0);

const [char,setChar] = useState(0);





/* DATE */

useEffect(()=>{


const updateDate = ()=>{


const now = new Date();


setDate(

now.toLocaleDateString(

"en-IN",

{
day:"numeric",
month:"short",
year:"numeric"
}

)

);


};



updateDate();


const timer = setInterval(
updateDate,
60000
);



return ()=>clearInterval(timer);


},[]);







/* LOCATION */

useEffect(()=>{


if(!navigator.geolocation){

setLocation("India");

return;

}



navigator.geolocation.getCurrentPosition(


async(position)=>{


try{


const {

latitude,

longitude

}=position.coords;



const response = await fetch(

`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`

);



const data =
await response.json();



const address =
data.address || {};



const city =

address.city ||

address.town ||

address.village ||

address.municipality ||

"";



const state =

address.state ||

"";



if(city && state){


setLocation(
`${city}, ${state}`
);


}

else{


setLocation("India");


}


}

catch(error){


console.error(
"Location Error",
error
);


setLocation("India");


}



},



()=>{

setLocation("India");

},



{

enableHighAccuracy:false,

timeout:5000,

maximumAge:600000

}



);


},[]);







/* TYPE WRITER */

useEffect(()=>{


const text =
texts[index];



if(char < text.length){



const timer = setTimeout(()=>{


setTyping(
prev=>prev + text[char]
);



setChar(
prev=>prev+1
);



},120);



return ()=>clearTimeout(timer);


}

else{


const timer = setTimeout(()=>{


setTyping("");

setChar(0);


setIndex(
prev=>
(prev+1)%texts.length
);



},2500);



return ()=>clearTimeout(timer);


}



},[char,index]);







return (

<div

className="
w-full
bg-[#090909]
border-b
border-[#ECCA6D]/20
"

>


<div

className="
container-news
min-h-10
flex
flex-wrap
items-center
justify-between
gap-2
py-2
"

>





{/* LEFT */}

<div

className="
flex
items-center
gap-2
text-[11px]
sm:text-xs
text-white/70
"

>


<div

className="
flex
items-center
gap-2
max-w-[120px]
sm:max-w-none
"

>


<MapPin

size={14}

className="
text-[#ECCA6D]
shrink-0
"

/>


<span className="
truncate
">

{location}

</span>


</div>



<span className="
text-white/30
hidden
sm:block
">

|

</span>



<span>

{date}

</span>


</div>









{/* CENTER */}

<div

className="
hidden
lg:flex
items-center
text-xs
font-semibold
tracking-wide
text-[#ECCA6D]
"

>


<span>

{typing}

<span className="
animate-pulse
">

|

</span>


</span>


</div>



{/* RIGHT */}

<div

className="
flex
items-center
gap-2
"

>


{/* LANGUAGE SWITCH */}

<button

onClick={()=>{

setLanguage(
language==="hi"
?
"en"
:
"hi"
);

}}

className="
text-xs
font-semibold
text-[#ECCA6D]
border
border-[#ECCA6D]/30
px-3
py-1
rounded-full
hover:bg-[#ECCA6D]
hover:text-black
transition
"

>

{
language==="hi"
?
"English"
:
"हिंदी"
}

</button>






<div

className="
h-4
w-px
bg-white/20
hidden
md:block
"

/>





{/* SOCIAL */}

<a

className="
text-white/60
hover:text-[#ECCA6D]
transition
"
href="https://www.facebook.com/share/1jBhdb8phJ/"
>

<FaFacebookF size={18}/>

</a>





<a

className="
text-white/60
hover:text-[#ECCA6D]
transition
"
href="https://twitter.com/"
>

<FaXTwitter size={18}/>

</a>





<a

className="
text-white/60
hover:text-[#ECCA6D]
transition
"
href="https://www.youtube.com/@Infinia_Bharat_News"
>

<FaYoutube size={18}/>

</a>





<a

className="
text-white/60
hover:text-[#ECCA6D]
transition
"
href="https://www.instagram.com/infiniabharatnews?igsh=eHptM29kbGV3ZXlw"
>

<FaInstagram size={18}/>

</a>




</div>





</div>


</div>


);

}