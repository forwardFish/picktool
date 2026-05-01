CREATE TABLE "reminder_events" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"kind" varchar(40) NOT NULL,
	"user_id" integer NOT NULL,
	"report_id" integer,
	"child_id" integer,
	"delivery_channel" varchar(40) NOT NULL,
	"status" varchar(30) NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dedupe_key" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"scheduled_for" timestamp DEFAULT now() NOT NULL,
	"attempted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "run_cost_artifacts" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"engine" varchar(20) NOT NULL,
	"page_count" integer DEFAULT 0 NOT NULL,
	"labeled_item_count" integer DEFAULT 0 NOT NULL,
	"estimated_input_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_output_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_usd" real DEFAULT 0 NOT NULL,
	"status" varchar(30) NOT NULL,
	"artifact_path" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "run_cost_artifacts_run_id_unique" UNIQUE("run_id")
);
--> statement-breakpoint
CREATE TABLE "run_error_events" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"error_type" varchar(40) NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "run_lifecycle_events" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"child_id" integer,
	"upload_id" integer,
	"event_type" varchar(40) NOT NULL,
	"status" varchar(30) NOT NULL,
	"stage" varchar(40) NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reminder_events" ADD CONSTRAINT "reminder_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder_events" ADD CONSTRAINT "reminder_events_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminder_events" ADD CONSTRAINT "reminder_events_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_cost_artifacts" ADD CONSTRAINT "run_cost_artifacts_run_id_analysis_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_cost_artifacts" ADD CONSTRAINT "run_cost_artifacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_error_events" ADD CONSTRAINT "run_error_events_run_id_analysis_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_error_events" ADD CONSTRAINT "run_error_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_lifecycle_events" ADD CONSTRAINT "run_lifecycle_events_run_id_analysis_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_lifecycle_events" ADD CONSTRAINT "run_lifecycle_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_lifecycle_events" ADD CONSTRAINT "run_lifecycle_events_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "run_lifecycle_events" ADD CONSTRAINT "run_lifecycle_events_upload_id_uploads_id_fk" FOREIGN KEY ("upload_id") REFERENCES "public"."uploads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
