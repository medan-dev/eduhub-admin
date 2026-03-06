-- Run this in the Supabase SQL Editor to update your existing profiles table and the registration trigger

-- 1. Add progress tracking columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stream TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS gpa DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS papers_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS videos_watched INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hours_studied INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS study_streak INTEGER DEFAULT 0;

-- 2. Remove default 'Senior Four (S.4)' from grade (if it was set previously)
ALTER TABLE profiles ALTER COLUMN grade DROP DEFAULT;

-- 3. Update the handle_new_user trigger function to capture real-time registration data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, email, role, phone, school, stream, grade, 
    gpa, total_score, papers_completed, videos_watched, hours_studied, study_streak
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'student',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'school_name', NEW.raw_user_meta_data->>'school'),
    NEW.raw_user_meta_data->>'stream',
    NEW.raw_user_meta_data->>'grade',
    0.0, 0, 0, 0, 0, 0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
