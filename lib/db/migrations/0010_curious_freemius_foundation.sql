CREATE TABLE IF NOT EXISTS "billing_provider_accounts" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "teams"("id"),
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "provider" varchar(20) NOT NULL,
  "provider_customer_id" text,
  "provider_subscription_id" text,
  "email" varchar(255),
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "billing_entitlements" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "teams"("id"),
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "provider" varchar(20) NOT NULL,
  "plan_type" varchar(20) NOT NULL,
  "price_id" varchar(120) NOT NULL,
  "status" varchar(30) DEFAULT 'pending' NOT NULL,
  "provider_customer_id" text,
  "provider_subscription_id" text,
  "checkout_session_id" text,
  "report_credits" integer DEFAULT 0 NOT NULL,
  "unlocked_report_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "current_period_ends_at" timestamp,
  "legacy_subscription_id" integer REFERENCES "subscriptions"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "billing_webhook_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "provider" varchar(20) NOT NULL,
  "provider_event_key" varchar(220) NOT NULL UNIQUE,
  "event_id" varchar(150) NOT NULL,
  "event_type" varchar(120) NOT NULL,
  "payload" jsonb NOT NULL,
  "processed_at" timestamp DEFAULT now() NOT NULL
);
