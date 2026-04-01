import { auth } from "@tk2-pkpl/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createCaller } from "@tk2-pkpl/api/server";
import { createContext } from "@tk2-pkpl/api/context";

import Dashboard from "./dashboard";

export default async function DashboardPage() {
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost";
  const protocol = hdrs.get("x-forwarded-proto") ?? "http";
  const ctx = await createContext(new Request(`${protocol}://${host}`, { headers: hdrs }));
  const caller = createCaller(ctx);

  const session = await auth.api.getSession({ headers: hdrs });

  if (!session?.user) {
    redirect("/login");
  }

  const adminUser = await caller.admin.me();

  const sessionWithRole = {
    ...session,
    user: {
      ...session.user,
      role: adminUser.role,
    },
  };

  return <Dashboard session={sessionWithRole} />;
}
