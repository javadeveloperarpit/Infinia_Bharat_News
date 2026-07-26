"use client";


import {
useEffect,
useState
} from "react";


import {
createAd,
getAds,
deleteAd
} from "@/services/ads.service";



export default function AdsPage(){


const [ads,setAds]=useState<any[]>([]);



const [form,setForm]=useState({

title:"",

image:"",

link:"",

position:"homepage_top",

active:true

});




async function loadAds(){

setAds(
await getAds()
);

}



useEffect(()=>{

loadAds();

},[]);






function handleChange(e:any){


const {
name,
value,
type,
checked
}=e.target;


setForm({

...form,

[name]:

type==="checkbox"
?
checked
:
value

});


}







async function saveAd(){


await createAd(form);


alert("Ad Added");


setForm({

title:"",

image:"",

link:"",

position:"homepage_top",

active:true

});


loadAds();


}







async function remove(id:string){


await deleteAd(id);


loadAds();


}





return (

<div className="space-y-6">


<h1 className="text-3xl font-bold text-zinc-900">

Ads Management

</h1>





<div className="
bg-white
rounded-xl
border
p-6
space-y-4
">



<input

name="title"

value={form.title}

onChange={handleChange}

placeholder="Ad Title"

className="w-full border p-3 rounded"

/>




<input

name="image"

value={form.image}

onChange={handleChange}

placeholder="Ad Image URL"

className="w-full border p-3 rounded"

/>




<input

name="link"

value={form.link}

onChange={handleChange}

placeholder="Ad Link"

className="w-full border p-3 rounded"

/>






<select

name="position"

value={form.position}

onChange={handleChange}

className="w-full border p-3 rounded"

>


<option value="homepage_top">

Homepage Top

</option>


<option value="homepage_middle">

Homepage Middle

</option>


<option value="article_between">

Article Between

</option>


<option value="sidebar">

Sidebar

</option>



</select>







<label className="flex gap-2">


<input

type="checkbox"

name="active"

checked={form.active}

onChange={handleChange}

/>


Active Ad


</label>







<button

onClick={saveAd}

className="
bg-red-600
text-white
px-6
py-3
rounded-lg
"

>

Add Advertisement

</button>



</div>







<div className="
bg-white
rounded-xl
border
overflow-hidden
">


<table className="w-full">


<thead className="bg-zinc-100">


<tr>

<th className="p-4 text-left">
Title
</th>


<th className="p-4 text-left">
Position
</th>


<th className="p-4 text-left">
Status
</th>


<th className="p-4">
Action
</th>


</tr>


</thead>




<tbody>


{
ads.map((ad)=>(


<tr

key={ad.id}

className="border-t"

>


<td className="p-4">

{ad.title}

</td>



<td className="p-4">

{ad.position}

</td>




<td className="p-4">

{
ad.active
?
"Active"
:
"Inactive"
}

</td>





<td className="p-4">


<button

onClick={()=>remove(ad.id)}

className="text-red-600"

>

Delete

</button>


</td>



</tr>


))

}



</tbody>


</table>



</div>



</div>

);


}