ALTER TABLE "analysis_runs"
ADD COLUMN IF NOT EXISTS "deck_id" integer,
ADD COLUMN IF NOT EXISTS "deck_generation_status" varchar(30) DEFAULT 'idle' NOT NULL,
ADD COLUMN IF NOT EXISTS "deck_review_status" varchar(30) DEFAULT 'not_requested' NOT NULL,
ADD COLUMN IF NOT EXISTS "deck_export_status" varchar(30) DEFAULT 'idle' NOT NULL;

ALTER TABLE "reports"
ADD COLUMN IF NOT EXISTS "deck_id" integer,
ADD COLUMN IF NOT EXISTS "deck_status" varchar(30) DEFAULT 'idle' NOT NULL,
ADD COLUMN IF NOT EXISTS "deck_tier" varchar(20) DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS "walkthrough_visibility" varchar(30) DEFAULT 'hidden' NOT NULL,
ADD COLUMN IF NOT EXISTS "voice_guidance_default" boolean DEFAULT false NOT NULL;

CREATE TABLE IF NOT EXISTS "diagnosis_decks" (
  "id" serial PRIMARY KEY NOT NULL,
  "run_id" integer NOT NULL REFERENCES "analysis_runs"("id"),
  "report_id" integer NOT NULL REFERENCES "reports"("id"),
  "status" varchar(30) DEFAULT 'draft' NOT NULL,
  "tier" varchar(20) DEFAULT 'pending' NOT NULL,
  "review_status" varchar(30) DEFAULT 'pending' NOT NULL,
  "walkthrough_visibility" varchar(30) DEFAULT 'hidden' NOT NULL,
  "voice_guidance_default" boolean DEFAULT false NOT NULL,
  "quality_score" real,
  "quality_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "source_facts" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "title" text NOT NULL,
  "generated_at" timestamp,
  "approved_at" timestamp,
  "rejected_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "diagnosis_slides" (
  "id" serial PRIMARY KEY NOT NULL,
  "deck_id" integer NOT NULL REFERENCES "diagnosis_decks"("id"),
  "slide_index" integer NOT NULL,
  "slide_type" varchar(50) NOT NULL,
  "title" text NOT NULL,
  "body" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "notes" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" varchar(30) DEFAULT 'draft' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "diagnosis_slide_actions" (
  "id" serial PRIMARY KEY NOT NULL,
  "deck_id" integer NOT NULL REFERENCES "diagnosis_decks"("id"),
  "slide_id" integer NOT NULL REFERENCES "diagnosis_slides"("id"),
  "action_index" integer NOT NULL,
  "action_type" varchar(50) NOT NULL,
  "reference_key" varchar(120),
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "narration_text" text DEFAULT '' NOT NULL,
  "autoplay" boolean DEFAULT false NOT NULL,
  "status" varchar(30) DEFAULT 'draft' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "deck_exports" (
  "id" serial PRIMARY KEY NOT NULL,
  "deck_id" integer NOT NULL REFERENCES "diagnosis_decks"("id"),
  "format" varchar(20) NOT NULL,
  "status" varchar(30) DEFAULT 'queued' NOT NULL,
  "artifact_path" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "deck_share_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "deck_id" integer NOT NULL REFERENCES "diagnosis_decks"("id"),
  "report_id" integer NOT NULL REFERENCES "reports"("id"),
  "allow_parent_playback" boolean DEFAULT false NOT NULL,
  "allow_share_playback" boolean DEFAULT false NOT NULL,
  "default_voice_enabled" boolean DEFAULT false NOT NULL,
  "max_autoplay_tier" varchar(20) DEFAULT 'B' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "deck_playback_snapshots" (
  "id" serial PRIMARY KEY NOT NULL,
  "deck_id" integer NOT NULL REFERENCES "diagnosis_decks"("id"),
  "user_id" integer REFERENCES "users"("id"),
  "share_token" varchar(120),
  "current_slide_index" integer DEFAULT 0 NOT NULL,
  "current_action_index" integer DEFAULT 0 NOT NULL,
  "playback_state" varchar(20) DEFAULT 'idle' NOT NULL,
  "voice_enabled" boolean DEFAULT false NOT NULL,
  "snapshot_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "restored_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
