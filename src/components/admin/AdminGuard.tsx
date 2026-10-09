import type { ReactNode } from "react";
import { useAdminAuth } from "@/components/ClientProviders";
import { AdminLoginView } from "@/views/AdminLoginView";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user } = useAdminAuth();

  if (!user) {
    return <AdminLoginView />;
  }

  return <>{children}</>;
}
