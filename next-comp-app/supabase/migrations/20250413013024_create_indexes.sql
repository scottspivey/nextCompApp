-- Recommended Indexes for Supabase Schema

-- Foreign Key Indexes (Crucial for JOIN performance)
-- Indexing profile_id in tables where it's frequently used for filtering user-specific data
CREATE INDEX idx_injured_workers_profile_id ON public.injured_workers (profile_id);
CREATE INDEX idx_claims_profile_id ON public.claims (profile_id);
CREATE INDEX idx_saved_calculations_profile_id ON public.saved_calculations (profile_id);
CREATE INDEX idx_notes_profile_id ON public.notes (profile_id);
CREATE INDEX idx_user_progress_profile_id ON public.user_progress (profile_id);

-- Indexing relationships between core entities
CREATE INDEX idx_claims_injured_worker_id ON public.claims (injured_worker_id);
CREATE INDEX idx_saved_calculations_claim_id ON public.saved_calculations (claim_id);
CREATE INDEX idx_saved_calculations_injured_worker_id ON public.saved_calculations (injured_worker_id);
CREATE INDEX idx_notes_injured_worker_id ON public.notes (injured_worker_id);
CREATE INDEX idx_notes_claim_id ON public.notes (claim_id);

-- Indexing relationships in training module tables
CREATE INDEX idx_modules_course_id ON public.modules (course_id);
CREATE INDEX idx_quizzes_module_id ON public.quizzes (module_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions (quiz_id);
CREATE INDEX idx_quiz_answers_question_id ON public.quiz_answers (question_id);

-- Indexes for Frequently Filtered/Sorted Columns
-- For finding workers by name (often combined with profile_id)
CREATE INDEX idx_injured_workers_last_name ON public.injured_workers (last_name);
-- Consider a composite index if you frequently search by profile_id AND last_name
-- CREATE INDEX idx_injured_workers_profile_last_name ON public.injured_workers (profile_id, last_name);

-- For finding claims by date or file number
CREATE INDEX idx_claims_date_of_injury ON public.claims (date_of_injury);
CREATE INDEX idx_claims_wcc_file_number ON public.claims (wcc_file_number); -- If frequently searched

-- For sorting/filtering notes by creation date
CREATE INDEX idx_notes_created_at ON public.notes (created_at);

-- For sorting/filtering saved calculations by creation date
CREATE INDEX idx_saved_calculations_created_at ON public.saved_calculations (created_at);

-- For filtering published courses/modules (if done frequently on large sets)
CREATE INDEX idx_courses_published ON public.courses (published);
CREATE INDEX idx_modules_published ON public.modules (published);

-- For sorting modules within a course
CREATE INDEX idx_modules_order ON public.modules ("order");
-- Consider a composite index if you always query order within a course
-- CREATE INDEX idx_modules_course_order ON public.modules (course_id, "order");

-- For finding recent workers (if last_accessed_at is used for sorting)
CREATE INDEX idx_injured_workers_last_accessed_at ON public.injured_workers (last_accessed_at DESC NULLS LAST); -- Example for sorting recent first

-- Note: Indexes for PRIMARY KEYs (like table 'id' columns) and UNIQUE constraints
-- (like profiles.user_id, subscriptions.user_id, courses.title) are typically created automatically.
-- The rate_settings primary key (year, rate_type) is also automatically indexed.

