-- ============================================
-- EDUHUB UG — Supabase Database Migration
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  stream TEXT NOT NULL DEFAULT 'Sciences', -- Sciences, Arts, Technical
  overview TEXT,
  syllabus JSONB DEFAULT '[]'::jsonb,
  icon_name TEXT DEFAULT 'ic_subject',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Papers Table (UNEB Past Papers)
CREATE TABLE IF NOT EXISTS papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  year TEXT NOT NULL,
  duration TEXT DEFAULT '3 hours',
  total_marks INTEGER DEFAULT 100,
  pass_mark INTEGER DEFAULT 40,
  difficulty DECIMAL(2,1) DEFAULT 3.0,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Videos Table (Education Videos)
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  channel TEXT NOT NULL,
  duration TEXT DEFAULT '30min',
  views TEXT DEFAULT '0',
  published_date TEXT,
  description TEXT,
  youtube_id TEXT NOT NULL,
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tutorials Table
CREATE TABLE IF NOT EXISTS tutorials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  instructor TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Beginner', -- Beginner, Intermediate, Advanced
  lessons_count INTEGER DEFAULT 0,
  duration TEXT DEFAULT '1 hour',
  description TEXT,
  enrolled_count INTEGER DEFAULT 0,
  subject TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Schools Table (Ugandan Schools)
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  district TEXT NOT NULL,
  type TEXT DEFAULT 'Government - Mixed Secondary',
  exam_board TEXT DEFAULT 'UNEB',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Profiles Table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  school TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student', -- student, admin
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read access for content tables
CREATE POLICY "Public read access" ON subjects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON papers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON videos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tutorials FOR SELECT USING (true);
CREATE POLICY "Public read access" ON schools FOR SELECT USING (true);
CREATE POLICY "Public read access" ON quizzes FOR SELECT USING (true);

-- Admin write access (service role bypasses RLS)
-- These policies allow authenticated admins to write
CREATE POLICY "Admin insert" ON subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update" ON subjects FOR UPDATE USING (true);
CREATE POLICY "Admin delete" ON subjects FOR DELETE USING (true);

CREATE POLICY "Admin insert" ON papers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update" ON papers FOR UPDATE USING (true);
CREATE POLICY "Admin delete" ON papers FOR DELETE USING (true);

CREATE POLICY "Admin insert" ON videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update" ON videos FOR UPDATE USING (true);
CREATE POLICY "Admin delete" ON videos FOR DELETE USING (true);

CREATE POLICY "Admin insert" ON tutorials FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update" ON tutorials FOR UPDATE USING (true);
CREATE POLICY "Admin delete" ON tutorials FOR DELETE USING (true);

CREATE POLICY "Admin insert" ON schools FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update" ON schools FOR UPDATE USING (true);
CREATE POLICY "Admin delete" ON schools FOR DELETE USING (true);

CREATE POLICY "Admin insert" ON quizzes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update" ON quizzes FOR UPDATE USING (true);
CREATE POLICY "Admin delete" ON quizzes FOR DELETE USING (true);

-- Profiles: users can read/update their own profile
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Insert profile on signup" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA (from DataManager.java)
-- ============================================

