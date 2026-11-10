-- WebCode Lab — initial schema
-- All domain tables live in `public`; auth users live in `auth.users`.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student' check (role in ('student', 'lecturer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  order_index integer not null default 0,
  is_published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  content text not null default '',
  video_url text,
  kind text not null default 'material' check (kind in ('material', 'exercise')),
  order_index integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  instructions text not null default '',
  starter_html text not null default '',
  starter_css text not null default '',
  starter_js text not null default '',
  hint text not null default '',
  validator_config jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id)
);

create table public.exercise_submissions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  html_code text not null default '',
  css_code text not null default '',
  js_code text not null default '',
  is_correct boolean not null default false,
  feedback text not null default '',
  submitted_at timestamptz not null default now(),
  unique (student_id, exercise_id)
);

create table public.lesson_completions (
  student_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

create table public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  module_id uuid not null references public.modules (id) on delete cascade,
  completed_lessons integer not null default 0,
  total_lessons integer not null default 0,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (student_id, module_id)
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  description text not null default '',
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  deadline_at timestamptz,
  is_published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question_text text not null,
  question_type text not null default 'multiple_choice' check (question_type in ('multiple_choice')),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) >= 2),
  correct_index integer not null check (correct_index >= 0),
  points integer not null default 100 check (points > 0),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  answers jsonb,
  score integer,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'expired')),
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  submitted_at timestamptz
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  description text not null default '',
  deadline_at timestamptz,
  is_published boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  submission_url text,
  submission_text text,
  score integer,
  feedback text,
  submitted_at timestamptz not null default now(),
  unique (student_id, project_id)
);

create table public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.forum_threads (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.gamification_profiles (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  total_xp integer not null default 0 check (total_xp >= 0),
  level integer not null default 1,
  level_name text not null default 'Pemula',
  current_streak integer not null default 0 check (current_streak >= 0),
  last_activity_date date,
  updated_at timestamptz not null default now()
);

create table public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  source_type text not null,
  source_id uuid not null,
  xp_amount integer not null check (xp_amount > 0),
  created_at timestamptz not null default now(),
  unique (student_id, source_type, source_id)
);

create table public.badges (
  id text primary key,
  name text not null,
  description text not null default ''
);

create table public.student_badges (
  student_id uuid not null references public.profiles (id) on delete cascade,
  badge_id text not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (student_id, badge_id)
);

create table public.ai_requests (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);

create index modules_order_idx on public.modules (order_index);
create index lessons_module_idx on public.lessons (module_id, order_index);
create index exercises_lesson_idx on public.exercises (lesson_id);
create index exercise_submissions_student_idx on public.exercise_submissions (student_id);
create index lesson_completions_student_idx on public.lesson_completions (student_id);
create index student_progress_student_idx on public.student_progress (student_id);
create index quizzes_module_idx on public.quizzes (module_id);
create index quiz_questions_quiz_idx on public.quiz_questions (quiz_id, order_index);
create index quiz_attempts_student_idx on public.quiz_attempts (student_id, quiz_id);
create index projects_module_idx on public.projects (module_id);
create index project_submissions_student_idx on public.project_submissions (student_id);
create index forum_threads_created_idx on public.forum_threads (created_at desc);
create index forum_replies_thread_idx on public.forum_replies (thread_id, created_at);
create index xp_transactions_student_idx on public.xp_transactions (student_id, created_at desc);
create index ai_requests_student_idx on public.ai_requests (student_id, created_at desc);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger modules_set_updated_at before update on public.modules
  for each row execute function public.set_updated_at();
create trigger lessons_set_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();
create trigger exercises_set_updated_at before update on public.exercises
  for each row execute function public.set_updated_at();
create trigger quizzes_set_updated_at before update on public.quizzes
  for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger forum_threads_set_updated_at before update on public.forum_threads
  for each row execute function public.set_updated_at();
create trigger gamification_profiles_set_updated_at before update on public.gamification_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth helpers and profile bootstrap
-- ---------------------------------------------------------------------------

create or replace function public.is_lecturer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'lecturer'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    'student'
  )
  on conflict (id) do nothing;

  insert into public.gamification_profiles (student_id)
  values (new.id)
  on conflict (student_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if coalesce(auth.role(), '') <> 'service_role' and not public.is_lecturer() then
      raise exception 'Only lecturers can change roles';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_profile_role();
