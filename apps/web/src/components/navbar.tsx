"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MenuIcon, XIcon } from "lucide-react";

import { Button } from "@tk2-pkpl/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tk2-pkpl/ui/components/dropdown-menu";
import { Skeleton } from "@tk2-pkpl/ui/components/skeleton";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const { data: currentUser } = useQuery({
    ...trpc.admin.me.queryOptions(),
    enabled: !!session?.user.id,
  });

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const baseLinks = [
    { to: "/" as const, label: "Home" },
  ];

  const navLinks = session
    ? [...baseLinks, { to: "/dashboard" as const, label: "Dashboard" }]
    : baseLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground hover:text-primary">
          TK2 PKPL
        </Link>

        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {isPending ? (
            <Skeleton className="h-9 w-20" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                {session.user.name?.[0] ?? session.user.email?.[0] ?? "U"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                <div className="flex flex-col gap-1 px-2 py-1.5">
                  <span className="text-xs font-medium truncate">{session.user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{session.user.email}</span>
                  {currentUser?.role === "admin" && (
                    <span className="text-xs font-medium text-primary">admin</span>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          )}

          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-none md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <XIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex flex-col gap-2">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  href={to}
                  className="block rounded-none px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}