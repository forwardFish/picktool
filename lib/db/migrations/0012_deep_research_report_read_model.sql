CREATE TABLE "report_diagnosis_outlines" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"summary" text NOT NULL,
	"primary_issue" text NOT NULL,
	"secondary_issue" text NOT NULL,
	"do_this_week" text NOT NULL,
	"not_now" text NOT NULL,
	"guardrail" text NOT NULL,
	"confidence" real NOT NULL,
	"locale" varchar(20) DEFAULT 'en-US' NOT NULL,
	"source_meta_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_diagnosis_outlines_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
CREATE TABLE "report_shortest_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"current_node" text NOT NULL,
	"next_node" text NOT NULL,
	"later_nodes_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"why_first" text NOT NULL,
	"what_this_solves" text NOT NULL,
	"what_waits" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_shortest_paths_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
CREATE TABLE "report_output_gates" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"gate_code" varchar(80) NOT NULL,
	"title" text NOT NULL,
	"status" varchar(40) NOT NULL,
	"body" text NOT NULL,
	"what_this_verifies" text NOT NULL,
	"how_to_check" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_seven_day_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"goal" text NOT NULL,
	"practice" text NOT NULL,
	"parent_prompt" text NOT NULL,
	"success_signal" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_compare_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"improved" text NOT NULL,
	"still_uneven" text NOT NULL,
	"needs_support" text NOT NULL,
	"trend_points_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"resume_decision" text NOT NULL,
	"next_suggested_focus" text NOT NULL,
	"compare_summary" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_compare_snapshots_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
CREATE TABLE "report_share_artifacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"share_summary" text NOT NULL,
	"tutor_summary" text NOT NULL,
	"resume_call_to_action" text NOT NULL,
	"artifact_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_share_artifacts_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
CREATE TABLE "report_review_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"release_status" varchar(40) NOT NULL,
	"review_reason" text,
	"review_banner" text,
	"quality_flags_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "report_review_snapshots_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
ALTER TABLE "report_diagnosis_outlines" ADD CONSTRAINT "report_diagnosis_outlines_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report_shortest_paths" ADD CONSTRAINT "report_shortest_paths_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report_output_gates" ADD CONSTRAINT "report_output_gates_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report_seven_day_plans" ADD CONSTRAINT "report_seven_day_plans_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report_compare_snapshots" ADD CONSTRAINT "report_compare_snapshots_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report_share_artifacts" ADD CONSTRAINT "report_share_artifacts_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report_review_snapshots" ADD CONSTRAINT "report_review_snapshots_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
