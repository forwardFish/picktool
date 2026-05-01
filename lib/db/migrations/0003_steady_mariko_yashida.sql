CREATE TABLE "error_labels" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(80) NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "error_labels_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "item_errors" (
	"id" serial PRIMARY KEY NOT NULL,
	"item_id" integer NOT NULL,
	"label_id" integer NOT NULL,
	"severity" varchar(20) DEFAULT 'med' NOT NULL,
	"rationale" text,
	"confidence" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"page_id" integer NOT NULL,
	"problem_no" varchar(50) NOT NULL,
	"problem_text" text,
	"student_work" text,
	"teacher_mark" varchar(20) DEFAULT 'unknown' NOT NULL,
	"model_is_correct" boolean,
	"item_confidence" real,
	"evidence_anchor" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_runs" ADD COLUMN "overall_confidence" real;--> statement-breakpoint
ALTER TABLE "item_errors" ADD CONSTRAINT "item_errors_item_id_problem_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."problem_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_errors" ADD CONSTRAINT "item_errors_label_id_error_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."error_labels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_items" ADD CONSTRAINT "problem_items_run_id_analysis_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_items" ADD CONSTRAINT "problem_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;