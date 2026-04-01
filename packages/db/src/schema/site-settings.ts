import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("global"),
  theme: text("theme").default("bold-tech").notNull(),
  mode: text("mode").default("light").notNull(),
  themeUpdatedAt: timestamp("theme_updated_at").defaultNow().notNull(),
  themeChangedBy: text("theme_changed_by").default("System"),
});
