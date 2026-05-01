ALTER TABLE "item_errors"
ADD COLUMN IF NOT EXISTS "is_primary" boolean DEFAULT true NOT NULL;

