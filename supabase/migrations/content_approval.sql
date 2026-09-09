-- Migration: Add Content Approval & External Stakeholder Review fields to article table

ALTER TABLE article
  ADD COLUMN IF NOT EXISTS content_approved_by_name TEXT,
  ADD COLUMN IF NOT EXISTS content_approved_by_email TEXT,
  ADD COLUMN IF NOT EXISTS content_approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS content_approval_notes TEXT,
  ADD COLUMN IF NOT EXISTS approval_duration_seconds INT;

-- Index for quick lookup on approval timestamps
CREATE INDEX IF NOT EXISTS idx_article_content_approved_at ON article(content_approved_at);
