-- up
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  discount_used BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS discount_used BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS ux_newsletter_email_ci
  ON newsletter_subscriptions ((lower(email)));

-- down
DROP INDEX IF EXISTS ux_newsletter_email_ci;
ALTER TABLE newsletter_subscriptions DROP COLUMN IF EXISTS discount_used;
