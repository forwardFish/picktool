CREATE TABLE "model_provider_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_name" varchar(40) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"default_model" varchar(160) NOT NULL,
	"base_url" text NOT NULL,
	"timeout_ms" integer DEFAULT 30000 NOT NULL,
	"max_retries" integer DEFAULT 1 NOT NULL,
	"supports_json_schema" boolean DEFAULT true NOT NULL,
	"supports_reasoning" boolean DEFAULT false NOT NULL,
	"supports_tools" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "model_provider_configs_provider_name_unique" UNIQUE("provider_name")
);
--> statement-breakpoint
CREATE TABLE "analysis_run_models" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"provider_config_id" integer,
	"task_type" varchar(40) NOT NULL,
	"attempt_index" integer DEFAULT 0 NOT NULL,
	"provider_name" varchar(40) NOT NULL,
	"model_name" varchar(160) NOT NULL,
	"status" varchar(30) NOT NULL,
	"finish_reason" varchar(40),
	"latency_ms" integer,
	"input_tokens" integer,
	"output_tokens" integer,
	"reasoning_tokens" integer,
	"total_tokens" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_call_failovers" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"task_type" varchar(40) NOT NULL,
	"from_run_model_id" varchar(80),
	"from_provider_name" varchar(40) NOT NULL,
	"from_model_name" varchar(160) NOT NULL,
	"to_provider_name" varchar(40) NOT NULL,
	"to_model_name" varchar(160) NOT NULL,
	"error_type" varchar(80),
	"error_message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis_run_models" ADD CONSTRAINT "analysis_run_models_run_id_analysis_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analysis_run_models" ADD CONSTRAINT "analysis_run_models_provider_config_id_model_provider_configs_id_fk" FOREIGN KEY ("provider_config_id") REFERENCES "public"."model_provider_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_call_failovers" ADD CONSTRAINT "model_call_failovers_run_id_analysis_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."analysis_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_call_failovers" ADD CONSTRAINT "model_call_failovers_from_run_model_id_analysis_run_models_id_fk" FOREIGN KEY ("from_run_model_id") REFERENCES "public"."analysis_run_models"("id") ON DELETE no action ON UPDATE no action;
