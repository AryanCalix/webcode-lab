-- WebCode Lab — Row Level Security
-- Students may only read their own learner data. Lecturers may read class data
-- and manage learning content. Writes that affect XP, grading, or progress are
-- only possible through the SECURITY DEFINER functions in 20261110000300.

alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_submissions enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.student_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.projects enable row level security;
alter table public.project_submissions enable row level security;
alter table public.forum_threads enable row level security;
alter table public.forum_replies enable row level security;
alter table public.gamification_profiles enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.badges enable row level security;
alter table public.student_badges enable row level security;
alter table public.ai_requests enable row level security;

-- Profiles: names/roles are class-visible, but only the owner (or a lecturer)
-- may update a profile. Role changes are additionally guarded by a trigger.
create policy "profiles_select_authenticated"
  on public.profiles for select to authenticated
  using (true);

create policy "profiles_update_own_or_lecturer"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_lecturer())
  with check (id = auth.uid() or public.is_lecturer());

-- Modules and lessons
create policy "modules_select_published_or_lecturer"
  on public.modules for select to authenticated
  using (is_published or public.is_lecturer());

create policy "modules_insert_lecturer"
  on public.modules for insert to authenticated
  with check (public.is_lecturer());

create policy "modules_update_lecturer"
  on public.modules for update to authenticated
  using (public.is_lecturer())
  with check (public.is_lecturer());

create policy "modules_delete_lecturer"
  on public.modules for delete to authenticated
  using (public.is_lecturer());

create policy "lessons_select_published_or_lecturer"
  on public.lessons for select to authenticated
  using (
    public.is_lecturer()
    or (
      is_published
      and exists (
        select 1 from public.modules m
        where m.id = lessons.module_id and m.is_published
      )
    )
  );

create policy "lessons_insert_lecturer"
  on public.lessons for insert to authenticated
  with check (public.is_lecturer());

create policy "lessons_update_lecturer"
  on public.lessons for update to authenticated
  using (public.is_lecturer())
  with check (public.is_lecturer());

create policy "lessons_delete_lecturer"
  on public.lessons for delete to authenticated
  using (public.is_lecturer());

-- Exercises
create policy "exercises_select_published_or_lecturer"
  on public.exercises for select to authenticated
  using (
    public.is_lecturer()
    or (
      is_published
      and exists (
        select 1
        from public.lessons l
        join public.modules m on m.id = l.module_id
        where l.id = exercises.lesson_id
          and l.is_published
          and m.is_published
      )
    )
  );

create policy "exercises_insert_lecturer"
  on public.exercises for insert to authenticated
  with check (public.is_lecturer());

create policy "exercises_update_lecturer"
  on public.exercises for update to authenticated
  using (public.is_lecturer())
  with check (public.is_lecturer());

create policy "exercises_delete_lecturer"
  on public.exercises for delete to authenticated
  using (public.is_lecturer());

-- Learner-owned read-only tables (writes go through functions)
create policy "exercise_submissions_select_own_or_lecturer"
  on public.exercise_submissions for select to authenticated
  using (student_id = auth.uid() or public.is_lecturer());

create policy "lesson_completions_select_own_or_lecturer"
  on public.lesson_completions for select to authenticated
  using (student_id = auth.uid() or public.is_lecturer());

create policy "student_progress_select_own_or_lecturer"
  on public.student_progress for select to authenticated
  using (student_id = auth.uid() or public.is_lecturer());

create policy "quiz_attempts_select_own_or_lecturer"
  on public.quiz_attempts for select to authenticated
  using (student_id = auth.uid() or public.is_lecturer());

create policy "project_submissions_select_own_or_lecturer"
  on public.project_submissions for select to authenticated
  using (student_id = auth.uid() or public.is_lecturer());

create policy "gamification_profiles_select_own_or_lecturer"
  on public.gamification_profiles for select to authenticated
  using (student_id = auth.uid() or public.is_lecturer());

create policy "xp_transactions_select_own_or_lecturer"
  on public.xp_transactions for select to authenticated
  using (student_id = auth.uid() or public.is_lecturer());

create policy "student_badges_select_own_or_lecturer"
  on public.student_badges for select to authenticated
  using (student_id = auth.uid() or public.is_lecturer());

-- Quizzes
create policy "quizzes_select_published_or_lecturer"
  on public.quizzes for select to authenticated
  using (
    public.is_lecturer()
    or (
      is_published
      and exists (
        select 1 from public.modules m
        where m.id = quizzes.module_id and m.is_published
      )
    )
  );

create policy "quizzes_insert_lecturer"
  on public.quizzes for insert to authenticated
  with check (public.is_lecturer());

create policy "quizzes_update_lecturer"
  on public.quizzes for update to authenticated
  using (public.is_lecturer())
  with check (public.is_lecturer());

create policy "quizzes_delete_lecturer"
  on public.quizzes for delete to authenticated
  using (public.is_lecturer());

-- Answer keys are never readable by students. Students receive a safe payload
-- from public.start_quiz_attempt() instead.
create policy "quiz_questions_select_lecturer"
  on public.quiz_questions for select to authenticated
  using (public.is_lecturer());

create policy "quiz_questions_insert_lecturer"
  on public.quiz_questions for insert to authenticated
  with check (public.is_lecturer());

create policy "quiz_questions_update_lecturer"
  on public.quiz_questions for update to authenticated
  using (public.is_lecturer())
  with check (public.is_lecturer());

create policy "quiz_questions_delete_lecturer"
  on public.quiz_questions for delete to authenticated
  using (public.is_lecturer());

-- Projects
create policy "projects_select_published_or_lecturer"
  on public.projects for select to authenticated
  using (
    public.is_lecturer()
    or (
      is_published
      and exists (
        select 1 from public.modules m
        where m.id = projects.module_id and m.is_published
      )
    )
  );

create policy "projects_insert_lecturer"
  on public.projects for insert to authenticated
  with check (public.is_lecturer());

create policy "projects_update_lecturer"
  on public.projects for update to authenticated
  using (public.is_lecturer())
  with check (public.is_lecturer());

create policy "projects_delete_lecturer"
  on public.projects for delete to authenticated
  using (public.is_lecturer());

-- Forum
create policy "forum_threads_select_authenticated"
  on public.forum_threads for select to authenticated
  using (true);

create policy "forum_threads_insert_own"
  on public.forum_threads for insert to authenticated
  with check (author_id = auth.uid());

create policy "forum_threads_update_own_or_lecturer"
  on public.forum_threads for update to authenticated
  using (author_id = auth.uid() or public.is_lecturer())
  with check (author_id = auth.uid() or public.is_lecturer());

create policy "forum_threads_delete_own_or_lecturer"
  on public.forum_threads for delete to authenticated
  using (author_id = auth.uid() or public.is_lecturer());

create policy "forum_replies_select_authenticated"
  on public.forum_replies for select to authenticated
  using (true);

create policy "forum_replies_insert_own"
  on public.forum_replies for insert to authenticated
  with check (author_id = auth.uid());

create policy "forum_replies_update_own_or_lecturer"
  on public.forum_replies for update to authenticated
  using (author_id = auth.uid() or public.is_lecturer())
  with check (author_id = auth.uid() or public.is_lecturer());

create policy "forum_replies_delete_own_or_lecturer"
  on public.forum_replies for delete to authenticated
  using (author_id = auth.uid() or public.is_lecturer());

-- Badges
create policy "badges_select_authenticated"
  on public.badges for select to authenticated
  using (true);

-- ai_requests intentionally has RLS enabled with no policies: only the
-- service role (edge functions) may insert/read rate-limit rows.
