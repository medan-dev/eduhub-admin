// Database types for EDUHUB UG
export interface Subject {
  id: string;
  name: string;
  stream: string;
  overview: string;
  syllabus: string[];
  icon_name: string;
  created_at: string;
}

export interface Paper {
  id: string;
  title: string;
  subject: string;
  year: string;
  duration: string;
  total_marks: number;
  pass_mark: number;
  difficulty: number;
  pdf_url: string | null;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  channel: string;
  duration: string;
  views: string;
  published_date: string;
  description: string;
  youtube_id: string;
  subject: string;
  created_at: string;
}

export interface Tutorial {
  id: string;
  title: string;
  instructor: string;
  difficulty: string;
  lessons_count: number;
  duration: string;
  description: string;
  enrolled_count: number;
  subject: string;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  district: string;
  type: string;
  exam_board: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
  paper_id: string | null;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  school: string;
  stream?: string;
  avatar_url: string | null;
  role: string;
  grade?: string;
  gpa?: number;
  total_score?: number;
  papers_completed?: number;
  videos_watched?: number;
  hours_studied?: number;
  study_streak?: number;
  created_at: string;
}
