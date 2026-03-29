import { db } from "@tk2-pkpl/db";
import { card } from "@tk2-pkpl/db/schema/card";
import { eq, desc } from "drizzle-orm";
import z from "zod";

import { router, protectedProcedure, publicProcedure } from "../index";

export const cardRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.query.card.findMany({
      with: {
        creator: true,
      },
      orderBy: [desc(card.createdAt)],
    });
  }),

  getMy: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.card.findMany({
      where: eq(card.creatorId, ctx.session.user.id),
      with: {
        creator: true,
      },
      orderBy: [desc(card.createdAt)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db.query.card.findFirst({
        where: eq(card.id, input.id),
        with: {
          creator: true,
        },
      });
      return result ?? null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        customFont: z.string().default("architects-daughter"),
        customColor: z.string().default("#ffffff"),
        fontColor: z.string().default("#000000"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db.insert(card).values({
        title: input.title,
        description: input.description,
        customFont: input.customFont,
        customColor: input.customColor,
        fontColor: input.fontColor,
        creatorId: ctx.session.user.id,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        customFont: z.string().optional(),
        customColor: z.string().optional(),
        fontColor: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.card.findFirst({
        where: eq(card.id, input.id),
      });
      if (!existing) throw new Error("Card not found");
      if (existing.creatorId !== ctx.session.user.id) {
        throw new Error("Not authorized to update this card");
      }
      return await db
        .update(card)
        .set({
          title: input.title,
          description: input.description,
          customFont: input.customFont,
          customColor: input.customColor,
          fontColor: input.fontColor,
        })
        .where(eq(card.id, input.id));
    }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const existing = await db.query.card.findFirst({
      where: eq(card.id, input.id),
    });
    if (!existing) throw new Error("Card not found");
    if (existing.creatorId !== ctx.session.user.id) {
      throw new Error("Not authorized to delete this card");
    }
    return await db.delete(card).where(eq(card.id, input.id));
  }),
});
