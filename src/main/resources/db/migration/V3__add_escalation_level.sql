-- ====================================================================
-- Resolvo Flyway Migration V3: Add Incident Escalation Hierarchy Columns
-- ====================================================================

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS escalation_level VARCHAR(30) DEFAULT 'NONE';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS escalation_reason TEXT;
