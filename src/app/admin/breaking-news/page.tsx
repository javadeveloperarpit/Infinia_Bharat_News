"use client";


import {
useEffect,
useState
} from "react";


import {
createBreakingNews,
getBreakingNews,
deleteBreakingNews
} from "@/services/breaking.service";




export default function BreakingNewsPage(){


const [news,setNews]=useState<any[]>([]);


const [text,setText]=useState("");



async function load(){

setNews(
await getBreakingNews()
);

}



useEffect(()=>{

load();

},[]);





async function add(){


if(!text)
return;


await createBreakingNews({

text,

active:true,

expiry:"24h"

});


setText("");

load();


}





return (

<div className="space-y-6">


<h1 className="text-3xl font-bold">

Breaking News

</h1>



<div className="bg-white p-6 rounded-xl space-y-4">


<input

value={text}

onChange={(e)=>setText(e.target.value)}

placeholder="Breaking news text"

className="border p-3 w-full"

/>



<button

onClick={add}

className="bg-red-600 text-white px-5 py-3 rounded"

>

Add Breaking News

</button>


</div>





<div className="bg-white rounded-xl">


{
news.map(item=>(


<div

key={item.id}

className="border-b p-4 flex justify-between"

>


<span>

{item.text}

</span>



<button

onClick={async()=>{

await deleteBreakingNews(item.id);

load();

}}

className="text-red-600"

>

Delete

</button>



</div>


))

}



</div>


</div>

);


}