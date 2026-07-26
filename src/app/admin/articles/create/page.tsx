"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useRouter
} from "next/navigation";


import {
  createArticle
} from "@/services/article.service";


import {
  getCategories
} from "@/services/category.service";



export default function CreateArticlePage(){


const router = useRouter();


const [loading,setLoading] = useState(false);


const [categories,setCategories] = useState<any[]>([]);



const [form,setForm] = useState({

title:"",

categoryId:"",

thumbnail:"",

shortDescription:"",

content:"",

seoTitle:"",

seoDescription:"",

featured:false,

breaking:false,

priority:0,

status:"draft" as "draft"|"published"


});




useEffect(()=>{


async function load(){

const data =
await getCategories();

setCategories(data);

}

load();


},[]);





function handleChange(e:any){


const {name,value,type,checked}=e.target;



setForm({

...form,


[name]:
type==="checkbox"
?
checked
:
name==="priority"
?
Number(value)
:
value


});


}







async function handleSubmit(){


try{


setLoading(true);


await createArticle(form as any);


alert("Article Created");


router.push(
"/admin/articles"
);


}
catch(error){

console.error(error);

alert("Failed");

}
finally{

setLoading(false);

}


}







return (

<div className="space-y-6">


<h1 className="text-3xl font-bold text-zinc-900">

Create Article

</h1>



<div className="
bg-white
border
rounded-xl
p-6
space-y-5
">



<input

name="title"

placeholder="Article Title"

value={form.title}

onChange={handleChange}

className="w-full border p-3 rounded-lg"

/>





<select

name="categoryId"

value={form.categoryId}

onChange={handleChange}

className="w-full border p-3 rounded-lg"

>


<option value="">

Select Category

</option>


{
categories.map((cat)=>(

<option

key={cat.id}

value={cat.id}

>

{cat.name}

</option>


))
}


</select>







<input

name="thumbnail"

placeholder="Blogger Image URL"

value={form.thumbnail}

onChange={handleChange}

className="w-full border p-3 rounded-lg"

/>







<textarea

name="shortDescription"

placeholder="Short Description"

value={form.shortDescription}

onChange={handleChange}

rows={3}

className="w-full border p-3 rounded-lg"

/>






<textarea

name="content"

placeholder="Full Article Content"

value={form.content}

onChange={handleChange}

rows={8}

className="w-full border p-3 rounded-lg"

/>







<div className="flex gap-6">


<label>

<input

type="checkbox"

name="featured"

checked={form.featured}

onChange={handleChange}

/>

 Featured News

</label>




<label>

<input

type="checkbox"

name="breaking"

checked={form.breaking}

onChange={handleChange}

/>

 Breaking News

</label>


</div>







<input

type="number"

name="priority"

value={form.priority}

onChange={handleChange}

placeholder="Priority"

className="w-full border p-3 rounded-lg"

/>







<input

name="seoTitle"

placeholder="SEO Title"

value={form.seoTitle}

onChange={handleChange}

className="w-full border p-3 rounded-lg"

/>






<textarea

name="seoDescription"

placeholder="SEO Description"

value={form.seoDescription}

onChange={handleChange}

rows={3}

className="w-full border p-3 rounded-lg"

/>







<select

name="status"

value={form.status}

onChange={handleChange}

className="w-full border p-3 rounded-lg"

>


<option value="draft">

Draft

</option>


<option value="published">

Published

</option>


</select>







<button

disabled={loading}

onClick={handleSubmit}

className="
bg-red-600
text-white
px-6
py-3
rounded-lg
font-semibold
"

>

{
loading
?
"Saving..."
:
"Publish Article"
}


</button>



</div>


</div>

);


}