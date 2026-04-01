import { headers } from "next/headers";
import { NextRequest } from "next/server";

export const createServerCaller = async () => {
  const { createCaller } = await import("@tk2-pkpl/api/server");
  const { createContext } = await import("@tk2-pkpl/api/context");
  
  const headersList = await headers();
  const nextReq = new NextRequest("http://localhost", {
    headers: headersList,
  });
  const ctx = await createContext(nextReq);
  return createCaller(ctx);
};