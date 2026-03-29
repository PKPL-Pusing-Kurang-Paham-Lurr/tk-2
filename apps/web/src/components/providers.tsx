"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@tk2-pkpl/ui/components/sonner";

import { queryClient } from "@/utils/trpc";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
      <Toaster richColors />
    </QueryClientProvider>
  );
}
