import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@tk2-pkpl/ui/components/button";

import { createServerCaller } from "@/utils/server-caller";
import { CardItem } from "@/components/card-item";

async function getCards() {
  const caller = await createServerCaller();
  return caller.card.getAll();
}

export default async function PublicCardsSection() {
  const cards = await getCards();

  const recentCards = cards.slice(0, 6);

  return (
    <section className="w-full py-16">
      <div className="container mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            See what others have created.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Join thousands of students expressing themselves with custom fonts, colors, and designs.
            Create your own card in seconds.
          </p>
        </div>

        <div className="mb-12">
          {recentCards.length === 0 ? (
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
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Join and start creating
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Already have an account? Sign in
          </p>
        </div>
      </div>
    </section>
  );
}