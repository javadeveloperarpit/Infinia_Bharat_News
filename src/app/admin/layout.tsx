import AdminGuard from "@/components/common/admin-guard";

import AdminSidebar from "@/features/admin/components/admin-sidebar";
import AdminHeader from "@/features/admin/components/admin-header";


export default function AdminLayout({
children
}:{
children:React.ReactNode
}){


return (

<AdminGuard>

<div className="flex min-h-screen">


<AdminSidebar/>


<div className="flex-1">


<AdminHeader/>


<main className="p-6 bg-zinc-100 min-h-screen">

{children}

</main>


</div>


</div>


</AdminGuard>

);

}