"use client";

import {
  useState
} from "react";

import {
  createCategory
} from "@/services/category.service";



export default function CategoriesPage(){


const [name,setName] = useState("");

const [loading,setLoading] = useState(false);



async function handleCreate(){


if(!name.trim())
return;


try{


setLoading(true);


await createCategory({

name,

slug:name
.toLowerCase()
.replaceAll(" ","-"),

status:"active"

});


alert("Category Created");


setName("");


}
catch(error){

console.error(error);

alert("Error creating category");

}
finally{

setLoading(false);

}


}




return (

<div className="space-y-6">


<h1 className="
text-3xl
font-bold
text-zinc-900
">

Categories

</h1>



<div className="
bg-white
border
rounded-xl
p-6
space-y-4
">


<input

value={name}

onChange={
(e)=>setName(e.target.value)
}

placeholder="Category name"

className="
w-full
border
rounded-lg
p-3
"

/>



<button

onClick={handleCreate}

disabled={loading}

className="
bg-red-600
text-white
px-5
py-3
rounded-lg
"

>

{
loading
?
"Creating..."
:
"Add Category"
}

</button>


</div>



</div>

);

}