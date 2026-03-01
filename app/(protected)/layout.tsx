// app/(protected)/layout.tsx

import DashboardNav from "./DashboardNav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full">
      <DashboardNav />
      {children}
    </div>
  );
}
