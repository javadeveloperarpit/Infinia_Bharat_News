import { AuthProvider } from "@/features/auth/auth.context";
import AdminGuard from "@/components/common/admin-guard";
import AdminShell from "@/features/admin/components/admin-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminGuard>
        <AdminShell>
          {children}
        </AdminShell>
      </AdminGuard>
    </AuthProvider>
  );
}