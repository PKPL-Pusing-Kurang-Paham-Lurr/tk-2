import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, serial } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const card = pgTable("card", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  customFont: text("custom_font").notNull().default("architects-daughter"),
  customColor: text("custom_color").notNull().default("#ffffff"),
  fontColor: text("font_color").notNull().default("#000000"),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const cardRelations = relations(card, ({ one }) => ({
  creator: one(user, {
    fields: [card.creatorId],
    references: [user.id],
  }),
}));
