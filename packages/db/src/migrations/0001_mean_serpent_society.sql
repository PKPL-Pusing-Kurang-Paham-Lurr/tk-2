CREATE TABLE "card" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"custom_font" text DEFAULT 'architects-daughter' NOT NULL,
	"custom_color" text DEFAULT '#ffffff' NOT NULL,
	"font_color" text DEFAULT '#000000' NOT NULL,
	"creator_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;