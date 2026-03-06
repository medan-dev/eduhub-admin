-- 1. Add Level and Grade to Videos Table
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS level TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT;

-- Example Data backfilling
-- UPDATE videos SET level = 'O-Level', grade = 'Senior Four (S.4)' WHERE subject = 'Chemistry';