-- Seed Subjects
INSERT INTO subjects (name, stream, overview, syllabus) VALUES
('Mathematics', 'Sciences', 'Mathematics: Covers algebra, geometry, trigonometry, calculus basics, and applied problem-solving aligned to UNEB syllabus.', '["Number operations and sequences","Algebra: equations, inequalities, polynomials","Geometry and trigonometry","Statistics and probability","Introductory calculus and applications"]'),
('Physics', 'Sciences', 'Physics: Mechanics, waves, electricity and magnetism, and modern physics with practical experiments and problem-solving examples.', '["Motion and forces (Mechanics)","Work, energy and power","Waves and sound","Electricity and magnetism","Practical experiments & measurements"]'),
('Chemistry', 'Sciences', 'Chemistry: Atomic structure, periodic table, bonding, acids & bases, organic basics and laboratory techniques.', '["Atomic structure and periodicity","Chemical bonding and states of matter","Stoichiometry and calculations","Acids, bases and salts","Organic compounds and lab techniques"]'),
('Biology', 'Sciences', 'Biology: Cell biology, genetics, ecology, human physiology and evolution with practical lab activities.', '["Cell structure and functions","Genetics and evolution","Human physiology and systems","Ecology and ecosystems","Practical biology investigations"]'),
('English', 'Arts', 'English: Comprehension, grammar, essay writing, literature analysis and language skills for secondary students.', '["Comprehension and summary skills","Grammar and vocabulary development","Essay and creative writing","Literature: poetry and prose analysis","Speaking and listening skills"]'),
('History', 'Arts', 'History: Uganda and world history topics including pre-colonial, colonial and post-colonial eras, and modern history themes.', '["Pre-colonial societies in Africa","Colonialism and independence movements","Post-colonial Uganda and governance","World conflicts and modern history","Historical source analysis"]'),
('Geography', 'Arts', 'Geography: Physical and human geography, map skills, environment and resources, and regional case studies.', '["Map skills and spatial analysis","Physical geography: landforms and climate","Human geography: population and urbanization","Resources and environmental management","Regional studies with Uganda case studies"]'),
('Economics', 'Arts', 'Economics: Basic micro and macro concepts, markets, development economics, and Ugandan case studies.', '["Basic economic problem and scarcity","Supply, demand and market structures","National income and macro concepts","Development economics and Uganda case studies","International trade basics"]'),
('Literature', 'Arts', 'Literature: Study of prose, poetry and drama with analysis techniques and sample texts used in UNEB.', '["Prose analysis","Poetry analysis","Drama analysis","Literary criticism techniques","UNEB set texts"]'),
('Social Studies', 'Arts', 'Social Studies: Civic education, social structures, and community development topics relevant to Uganda.', '["Civic education","Social structures","Community development","Governance","Human rights"]')
ON CONFLICT (name) DO NOTHING;

-- Seed Papers
INSERT INTO papers (title, subject, year, duration, total_marks, pass_mark, difficulty) VALUES
('UCE Mathematics 2023', 'Mathematics', '2023', '3 hours', 100, 40, 4.0),
('UCE Physics 2023', 'Physics', '2023', '3 hours', 100, 40, 4.5),
('UCE Chemistry 2022', 'Chemistry', '2022', '3 hours', 100, 40, 4.2),
('UCE Biology 2023', 'Biology', '2023', '3 hours', 100, 40, 3.8),
('UCE English 2023', 'English', '2023', '3 hours', 100, 40, 3.5),
('UACE Mathematics 2023', 'Mathematics', '2023', '3.5 hours', 120, 48, 4.5),
('UACE Physics 2022', 'Physics', '2022', '3.5 hours', 120, 48, 4.7),
('UACE Chemistry 2023', 'Chemistry', '2023', '3.5 hours', 120, 48, 4.3);

-- Seed Videos
INSERT INTO videos (title, channel, duration, views, published_date, description, youtube_id, subject) VALUES
('Algebra Basics Tutorial', 'Khan Academy', '45min', '2.5M', 'Jan 2024', 'Complete introduction to algebraic equations', 'xSrlaDQy2Qk', 'Mathematics'),
('Physics Mechanics Explained', 'PBS Learning Media', '52min', '1.8M', 'Dec 2023', 'Learn about forces and motion in detail', 'X-gAy63YcC0', 'Physics'),
('Chemistry: Periodic Table', 'Crash Course Chemistry', '38min', '3.2M', 'Nov 2023', 'Understand the periodic table fundamentals', 'zElZvgZYR0c', 'Chemistry'),
('Biology Cell Structure', 'Amoeba Sisters', '35min', '5.1M', 'Oct 2023', 'Detailed explanation of plant and animal cells', 'URJZF7377LY', 'Biology'),
('English Literature Analysis', 'Literature Teacher', '41min', '890K', 'Sep 2023', 'How to analyze literature like a pro', 'O3N3KLcR4r0', 'English'),
('History: Ancient Rome', 'Oversimplified', '26min', '8.3M', 'Aug 2023', 'Fun introduction to Roman civilization', '8PNbxmJpPXs', 'History'),
('Geography: World Capitals', 'Geography Now', '48min', '450K', 'Jul 2023', 'Learn world capitals and their importance', 'eR4Wa3l0g_E', 'Geography'),
('Economics Explained', 'Kurzgesagt', '18min', '12.5M', 'Jun 2023', 'Economic systems in simple terms', 'EhJPTKnxFJE', 'Economics');

