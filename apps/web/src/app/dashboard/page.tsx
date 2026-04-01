import { auth } from "@tk2-pkpl/auth";
import { db } from "@tk2-pkpl/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { user } from "@tk2-pkpl/db/schema/auth";

import Dashboard from "./dashboard";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  const sessionWithRole = {
    ...session,
    user: {
      ...session.user,
      role: dbUser?.role ?? "user",
    },
  };

  return <Dashboard session={sessionWithRole} />;
}
