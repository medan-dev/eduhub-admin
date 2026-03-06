-- Add district column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS district TEXT;

-- Update the handle_new_user trigger function to include district
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, email, role, phone, school, district, stream, grade, 
    gpa, total_score, papers_completed, videos_watched, hours_studied, study_streak
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'student',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'school_name', NEW.raw_user_meta_data->>'school'),
    NEW.raw_user_meta_data->>'district',
    NEW.raw_user_meta_data->>'stream',
    NEW.raw_user_meta_data->>'grade',
    0.0, 0, 0, 0, 0, 0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
