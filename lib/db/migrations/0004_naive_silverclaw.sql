CREATE TABLE "share_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"token" varchar(120) NOT NULL,
	"role" varchar(20) DEFAULT 'tutor' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "share_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;