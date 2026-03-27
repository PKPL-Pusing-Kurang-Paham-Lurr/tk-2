"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@tk2-pkpl/ui/components/button";
import Loader from "@/components/loader";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard");
    }
  }, [isPending, session, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      toast.error("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md p-6 text-center">
        <h1 className="mb-2 text-4xl font-bold">TK2-PKPL</h1>
        <p className="mb-8 text-muted-foreground">Sign in to continue</p>
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Redirecting..." : "Sign in with Google"}
        </Button>
      </div>
    </div>
  );
}
