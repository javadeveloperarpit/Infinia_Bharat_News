"use client";

import {
useEffect,
useState
} from "react";

import {
useParams,
useRouter
} from "next/navigation";

import {
getArticleById
} from "@/services/article.service";
import { auth } from "@/lib/firebase/firebase";

import {
getCategories
} from "@/services/category.service";

import Editor from "@/components/editor/NewsEditor";


export default function EditArticlePage(){

const router = useRouter();

const params = useParams();

const id = String(params.id);


const [loading,setLoading] = useState(true);

const [saving,setSaving] = useState(false);


const [categories,setCategories] =
useState<any[]>([]);



const [form,setForm] = useState<any>({

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

status:"draft"

});



useEffect(()=>{

if(id){

loadData();

}

},[id]);




async function loadData(){

try{


const article =
await getArticleById(id);


const cats =
await getCategories();



setCategories(cats);



if(article){

setForm({

...article,

author:
article.author ||
{
 uid:"",
 name:"INFINIA BHARAT NEWS",
 email:"",
 role:"admin"
}

});

}



}
catch(error){

console.error(error);

}
finally{

setLoading(false);

}

}




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

name==="priority"

?

Number(value)

:

value


});


}




function handleEditorChange(value:string){


setForm({

...form,

content:value

});


}




async function handleUpdate(){

try{

setSaving(true);


const user = auth.currentUser;


if(!user){

alert("Please login again");

return;

}


const token =
await user.getIdToken();



const res =
await fetch(
`/api/admin/articles/${id}`,
{
method:"PUT",

headers:{
"Content-Type":"application/json",

Authorization:
`Bearer ${token}`
},

body:JSON.stringify(form)

});


const data =
await res.json();


if(!res.ok){

throw new Error(
data.message
);

}


alert(
"Article Updated Successfully"
);


router.push(
"/admin/articles"
);


}
catch(error:any){

console.error(error);

alert(error.message);

}
finally{

setSaving(false);

}

}




if(loading){

return (

<div className="p-10">

Loading Article...

</div>

)

}




return (

<div className="
max-w-5xl
mx-auto
p-6
space-y-5
">


<h1 className="
text-3xl
font-bold
">

Edit Article

</h1>



<input

name="title"

placeholder="Article Title"

value={form.title || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

/>




<select

name="categoryId"

value={form.categoryId || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

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

placeholder="Thumbnail URL"

value={form.thumbnail || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

/>




<textarea

name="shortDescription"

placeholder="Short Description"

value={form.shortDescription || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
h-28
"

/>




<Editor

value={form.content || ""}

onChange={handleEditorChange}

/>




<input

name="seoTitle"

placeholder="SEO Title"

value={form.seoTitle || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

/>




<textarea

name="seoDescription"

placeholder="SEO Description"

value={form.seoDescription || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
h-24
"

/>





<div className="
flex
gap-6
">


<label>

<input

type="checkbox"

name="featured"

checked={form.featured || false}

onChange={handleChange}

/>

 Featured

</label>



<label>

<input

type="checkbox"

name="breaking"

checked={form.breaking || false}

onChange={handleChange}

/>

 Breaking

</label>


</div>





<input

type="number"

name="priority"

value={form.priority || 0}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

placeholder="Priority"

/>





<select

name="status"

value={form.status || "draft"}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

>


<option value="draft">

Draft

</option>


<option value="published">

Published

</option>


</select>





<button

onClick={handleUpdate}

disabled={saving}

className="
bg-red-600
text-white
px-6
py-3
rounded-lg
font-bold
"

>


{

saving

?

"Updating..."

:

"Update Article"

}



</button>



</div>


);


}