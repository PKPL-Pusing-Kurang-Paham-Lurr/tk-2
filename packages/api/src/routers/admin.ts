import { z } from "zod";

import { adminProcedure, protectedProcedure, publicProcedure, router } from "../index";
import { db } from "@tk2-pkpl/db";
import { user } from "@tk2-pkpl/db/schema/auth";
import { siteSettings } from "@tk2-pkpl/db/schema/site-settings";
import { eq } from "drizzle-orm";

const themeOutputSchema = z.object({
  theme: z.enum(["bold-tech", "amber-minimal", "bubblegum", "darkmatter", "notebook"]),
  mode: z.enum(["light", "dark"]),
  themeUpdatedAt: z.date(),
  themeChangedBy: z.string(),
});

type ThemeData = z.infer<typeof themeOutputSchema>;

export const adminRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const result = await db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
    });
    return {
      id: result?.id ?? "",
      name: result?.name ?? null,
      email: result?.email ?? "",
      role: result?.role ?? "user",
    };
  }),

  listUsers: adminProcedure.query(async () => {
    return await db.query.user.findMany();
  }),

  getUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const result = await db.query.user.findFirst({
        where: eq(user.id, input.id),
      });
      return result ?? null;
    }),

  setUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "admin"]),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(user)
        .set({ role: input.role })
        .where(eq(user.id, input.userId));
      return { success: true };
    }),

  getTheme: publicProcedure.query(async (): Promise<ThemeData> => {
    const result = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, "global"),
    });
    if (!result) {
      await db.insert(siteSettings).values({ id: "global" });
      return { theme: "bold-tech", mode: "light", themeUpdatedAt: new Date(), themeChangedBy: "System" };
    }
    return { 
      theme: result.theme as ThemeData["theme"], 
      mode: result.mode as ThemeData["mode"], 
      themeUpdatedAt: result.themeUpdatedAt,
      themeChangedBy: result.themeChangedBy ?? "System",
    };
  }),

  setTheme: adminProcedure
    .input(z.object({
      theme: z.enum(["bold-tech", "amber-minimal", "bubblegum", "darkmatter", "notebook"]),
      mode: z.enum(["light", "dark"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminUser = await db.query.user.findFirst({
        where: eq(user.id, ctx.session.user.id),
      });
      const adminName = adminUser?.name ?? adminUser?.email ?? "Admin";
      await db
        .update(siteSettings)
        .set({
          theme: input.theme,
          mode: input.mode,
          themeUpdatedAt: new Date(),
          themeChangedBy: adminName,
        })
        .where(eq(siteSettings.id, "global"));
      return { success: true, themeChangedBy: adminName };
    }),
});
