import { getCurrentSession, isAdminRole } from "@/lib/auth";
import prisma from "@/lib/db";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  // If not authenticated, render children without sidebar (e.g. login page)
  if (!session) {
    return <>{children}</>;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.restaurantId },
    select: { name: true, city: true },
  });

  const isAdmin = isAdminRole(session.role);

  return (
    <div className="min-h-screen bg-charcoal-950 text-ivory-100 flex flex-col md:flex-row">
      {/* Responsive Admin Sidebar / Mobile Navigation Header */}
      <AdminSidebar
        restaurantName={restaurant?.name || "Olive & Ember"}
        userName={session.name}
        userEmail={session.email}
        isAdmin={isAdmin}
      />

      {/* Main Admin Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
