"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { Button } from "@tk2-pkpl/ui/components/button";
import { Skeleton } from "@tk2-pkpl/ui/components/skeleton";

import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { CardItem } from "@/components/card-item";

export default function PublicCardsSection() {
  const { data: session } = authClient.useSession();
  const { data: cards = [], isLoading } = useQuery(trpc.card.getAll.queryOptions());

  const recentCards = cards.slice(0, 6);

  return (
    <section className="w-full py-16">
      <div className="container mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            See what others are creating
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Join thousands of students expressing themselves with custom fonts, colors, and designs.
            Create your own card in seconds.
          </p>
        </div>

        <div className="mb-12">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : recentCards.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <p className="text-muted-foreground">
                No public cards yet. Be the first to create one!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentCards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  isOwner={false}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          {session ? (
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Create your card now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Join and start creating
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {session
              ? "Ready to add your own card to the collection?"
              : "Already have an account? Sign in"}
          </p>
        </div>
      </div>
    </section>
  );
}