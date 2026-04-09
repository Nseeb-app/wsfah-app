import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== "SUPERADMIN") redirect("/");

  return (
    <div className="flex min-h-screen dark" style={{ backgroundColor: "#0f1714", colorScheme: "dark" }}>
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8" style={{ color: "#F2E8DF" }}>{children}</main>
    </div>
  );
}
