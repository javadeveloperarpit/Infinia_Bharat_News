interface StatCardProps {

title:string;

value:string;

description:string;

}


export default function StatCard({

title,

value,

description

}:StatCardProps){


return (

<div
className="
bg-white
rounded-xl
p-5
shadow-sm
border
"
>


<p
className="
text-sm
text-zinc-500
"
>
{title}
</p>



<h2
className="
text-3xl
font-bold
mt-2
text-zinc-900
"
>
{value}
</h2>



<p
className="
text-xs
text-zinc-500
mt-2
"
>
{description}
</p>



</div>

);


}