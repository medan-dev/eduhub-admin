-- Ensure schema is up to date
ALTER TABLE videos ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS grade TEXT;

-- Seed Videos with Level and Grade
-- Run this in the Supabase SQL Editor

DELETE FROM videos;

INSERT INTO videos (title, channel, duration, views, published_date, description, youtube_id, subject, level, grade) VALUES
('Algebra Basics Tutorial', 'Khan Academy', '45min', '2.5M', 'Jan 2024', 'Complete introduction to algebraic equations', 'xSrlaDQy2Qk', 'Mathematics', 'O-Level', 'Senior One (S.1)'),
('Physics Mechanics Explained', 'PBS Learning Media', '52min', '1.8M', 'Dec 2023', 'Learn about forces and motion in detail', 'X-gAy63YcC0', 'Physics', 'O-Level', 'Senior Three (S.3)'),
('Chemistry: Periodic Table', 'Crash Course Chemistry', '38min', '3.2M', 'Nov 2023', 'Understand the periodic table fundamentals', 'zElZvgZYR0c', 'Chemistry', 'O-Level', 'Senior Two (S.2)'),
('Biology Cell Structure', 'Amoeba Sisters', '35min', '5.1M', 'Oct 2023', 'Detailed explanation of plant and animal cells', 'URJZF7377LY', 'Biology', 'O-Level', 'Senior Four (S.4)'),
('English Literature Analysis', 'Literature Teacher', '41min', '890K', 'Sep 2023', 'How to analyze literature like a pro', 'O3N3KLcR4r0', 'English', 'A-Level', 'Senior Five (S.5)'),
('History: Ancient Rome', 'Oversimplified', '26min', '8.3M', 'Aug 2023', 'Fun introduction to Roman civilization', '8PNbxmJpPXs', 'History', 'O-Level', 'Senior One (S.1)'),
('Geography: World Capitals', 'Geography Now', '48min', '450K', 'Jul 2023', 'Learn world capitals and their importance', 'eR4Wa3l0g_E', 'Geography', 'O-Level', 'Senior Two (S.2)'),
('Economics Explained', 'Kurzgesagt', '18min', '12.5M', 'Jun 2023', 'Economic systems in simple terms', 'EhJPTKnxFJE', 'Economics', 'A-Level', 'Senior Six (S.6)'),
('Calculus: Derivatives', '3Blue1Brown', '22min', '4.2M', 'Feb 2024', 'Visual introduction to the derivative', '9vKqVkMq2Ko', 'Mathematics', 'A-Level', 'Senior Five (S.5)'),
('Modern Physics: Atoms', 'Veritasium', '32min', '2.1M', 'Mar 2024', 'The story of how we discovered atoms', 'LhVOT7mJtk8', 'Physics', 'A-Level', 'Senior Six (S.6)');
