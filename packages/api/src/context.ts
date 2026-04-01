import { auth } from "@tk2-pkpl/auth";
import { db } from "@tk2-pkpl/db";
import { eq } from "drizzle-orm";
import { user } from "@tk2-pkpl/db/schema/auth";

export async function createContext(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (session?.user) {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });
    if (dbUser) {
      return {
        auth: null,
        session: {
          ...session,
          user: {
            ...session.user,
            role: dbUser.role,
          },
        },
      };
    }
  }

  return {
    auth: null,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
