"use client";

import {
useEffect,
useState
} from "react";

import {
useRouter
} from "next/navigation";


import {
createVideo
} from "@/services/video.service";


import {
getCategories
} from "@/services/category.service";



export default function CreateVideo(){


const router=useRouter();


const [categories,setCategories]=useState<any[]>([]);


const [form,setForm]=useState({

title:"",

youtubeUrl:"",

categoryId:"",

description:"",

status:"draft"

});



useEffect(()=>{

getCategories()
.then(setCategories)

},[]);





function change(e:any){

setForm({

...form,

[e.target.name]:e.target.value

});

}




async function save(){


await createVideo(
form as any
);


alert("Video Added");


router.push(
"/admin/videos"
);


}





return (

<div className="space-y-5">


<h1 className="text-3xl font-bold">

Create Video

</h1>



<div className="bg-white p-6 rounded-xl space-y-4">



<input
name="title"
placeholder="Video Title"
onChange={change}
className="border p-3 w-full"
/>



<input

name="youtubeUrl"

placeholder="https://www.youtube.com/watch?v=..."

onChange={change}

className="border p-3 w-full"

/>




<select

name="categoryId"

onChange={change}

className="border p-3 w-full"

>


<option>

Select Category

</option>


{
categories.map(c=>(

<option
key={c.id}
value={c.id}
>

{c.name}

</option>

))

}


</select>



<textarea

name="description"

placeholder="Description"

onChange={change}

className="border p-3 w-full"

/>




<select

name="status"

onChange={change}

className="border p-3 w-full"

>

<option value="draft">
Draft
</option>


<option value="published">
Published
</option>

</select>





<button

onClick={save}

className="bg-red-600 text-white px-6 py-3 rounded"

>

Save Video

</button>



</div>


</div>

);


}