-- Seed Tutorials
INSERT INTO tutorials (title, instructor, difficulty, lessons_count, duration, description, enrolled_count, subject) VALUES
('Mastering Algebra', 'Dr. Sarah Math', 'Intermediate', 15, '8 hours', 'Complete algebra course from basics to advanced', 75, 'Mathematics'),
('Physics Fundamentals', 'Prof. James Science', 'Beginner', 12, '6 hours', 'Learn physics concepts that apply to daily life', 45, 'Physics'),
('Chemistry Lab Techniques', 'Dr. Emma Chemistry', 'Advanced', 20, '12 hours', 'Master laboratory procedures and safety', 90, 'Chemistry'),
('Biology for Life Sciences', 'Prof. Michael Biology', 'Intermediate', 18, '10 hours', 'Understanding living organisms and ecosystems', 60, 'Biology'),
('Advanced English Writing', 'Mrs. Rachel English', 'Advanced', 16, '9 hours', 'Develop professional writing skills', 85, 'English'),
('History: Modern Era', 'Prof. David History', 'Beginner', 14, '7 hours', 'Explore modern history from 1800 onwards', 50, 'History'),
('Geography and Cultures', 'Dr. Lisa Geography', 'Intermediate', 13, '7.5 hours', 'Discover world geography and cultural diversity', 70, 'Geography'),
('Economics for Beginners', 'Prof. Tom Economics', 'Beginner', 10, '5 hours', 'Essential economics concepts explained simply', 40, 'Economics');

-- Seed Schools
INSERT INTO schools (name, code, district, type, exam_board) VALUES
('Kampala High School', 'UG/UKA/0015', 'Kampala', 'Government - Mixed Secondary', 'UNEB'),
('Makerere High School', 'UG/UKA/0012', 'Kampala', 'Government - Mixed Secondary', 'UNEB'),
('St. Mary''s College Mengo', 'UG/UKA/0008', 'Kampala', 'Private - Boys Secondary', 'UNEB'),
('Old Kampala High School', 'UG/UKA/0019', 'Kampala', 'Government - Mixed Secondary', 'UNEB'),
('Kibuli Secondary School', 'UG/UKA/0034', 'Kampala', 'Government - Mixed Secondary', 'UNEB'),
('Namilyango College', 'UG/MUK/0011', 'Mukono', 'Private - Boys Secondary', 'UNEB'),
('Ntare School', 'UG/MBD/0022', 'Mbarara', 'Government - Mixed Secondary', 'UNEB'),
('Jinja High School', 'UG/JNJ/0005', 'Jinja', 'Government - Mixed Secondary', 'UNEB'),
('Soroti High School', 'UG/SRT/0007', 'Soroti', 'Government - Mixed Secondary', 'UNEB'),
('King''s College Budo', 'UG/UKA/0001', 'Kampala', 'Private - Boys Secondary', 'UNEB');

-- Seed Quizzes (sample quiz from QuizActivity)
INSERT INTO quizzes (title, subject, questions) VALUES
('General Knowledge Quiz', 'Mathematics', '[
  {"question": "What is 2 + 2?", "options": ["3", "4", "5", "6"], "correct": 1},
  {"question": "What is the capital of Uganda?", "options": ["Jinja", "Kampala", "Mbarara", "Entebbe"], "correct": 1},
  {"question": "Who wrote Romeo and Juliet?", "options": ["Shakespeare", "Marlowe", "Milton", "Dante"], "correct": 0},
  {"question": "What is the chemical symbol for Gold?", "options": ["Gd", "Au", "Ag", "Cu"], "correct": 1},
  {"question": "What is the largest planet in our solar system?", "options": ["Mars", "Jupiter", "Saturn", "Neptune"], "correct": 1}

-- ============================================
-- 8. Storage Buckets Setup
-- ============================================

-- Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('papers', 'papers', true),
       ('icons', 'icons', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS Policies for 'papers' bucket
CREATE POLICY "Public Read Access Papers" ON storage.objects FOR SELECT TO public USING (bucket_id = 'papers');
CREATE POLICY "Admin Upload Access Papers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'papers');
CREATE POLICY "Admin Update Access Papers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'papers');
CREATE POLICY "Admin Delete Access Papers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'papers');

-- Set up RLS Policies for 'icons' bucket
CREATE POLICY "Public Read Access Icons" ON storage.objects FOR SELECT TO public USING (bucket_id = 'icons');
CREATE POLICY "Admin Upload Access Icons" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'icons');
CREATE POLICY "Admin Update Access Icons" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'icons');
CREATE POLICY "Admin Delete Access Icons" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'icons');
