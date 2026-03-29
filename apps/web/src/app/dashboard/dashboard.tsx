"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@tk2-pkpl/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@tk2-pkpl/ui/components/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tk2-pkpl/ui/components/tabs";

import Footer from "@/components/footer";
import { CardForm } from "@/components/card-form";
import { CardItem } from "@/components/card-item";
import { trpc } from "@/utils/trpc";

interface SessionUser {
  id: string;
  name: string | null;
  email: string;
}

interface DashboardProps {
  session: {
    user: SessionUser;
  };
}

export default function Dashboard({ session }: DashboardProps) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<{
    id: number;
    title: string;
    description: string;
    customFont: string;
    customColor: string;
    fontColor: string;
  } | null>(null);
  const [deleteCardId, setDeleteCardId] = useState<number | null>(null);

  const { data: myCards = [], isLoading: myLoading } = useQuery(trpc.card.getMy.queryOptions());
  const { data: publicCards = [], isLoading: publicLoading } = useQuery(trpc.card.getAll.queryOptions());

  const createMutation = useMutation(trpc.card.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.card.getMy.queryOptions());
      queryClient.invalidateQueries(trpc.card.getAll.queryOptions());
      setFormOpen(false);
    },
  }));

  const updateMutation = useMutation(trpc.card.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.card.getMy.queryOptions());
      queryClient.invalidateQueries(trpc.card.getAll.queryOptions());
      setEditingCard(null);
    },
  }));

  const deleteMutation = useMutation(trpc.card.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.card.getMy.queryOptions());
      queryClient.invalidateQueries(trpc.card.getAll.queryOptions());
    },
  }));

  const handleCreate = (data: {
    title: string;
    description: string;
    customFont: string;
    customColor: string;
    fontColor: string;
  }) => {
    createMutation.mutate(data);
  };

  const handleEdit = (card: typeof editingCard) => {
    if (card) {
      setEditingCard(card);
    }
  };

  const handleUpdate = (data: {
    title: string;
    description: string;
    customFont: string;
    customColor: string;
    fontColor: string;
  }) => {
    if (editingCard) {
      updateMutation.mutate({ id: editingCard.id, ...data });
    }
  };

  const handleDelete = (id: number) => {
    setDeleteCardId(id);
  };

  return (
    <div className="flex min-h-[100vh] flex-col bg-background pt-14">
      <div className="flex flex-1 flex-col">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome, {session.user.name}</p>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Card
            </Button>
          </div>

          <Tabs defaultValue="my" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="my">My Cards</TabsTrigger>
              <TabsTrigger value="public">Public Cards</TabsTrigger>
            </TabsList>

            <TabsContent value="my">
              {myLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : myCards.length === 0 ? (
                <div className="rounded-lg border border-dashed p-12 text-center">
                  <p className="text-muted-foreground">You haven&apos;t created any cards yet.</p>
                  <Button className="mt-4" onClick={() => setFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Card
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:max-w-4xl mx-auto w-full">
                  {myCards.map((card) => (
                    <CardItem
                      key={card.id}
                      card={card}
                      isOwner={true}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="public">
              {publicLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : publicCards.length === 0 ? (
                <div className="rounded-lg border border-dashed p-12 text-center">
                  <p className="text-muted-foreground">No public cards available yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:max-w-4xl mx-auto w-full">
                  {publicCards.map((card) => (
                    <CardItem
                      key={card.id}
                      card={card}
                      isOwner={card.creatorId === session.user.id}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <CardForm
            open={formOpen}
            onOpenChange={setFormOpen}
            onSubmit={handleCreate}
            mode="create"
          />

          <CardForm
            key={editingCard?.id ?? "create"}
            open={!!editingCard}
            onOpenChange={(open) => !open && setEditingCard(null)}
            onSubmit={handleUpdate}
            initialData={editingCard ?? undefined}
            mode="edit"
          />

          <AlertDialog open={!!deleteCardId} onOpenChange={(open) => !open && setDeleteCardId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the card.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (deleteCardId !== null) {
                      deleteMutation.mutate({ id: deleteCardId });
                      setDeleteCardId(null);
                    }
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <Footer />
    </div>
  );
}
