CREATE TYPE "public"."comment_phase" AS ENUM('script', 'video');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('manager', 'admin');--> statement-breakpoint
CREATE TYPE "public"."workflow_stage" AS ENUM('script_review', 'changes_requested', 'ready_for_shoot', 'video_review', 'ready_to_schedule', 'scheduled', 'published');--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"research_entry_id" uuid,
	"keyword" varchar(255) NOT NULL,
	"format" varchar(64) NOT NULL,
	"script" text NOT NULL,
	"original_script" text,
	"style" varchar(64),
	"audience" varchar(255),
	"location" varchar(32) DEFAULT 'IN' NOT NULL,
	"stage" "workflow_stage" DEFAULT 'script_review' NOT NULL,
	"legacy_status" varchar(64) DEFAULT 'pending' NOT NULL,
	"handoff_note" text,
	"scheduled_date" varchar(32),
	"scheduled_at" timestamp with time zone,
	"ready_for_shoot_at" timestamp with time zone,
	"video_approved_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"seo" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"editing" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tag_snapshot" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"publication" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"performance" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by_id" uuid,
	"approved_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keyword" varchar(255) NOT NULL,
	"location" varchar(32) DEFAULT 'IN' NOT NULL,
	"status" varchar(64) DEFAULT 'pending' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scheduled_date" varchar(32),
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"author_id" uuid,
	"author_role" "user_role" NOT NULL,
	"phase" "comment_phase" NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_item_id" uuid NOT NULL,
	"actor_id" uuid,
	"actor_role" "user_role" NOT NULL,
	"from_stage" "workflow_stage",
	"to_stage" "workflow_stage" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_research_entry_id_research_entries_id_fk" FOREIGN KEY ("research_entry_id") REFERENCES "public"."research_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_entries" ADD CONSTRAINT "research_entries_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_comments" ADD CONSTRAINT "workflow_comments_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_comments" ADD CONSTRAINT "workflow_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_events" ADD CONSTRAINT "workflow_events_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_events" ADD CONSTRAINT "workflow_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_items_stage_idx" ON "content_items" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "content_items_keyword_idx" ON "content_items" USING btree ("keyword");--> statement-breakpoint
CREATE INDEX "content_items_created_by_idx" ON "content_items" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "content_items_research_idx" ON "content_items" USING btree ("research_entry_id");--> statement-breakpoint
CREATE INDEX "research_entries_keyword_idx" ON "research_entries" USING btree ("keyword");--> statement-breakpoint
CREATE INDEX "research_entries_status_idx" ON "research_entries" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "workflow_comments_content_item_idx" ON "workflow_comments" USING btree ("content_item_id");--> statement-breakpoint
CREATE INDEX "workflow_comments_created_at_idx" ON "workflow_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "workflow_events_content_item_idx" ON "workflow_events" USING btree ("content_item_id");--> statement-breakpoint
CREATE INDEX "workflow_events_stage_idx" ON "workflow_events" USING btree ("to_stage");