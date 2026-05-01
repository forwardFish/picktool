ALTER TABLE "uploads" ADD COLUMN "diagnostic_goal" text;
--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "recent_trend" text;
--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "parent_concern_json" jsonb DEFAULT '[]'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "teacher_feedback_present" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "has_tutor" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "intake_completed_at" timestamp;
--> statement-breakpoint
CREATE TABLE "evidence_anchors" (
	"id" serial PRIMARY KEY NOT NULL,
	"problem_item_id" integer NOT NULL,
	"page_id" integer NOT NULL,
	"page_no" integer NOT NULL,
	"problem_no" varchar(50) NOT NULL,
	"preview_label" varchar(255) NOT NULL,
	"highlight_box_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"anchor_kind" varchar(40) DEFAULT 'problem' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_histories" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"run_id" integer NOT NULL,
	"report_id" integer NOT NULL,
	"primary_issue" text NOT NULL,
	"secondary_issue" text,
	"compare_summary" text NOT NULL,
	"parent_note" text,
	"completed_days_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"snapshot_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_histories_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
CREATE TABLE "issue_trends" (
	"id" serial PRIMARY KEY NOT NULL,
	"child_id" integer NOT NULL,
	"issue_code" varchar(80) NOT NULL,
	"issue_title" text NOT NULL,
	"status" varchar(40) DEFAULT 'active' NOT NULL,
	"trend_direction" varchar(40) DEFAULT 'new' NOT NULL,
	"first_seen_report_id" integer NOT NULL,
	"latest_report_id" integer NOT NULL,
	"occurrence_count" integer DEFAULT 1 NOT NULL,
	"summary" text NOT NULL,
	"trend_points_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evidence_anchors" ADD CONSTRAINT "evidence_anchors_problem_item_id_problem_items_id_fk" FOREIGN KEY ("problem_item_id") REFERENCES "public"."problem_items"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "evidence_anchors" ADD CONSTRAINT "evidence_anchors_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "review_histories" ADD CONSTRAINT "review_histories_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "review_histories" ADD CONSTRAINT "review_histories_run_id_analysis_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "review_histories" ADD CONSTRAINT "review_histories_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "issue_trends" ADD CONSTRAINT "issue_trends_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "issue_trends" ADD CONSTRAINT "issue_trends_first_seen_report_id_reports_id_fk" FOREIGN KEY ("first_seen_report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "issue_trends" ADD CONSTRAINT "issue_trends_latest_report_id_reports_id_fk" FOREIGN KEY ("latest_report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "issue_trends_child_issue_code_idx" ON "issue_trends" USING btree ("child_id","issue_code");
