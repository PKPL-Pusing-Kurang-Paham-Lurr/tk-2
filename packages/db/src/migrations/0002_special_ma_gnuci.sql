CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"user_id" text,
	"ip_address" text,
	"user_agent" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
