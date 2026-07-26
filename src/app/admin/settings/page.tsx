import Link from "next/link";


export default function SettingsPage(){

return (

<div className="space-y-5">


<h1 className="text-3xl font-bold">
Settings
</h1>


<div className="bg-white p-5 rounded-xl border">

<p className="text-zinc-600 mb-4">
Manage website settings
</p>


<Link
href="/admin/settings/categories"
className="
bg-red-600
text-white
px-5
py-3
rounded-lg
inline-block
"
>

Manage Categories

</Link>


</div>


</div>

);

}