import { protectedProcedure, publicProcedure, router } from "../index";
import { todoRouter } from "./todo";
import { cardRouter } from "./card";
import { adminRouter } from "./admin";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  todo: todoRouter,
  card: cardRouter,
  admin: adminRouter,
});
export type AppRouter = typeof appRouter;
