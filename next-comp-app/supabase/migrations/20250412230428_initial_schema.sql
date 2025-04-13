-- Supabase Migration: Initial Schema Setup

-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Function to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to supabase_admin
-- Adjust role if necessary based on your setup
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO supabase_admin;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO service_role;


-- 1. profiles Table
CREATE TABLE public.profiles (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NULL,
  avatar_url text NULL,
  role text NULL, -- e.g., 'Attorney', 'Adjuster', 'Paralegal'
  firm_name text NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments
COMMENT ON TABLE public.profiles IS 'Stores public user information linked to Supabase Auth users.';
COMMENT ON COLUMN public.profiles.user_id IS 'Links to the corresponding user in Supabase Auth.';
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions (RLS policies will define specific access)
GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;


-- 2. subscriptions Table
CREATE TABLE public.subscriptions (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text NULL UNIQUE,
  stripe_subscription_id text NULL UNIQUE,
  plan_id text NULL, -- e.g., 'basic', 'pro', 'enterprise'
  status text NULL, -- e.g., 'active', 'trialing', 'canceled', 'past_due'
  current_period_end timestamptz NULL,
  trial_end timestamptz NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments
COMMENT ON TABLE public.subscriptions IS 'Tracks user subscription status, linked to Stripe.';
-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_subscription_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions
GRANT ALL ON TABLE public.subscriptions TO postgres;
GRANT ALL ON TABLE public.subscriptions TO service_role;
GRANT SELECT ON TABLE public.subscriptions TO authenticated; -- Users can see their own via RLS
GRANT SELECT ON TABLE public.subscriptions TO anon; -- Or deny anon access


-- 3. injured_workers Table
CREATE TABLE public.injured_workers (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NULL,
  ssn text NULL, -- WARNING: HIGHLY SENSITIVE - Ensure encryption and strict RLS
  address_line1 text NULL,
  address_line2 text NULL,
  city text NULL,
  state text NULL,
  zip_code text NULL,
  phone_number text NULL,
  email text NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_accessed_at timestamptz NULL
);
-- Add comments
COMMENT ON TABLE public.injured_workers IS 'Stores information about individual injured workers (claimants), created by users.';
COMMENT ON COLUMN public.injured_workers.profile_id IS 'Links to the profile of the user who owns/created this record.';
COMMENT ON COLUMN public.injured_workers.ssn IS 'Full SSN - HIGHLY SENSITIVE. Requires encryption at rest and strict RLS.';
-- Enable RLS
ALTER TABLE public.injured_workers ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_injured_worker_updated
  BEFORE UPDATE ON public.injured_workers
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions
GRANT ALL ON TABLE public.injured_workers TO postgres;
GRANT ALL ON TABLE public.injured_workers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.injured_workers TO authenticated; -- RLS policies will restrict to owner
GRANT SELECT ON TABLE public.injured_workers TO anon;


-- 4. claims Table
CREATE TABLE public.claims (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  injured_worker_id uuid NOT NULL REFERENCES public.injured_workers(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Denormalized for easier RLS/queries
  wcc_file_number text NULL,
  carrier_file_number text NULL,
  carrier_code text NULL,
  employer_name text NULL,
  employer_fein text NULL,
  employer_address text NULL,
  insurance_carrier text NULL,
  date_of_injury date NOT NULL,
  injury_type text NULL, -- e.g., 'Injury', 'Illness', 'Repetitive Trauma'
  body_parts_injured text NULL,
  accident_description text NULL,
  notice_given_date date NULL,
  claim_status text NULL, -- e.g., 'Open', 'Closed', 'Settled'
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
  -- Optional: Add UNIQUE constraint on (profile_id, wcc_file_number) if needed
  -- CONSTRAINT unique_wcc_file_per_profile UNIQUE (profile_id, wcc_file_number)
);
-- Add comments
COMMENT ON TABLE public.claims IS 'Stores details about specific workers compensation claims, linked to injured workers.';
COMMENT ON COLUMN public.claims.profile_id IS 'Denormalized profile_id for easier RLS policy creation.';
-- Enable RLS
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_claim_updated
  BEFORE UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions
GRANT ALL ON TABLE public.claims TO postgres;
GRANT ALL ON TABLE public.claims TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.claims TO authenticated; -- RLS policies will restrict
GRANT SELECT ON TABLE public.claims TO anon;


-- 5. rate_settings Table
CREATE TABLE public.rate_settings (
  year integer NOT NULL,
  rate_type text NOT NULL, -- e.g., 'max_comp', 'discount_gt_100w', 'discount_lte_100w'
  value numeric NOT NULL,
  effective_date date NULL,
  description text NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT rate_settings_pkey PRIMARY KEY (year, rate_type)
);
-- Add comments
COMMENT ON TABLE public.rate_settings IS 'Stores annually changing rates like max compensation, discount rates, etc.';
COMMENT ON COLUMN public.rate_settings.year IS 'The year the rate applies to.';
COMMENT ON COLUMN public.rate_settings.rate_type IS 'Identifier for the type of rate (e.g., max_comp).';
COMMENT ON COLUMN public.rate_settings.value IS 'The actual numeric value of the rate.';
COMMENT ON COLUMN public.rate_settings.effective_date IS 'Optional date when the rate becomes effective.';
COMMENT ON COLUMN public.rate_settings.description IS 'Optional description or source for the rate.';
-- Enable RLS (Restrict write access)
ALTER TABLE public.rate_settings ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_rate_setting_updated
  BEFORE UPDATE ON public.rate_settings
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions (Allow all authenticated users to read)
GRANT ALL ON TABLE public.rate_settings TO postgres;
GRANT ALL ON TABLE public.rate_settings TO service_role;
GRANT SELECT ON TABLE public.rate_settings TO authenticated;
GRANT SELECT ON TABLE public.rate_settings TO anon;


-- 6. saved_calculations Table
CREATE TABLE public.saved_calculations (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  claim_id uuid NULL REFERENCES public.claims(id) ON DELETE SET NULL, -- Set NULL if claim deleted
  injured_worker_id uuid NULL REFERENCES public.injured_workers(id) ON DELETE SET NULL, -- Set NULL if worker deleted
  calculator_type text NOT NULL, -- e.g., 'AWW', 'CommutedValue', 'Indemnity'
  calculation_name text NULL, -- User-defined name, e.g., "Initial AWW Calc"
  input_data jsonb NOT NULL, -- Store the form inputs used
  result_data jsonb NOT NULL, -- Store the calculated results
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments
COMMENT ON TABLE public.saved_calculations IS 'Stores the inputs and results of specific calculator runs.';
-- Enable RLS
ALTER TABLE public.saved_calculations ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_saved_calculation_updated
  BEFORE UPDATE ON public.saved_calculations
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions
GRANT ALL ON TABLE public.saved_calculations TO postgres;
GRANT ALL ON TABLE public.saved_calculations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.saved_calculations TO authenticated; -- RLS policies will restrict
GRANT SELECT ON TABLE public.saved_calculations TO anon;


-- 7. notes Table
CREATE TABLE public.notes (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  injured_worker_id uuid NULL REFERENCES public.injured_workers(id) ON DELETE CASCADE, -- Cascade delete if worker deleted
  claim_id uuid NULL REFERENCES public.claims(id) ON DELETE CASCADE, -- Cascade delete if claim deleted
  note_type text NULL, -- e.g., 'Worker', 'Claim', 'Scratchpad'
  content text NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments
COMMENT ON TABLE public.notes IS 'Stores user-created notes, linked to profiles and optionally workers/claims.';
-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_note_updated
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions
GRANT ALL ON TABLE public.notes TO postgres;
GRANT ALL ON TABLE public.notes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notes TO authenticated; -- RLS policies will restrict
GRANT SELECT ON TABLE public.notes TO anon;


-- 8. courses Table
CREATE TABLE public.courses (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  title text NOT NULL UNIQUE,
  description text NULL,
  cle_credits numeric NULL,
  is_premium boolean DEFAULT false NOT NULL,
  published boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments
COMMENT ON TABLE public.courses IS 'Stores information about available training courses.';
-- Enable RLS (Restrict write access)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_course_updated
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions (Allow all authenticated users to read published)
GRANT ALL ON TABLE public.courses TO postgres;
GRANT ALL ON TABLE public.courses TO service_role;
GRANT SELECT ON TABLE public.courses TO authenticated;
GRANT SELECT ON TABLE public.courses TO anon;


-- 9. modules Table
CREATE TABLE public.modules (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NULL,
  content_type text NOT NULL, -- e.g., 'video', 'text', 'quiz'
  content_url text NULL,
  content_body text NULL,
  "order" integer NOT NULL, -- Use quotes for reserved keyword
  published boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments
COMMENT ON TABLE public.modules IS 'Stores individual modules (lessons, videos, text) within a course.';
-- Enable RLS (Restrict write access)
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_module_updated
  BEFORE UPDATE ON public.modules
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions
GRANT ALL ON TABLE public.modules TO postgres;
GRANT ALL ON TABLE public.modules TO service_role;
GRANT SELECT ON TABLE public.modules TO authenticated;
GRANT SELECT ON TABLE public.modules TO anon;


-- 10. quizzes Table
CREATE TABLE public.quizzes (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  module_id uuid NULL REFERENCES public.modules(id) ON DELETE CASCADE, -- Quiz can belong to a module
  title text NOT NULL,
  description text NULL,
  passing_score integer NULL, -- e.g., 70 for 70%
  published boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments
COMMENT ON TABLE public.quizzes IS 'Stores information about quizzes.';
-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_quiz_updated
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions
GRANT ALL ON TABLE public.quizzes TO postgres;
GRANT ALL ON TABLE public.quizzes TO service_role;
GRANT SELECT ON TABLE public.quizzes TO authenticated;
GRANT SELECT ON TABLE public.quizzes TO anon;


-- 11. quiz_questions Table
CREATE TABLE public.quiz_questions (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL, -- e.g., 'multiple_choice', 'true_false'
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments
COMMENT ON TABLE public.quiz_questions IS 'Stores individual questions for a quiz.';
-- Enable RLS
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_quiz_question_updated
  BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions
GRANT ALL ON TABLE public.quiz_questions TO postgres;
GRANT ALL ON TABLE public.quiz_questions TO service_role;
GRANT SELECT ON TABLE public.quiz_questions TO authenticated;
GRANT SELECT ON TABLE public.quiz_questions TO anon;


-- 12. quiz_answers Table
CREATE TABLE public.quiz_answers (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  is_correct boolean DEFAULT false NOT NULL,
  "order" integer NULL, -- Order for multiple choice options
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
-- Add comments
COMMENT ON TABLE public.quiz_answers IS 'Stores possible answers for a quiz question.';
-- Enable RLS
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_quiz_answer_updated
  BEFORE UPDATE ON public.quiz_answers
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions
GRANT ALL ON TABLE public.quiz_answers TO postgres;
GRANT ALL ON TABLE public.quiz_answers TO service_role;
GRANT SELECT ON TABLE public.quiz_answers TO authenticated;
GRANT SELECT ON TABLE public.quiz_answers TO anon;


-- 13. user_progress Table
CREATE TABLE public.user_progress (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id uuid NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  quiz_id uuid NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  status text NOT NULL, -- e.g., 'not_started', 'in_progress', 'completed'
  score integer NULL, -- Percentage score for quizzes
  completed_at timestamptz NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT user_progress_module_unique UNIQUE (profile_id, module_id),
  CONSTRAINT user_progress_quiz_unique UNIQUE (profile_id, quiz_id),
  -- Ensure only one of module_id or quiz_id is set, or handle differently if progress applies to both simultaneously
  CONSTRAINT check_module_or_quiz CHECK (num_nonnulls(module_id, quiz_id) = 1)
);
-- Add comments
COMMENT ON TABLE public.user_progress IS 'Tracks user completion status and scores for modules/quizzes.';
-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
-- Create Trigger for updated_at
CREATE TRIGGER on_user_progress_updated
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
-- Grant permissions
GRANT ALL ON TABLE public.user_progress TO postgres;
GRANT ALL ON TABLE public.user_progress TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_progress TO authenticated; -- RLS policies will restrict
GRANT SELECT ON TABLE public.user_progress TO anon;

