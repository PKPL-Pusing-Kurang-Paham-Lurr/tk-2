import { t } from "./index";
import { appRouter } from "./routers/index";

export const createCaller = t.createCallerFactory(appRouter);
export type { AppRouter } from "./routers/index";
