-- ====================================================================
-- Resolvo Flyway Migration V4: Add File & Screenshot Attachment Support
-- ====================================================================

-- 1. Support attachments on Incidents (e.g., initial error screenshot)
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(100);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS attachment_data TEXT;

-- 2. Support attachments on Investigation Notes (e.g., diagnostic logs, follow-up screenshots)
ALTER TABLE investigation_notes ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255);
ALTER TABLE investigation_notes ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(100);
ALTER TABLE investigation_notes ADD COLUMN IF NOT EXISTS attachment_data TEXT;
