-- WebCode Lab — server-side domain logic
-- These functions are the only write path for grading, progress and XP.

-- ---------------------------------------------------------------------------
-- Gamification helpers
-- ---------------------------------------------------------------------------

create or replace function public.level_for_xp(p_xp integer)
returns table (level integer, level_name text)
language sql
immutable
as $$
  select
    case
      when p_xp < 100 then 1
      when p_xp < 300 then 2
      when p_xp < 600 then 3
      else 4
    end,
    case
      when p_xp < 100 then 'Pemula'
      when p_xp < 300 then 'Menengah'
      when p_xp < 600 then 'Atasan'
      else 'Veteran'
    end;
$$;

create or replace function public.ensure_gamification_profile(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.gamification_profiles (student_id)
  values (p_student_id)
  on conflict (student_id) do nothing;
end;
$$;

create or replace function public.award_xp(
  p_student_id uuid,
  p_source_type text,
  p_source_id uuid,
  p_xp_amount integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_last date;
  v_next integer;
  v_level integer;
  v_level_name text;
begin
  if auth.uid() is distinct from p_student_id
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to award XP';
  end if;

  if p_xp_amount is null or p_xp_amount <= 0 then
    return;
  end if;

  insert into public.xp_transactions (student_id, source_type, source_id, xp_amount)
  values (p_student_id, p_source_type, p_source_id, p_xp_amount)
  on conflict (student_id, source_type, source_id) do nothing;

  if not found then
    return;
  end if;

  perform public.ensure_gamification_profile(p_student_id);

  select last_activity_date, total_xp
    into v_last, v_next
    from public.gamification_profiles
    where student_id = p_student_id;

  v_next := v_next + p_xp_amount;

  select l.level, l.level_name
    into v_level, v_level_name
    from public.level_for_xp(v_next) l;

  update public.gamification_profiles
  set
    total_xp = v_next,
    level = v_level,
    level_name = v_level_name,
    current_streak = case
      when v_last is null then 1
      when v_last = v_today then current_streak
      when v_last = v_today - 1 then current_streak + 1
      else 1
    end,
    last_activity_date = v_today,
    updated_at = now()
  where student_id = p_student_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Progress
-- ---------------------------------------------------------------------------

create or replace function public.recalculate_module_progress(
  p_student_id uuid,
  p_module_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_completed integer;
  v_percent integer;
begin
  select count(*) into v_total
  from public.lessons
  where module_id = p_module_id and is_published;

  select count(*) into v_completed
  from public.lesson_completions lc
  join public.lessons l on l.id = lc.lesson_id
  where lc.student_id = p_student_id
    and l.module_id = p_module_id
    and l.is_published;

  v_percent := case
    when v_total = 0 then 0
    else round(v_completed * 100.0 / v_total)::integer
  end;

  insert into public.student_progress (
    student_id, module_id, completed_lessons, total_lessons, progress_percent, completed_at
  )
  values (
    p_student_id,
    p_module_id,
    v_completed,
    v_total,
    v_percent,
    case when v_total > 0 and v_completed >= v_total then now() else null end
  )
  on conflict (student_id, module_id) do update
  set
    completed_lessons = excluded.completed_lessons,
    total_lessons = excluded.total_lessons,
    progress_percent = excluded.progress_percent,
    completed_at = excluded.completed_at,
    updated_at = now();
end;
$$;

create or replace function public.complete_lesson(p_lesson_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_module_id uuid;
  v_kind text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select l.module_id, l.kind
    into v_module_id, v_kind
    from public.lessons l
    join public.modules m on m.id = l.module_id
    where l.id = p_lesson_id and l.is_published and m.is_published;

  if not found then
    raise exception 'Lesson not found';
  end if;

  if v_kind = 'exercise' then
    raise exception 'Exercise lessons are completed by submitting the exercise';
  end if;

  insert into public.lesson_completions (student_id, lesson_id)
  values (v_uid, p_lesson_id)
  on conflict (student_id, lesson_id) do nothing;

  perform public.recalculate_module_progress(v_uid, v_module_id);

  return jsonb_build_object('lesson_id', p_lesson_id, 'module_id', v_module_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Exercise submissions (called by the submit-exercise edge function using the
-- service role after the server validated the submitted code)
-- ---------------------------------------------------------------------------

create or replace function public.record_exercise_submission(
  p_student_id uuid,
  p_exercise_id uuid,
  p_html text,
  p_css text,
  p_js text,
  p_is_correct boolean,
  p_feedback text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson_id uuid;
  v_module_id uuid;
  v_submission_id uuid;
  v_submitted_at timestamptz;
begin
  if auth.uid() is distinct from p_student_id
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to record this submission';
  end if;

  select e.lesson_id, l.module_id
    into v_lesson_id, v_module_id
    from public.exercises e
    join public.lessons l on l.id = e.lesson_id
    join public.modules m on m.id = l.module_id
    where e.id = p_exercise_id
      and e.is_published
      and l.is_published
      and m.is_published;

  if not found then
    raise exception 'Exercise not found';
  end if;

  insert into public.exercise_submissions (
    exercise_id, student_id, html_code, css_code, js_code, is_correct, feedback, submitted_at
  )
  values (
    p_exercise_id, p_student_id, p_html, p_css, p_js, p_is_correct, p_feedback, now()
  )
  on conflict (student_id, exercise_id) do update
  set
    html_code = excluded.html_code,
    css_code = excluded.css_code,
    js_code = excluded.js_code,
    is_correct = excluded.is_correct,
    feedback = excluded.feedback,
    submitted_at = now()
  returning id, submitted_at into v_submission_id, v_submitted_at;

  if p_is_correct then
    insert into public.lesson_completions (student_id, lesson_id)
    values (p_student_id, v_lesson_id)
    on conflict (student_id, lesson_id) do nothing;

    perform public.recalculate_module_progress(p_student_id, v_module_id);
    perform public.award_xp(p_student_id, 'exercise', p_exercise_id, 20);

    insert into public.student_badges (student_id, badge_id)
    values (p_student_id, 'first-solve')
    on conflict (student_id, badge_id) do nothing;
  end if;

  return jsonb_build_object(
    'id', v_submission_id,
    'exercise_id', p_exercise_id,
    'is_correct', p_is_correct,
    'feedback', p_feedback,
    'submitted_at', v_submitted_at
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Quizzes
-- ---------------------------------------------------------------------------

create or replace function public.start_quiz_attempt(p_quiz_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_quiz public.quizzes%rowtype;
  v_attempt public.quiz_attempts%rowtype;
  v_questions jsonb;
  v_expires timestamptz;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_quiz
  from public.quizzes
  where id = p_quiz_id and is_published;

  if not found then
    raise exception 'Quiz not found';
  end if;

  if v_quiz.deadline_at is not null and now() > v_quiz.deadline_at then
    raise exception 'The deadline for this quiz has passed';
  end if;

  update public.quiz_attempts
  set status = 'expired', submitted_at = now()
  where student_id = v_uid
    and quiz_id = p_quiz_id
    and status = 'in_progress'
    and expires_at is not null
    and expires_at < now();

  select * into v_attempt
  from public.quiz_attempts
  where student_id = v_uid
    and quiz_id = p_quiz_id
    and status = 'in_progress'
  order by started_at desc
  limit 1;

  if not found then
    v_expires := case
      when v_quiz.duration_minutes is null then null
      else now() + make_interval(mins => v_quiz.duration_minutes)
    end;

    if v_quiz.deadline_at is not null then
      v_expires := least(coalesce(v_expires, v_quiz.deadline_at), v_quiz.deadline_at);
    end if;

    insert into public.quiz_attempts (quiz_id, student_id, started_at, expires_at)
    values (p_quiz_id, v_uid, now(), v_expires)
    returning * into v_attempt;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', q.id,
        'question_text', q.question_text,
        'options', q.options,
        'points', q.points,
        'order_index', q.order_index
      )
      order by q.order_index, q.id
    ),
    '[]'::jsonb
  )
  into v_questions
  from public.quiz_questions q
  where q.quiz_id = p_quiz_id;

  return jsonb_build_object(
    'attempt_id', v_attempt.id,
    'quiz', jsonb_build_object(
      'id', v_quiz.id,
      'title', v_quiz.title,
      'description', v_quiz.description,
      'duration_minutes', v_quiz.duration_minutes,
      'deadline_at', v_quiz.deadline_at
    ),
    'questions', v_questions,
    'started_at', v_attempt.started_at,
    'expires_at', v_attempt.expires_at
  );
end;
$$;

create or replace function public.submit_quiz_attempt(p_attempt_id uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_attempt public.quiz_attempts%rowtype;
  v_count integer;
  v_total integer;
  v_earned integer;
  v_score integer;
  v_review jsonb;
  v_quiz_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_attempt
  from public.quiz_attempts
  where id = p_attempt_id and student_id = v_uid
  for update;

  if not found then
    raise exception 'Attempt not found';
  end if;

  if v_attempt.status <> 'in_progress' then
    raise exception 'This attempt has already been submitted';
  end if;

  if v_attempt.expires_at is not null and now() > v_attempt.expires_at then
    update public.quiz_attempts
    set status = 'expired', submitted_at = now()
    where id = p_attempt_id;
    raise exception 'Time is up';
  end if;

  v_quiz_id := v_attempt.quiz_id;

  select count(*), coalesce(sum(points), 0)
    into v_count, v_total
    from public.quiz_questions
    where quiz_id = v_quiz_id;

  if jsonb_typeof(p_answers) is distinct from 'array'
     or jsonb_array_length(p_answers) <> v_count then
    raise exception 'Answers must be an array with one entry per question';
  end if;

  if exists (
    select 1
    from (
      select options, (row_number() over (order by order_index, id) - 1) as idx
      from public.quiz_questions
      where quiz_id = v_quiz_id
    ) q
    where (p_answers ->> q.idx) is null
       or (p_answers ->> q.idx) !~ '^[0-9]+$'
       or (p_answers ->> q.idx)::integer < 0
       or (p_answers ->> q.idx)::integer >= jsonb_array_length(q.options)
  ) then
    raise exception 'One or more answers are invalid';
  end if;

  select coalesce(sum(
    case
      when (p_answers ->> q.idx)::integer = q.correct_index then q.points
      else 0
    end
  ), 0)
  into v_earned
  from (
    select correct_index, points, (row_number() over (order by order_index, id) - 1) as idx
    from public.quiz_questions
    where quiz_id = v_quiz_id
  ) q;

  v_score := case
    when v_total > 0 then round(v_earned * 100.0 / v_total)::integer
    else 0
  end;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'question_id', q.id,
        'chosen_index', (p_answers ->> q.idx)::integer,
        'correct_index', q.correct_index,
        'is_correct', (p_answers ->> q.idx)::integer = q.correct_index,
        'points', q.points
      )
      order by q.idx
    ),
    '[]'::jsonb
  )
  into v_review
  from (
    select id, correct_index, points, (row_number() over (order by order_index, id) - 1) as idx
    from public.quiz_questions
    where quiz_id = v_quiz_id
  ) q;

  update public.quiz_attempts
  set answers = p_answers, score = v_score, status = 'submitted', submitted_at = now()
  where id = p_attempt_id;

  perform public.award_xp(v_uid, 'quiz', v_quiz_id, round(v_score * 0.5)::integer);

  if v_score = 100 then
    insert into public.student_badges (student_id, badge_id)
    values (v_uid, 'quiz-ace')
    on conflict (student_id, badge_id) do nothing;
  end if;

  return jsonb_build_object(
    'attempt_id', p_attempt_id,
    'score', v_score,
    'earned_points', v_earned,
    'total_points', v_total,
    'review', v_review
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------

create or replace function public.submit_project(
  p_project_id uuid,
  p_url text,
  p_text text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_project public.projects%rowtype;
  v_submission public.project_submissions%rowtype;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if coalesce(trim(p_url), '') = '' and coalesce(trim(p_text), '') = '' then
    raise exception 'Provide a project URL or a text submission';
  end if;

  if length(coalesce(p_url, '')) > 2048 then
    raise exception 'Project URL is too long';
  end if;

  if length(coalesce(p_text, '')) > 20000 then
    raise exception 'Project text is too long';
  end if;

  if coalesce(trim(p_url), '') <> '' and p_url !~* '^https?://' then
    raise exception 'Project URL must start with http:// or https://';
  end if;

  select * into v_project
  from public.projects
  where id = p_project_id and is_published;

  if not found then
    raise exception 'Project not found';
  end if;

  if v_project.deadline_at is not null and now() > v_project.deadline_at then
    raise exception 'The deadline for this project has passed';
  end if;

  insert into public.project_submissions (
    project_id, student_id, submission_url, submission_text, submitted_at
  )
  values (
    p_project_id, v_uid, nullif(trim(p_url), ''), nullif(trim(p_text), ''), now()
  )
  on conflict (student_id, project_id) do update
  set
    submission_url = excluded.submission_url,
    submission_text = excluded.submission_text,
    submitted_at = now()
  returning * into v_submission;

  perform public.award_xp(v_uid, 'project', p_project_id, 50);

  insert into public.student_badges (student_id, badge_id)
  values (v_uid, 'project-builder')
  on conflict (student_id, badge_id) do nothing;

  return to_jsonb(v_submission);
end;
$$;

-- ---------------------------------------------------------------------------
-- Lecturer authoring
-- ---------------------------------------------------------------------------

create or replace function public.save_quiz(p_quiz jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_quiz_id uuid;
  v_questions jsonb := coalesce(p_quiz -> 'questions', '[]'::jsonb);
  v_question jsonb;
  v_index integer := 0;
  v_module_id uuid;
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can manage quizzes';
  end if;

  if coalesce(trim(p_quiz ->> 'title'), '') = '' then
    raise exception 'Quiz title is required';
  end if;

  v_module_id := (p_quiz ->> 'module_id')::uuid;

  if not exists (select 1 from public.modules where id = v_module_id) then
    raise exception 'Module not found';
  end if;

  if jsonb_typeof(v_questions) <> 'array' or jsonb_array_length(v_questions) = 0 then
    raise exception 'A quiz must contain at least one question';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_questions) q
    where coalesce(trim(q ->> 'question_text'), '') = ''
       or jsonb_typeof(q -> 'options') is distinct from 'array'
       or jsonb_array_length(q -> 'options') < 2
       or coalesce((q ->> 'correct_index')::integer, -1) < 0
       or coalesce((q ->> 'correct_index')::integer, -1) >= jsonb_array_length(q -> 'options')
       or coalesce((q ->> 'points')::integer, 0) <= 0
  ) then
    raise exception 'Each question needs text, at least two options, a valid answer and positive points';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_questions) q,
         jsonb_array_elements(q -> 'options') o
    where jsonb_typeof(o) <> 'string'
       or trim(o #>> '{}') = ''
  ) then
    raise exception 'Options must be non-empty strings';
  end if;

  if nullif(p_quiz ->> 'id', '') is not null then
    v_quiz_id := (p_quiz ->> 'id')::uuid;

    update public.quizzes
    set
      module_id = v_module_id,
      title = trim(p_quiz ->> 'title'),
      description = coalesce(p_quiz ->> 'description', ''),
      duration_minutes = nullif(p_quiz ->> 'duration_minutes', '')::integer,
      deadline_at = nullif(p_quiz ->> 'deadline_at', '')::timestamptz,
      is_published = coalesce((p_quiz ->> 'is_published')::boolean, false)
    where id = v_quiz_id;

    if not found then
      raise exception 'Quiz not found';
    end if;
  else
    insert into public.quizzes (
      module_id, title, description, duration_minutes, deadline_at, is_published, created_by
    )
    values (
      v_module_id,
      trim(p_quiz ->> 'title'),
      coalesce(p_quiz ->> 'description', ''),
      nullif(p_quiz ->> 'duration_minutes', '')::integer,
      nullif(p_quiz ->> 'deadline_at', '')::timestamptz,
      coalesce((p_quiz ->> 'is_published')::boolean, false),
      v_uid
    )
    returning id into v_quiz_id;
  end if;

  delete from public.quiz_questions where quiz_id = v_quiz_id;

  for v_question in select * from jsonb_array_elements(v_questions)
  loop
    insert into public.quiz_questions (
      quiz_id, question_text, options, correct_index, points, order_index
    )
    values (
      v_quiz_id,
      trim(v_question ->> 'question_text'),
      v_question -> 'options',
      (v_question ->> 'correct_index')::integer,
      (v_question ->> 'points')::integer,
      v_index
    );

    v_index := v_index + 1;
  end loop;

  return v_quiz_id;
end;
$$;

create or replace function public.save_module(p_module jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_title text := trim(coalesce(p_module ->> 'title', ''));
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can manage modules';
  end if;

  if v_title = '' then
    raise exception 'Module title is required';
  end if;

  if nullif(p_module ->> 'id', '') is not null then
    v_id := (p_module ->> 'id')::uuid;

    update public.modules
    set
      title = v_title,
      description = coalesce(p_module ->> 'description', ''),
      order_index = coalesce((p_module ->> 'order_index')::integer, 0),
      is_published = coalesce((p_module ->> 'is_published')::boolean, false)
    where id = v_id;

    if not found then
      raise exception 'Module not found';
    end if;
  else
    insert into public.modules (title, description, order_index, is_published, created_by)
    values (
      v_title,
      coalesce(p_module ->> 'description', ''),
      coalesce((p_module ->> 'order_index')::integer, 0),
      coalesce((p_module ->> 'is_published')::boolean, false),
      v_uid
    )
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

create or replace function public.save_lesson(p_lesson jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson_id uuid;
  v_module_id uuid := (p_lesson ->> 'module_id')::uuid;
  v_kind text := coalesce(p_lesson ->> 'kind', 'material');
  v_exercise jsonb := p_lesson -> 'exercise';
  v_title text := trim(coalesce(p_lesson ->> 'title', ''));
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can manage lessons';
  end if;

  if v_title = '' then
    raise exception 'Lesson title is required';
  end if;

  if not exists (select 1 from public.modules where id = v_module_id) then
    raise exception 'Module not found';
  end if;

  if v_kind not in ('material', 'exercise') then
    raise exception 'Invalid lesson kind';
  end if;

  if nullif(p_lesson ->> 'id', '') is not null then
    v_lesson_id := (p_lesson ->> 'id')::uuid;

    update public.lessons
    set
      module_id = v_module_id,
      title = v_title,
      content = coalesce(p_lesson ->> 'content', ''),
      video_url = nullif(trim(p_lesson ->> 'video_url'), ''),
      kind = v_kind,
      order_index = coalesce((p_lesson ->> 'order_index')::integer, 0),
      is_published = coalesce((p_lesson ->> 'is_published')::boolean, true)
    where id = v_lesson_id;

    if not found then
      raise exception 'Lesson not found';
    end if;
  else
    insert into public.lessons (
      module_id, title, content, video_url, kind, order_index, is_published
    )
    values (
      v_module_id,
      v_title,
      coalesce(p_lesson ->> 'content', ''),
      nullif(trim(p_lesson ->> 'video_url'), ''),
      v_kind,
      coalesce((p_lesson ->> 'order_index')::integer, 0),
      coalesce((p_lesson ->> 'is_published')::boolean, true)
    )
    returning id into v_lesson_id;
  end if;

  if v_kind = 'exercise' then
    if v_exercise is null or jsonb_typeof(v_exercise) <> 'object' then
      raise exception 'Exercise details are required for exercise lessons';
    end if;

    if trim(coalesce(v_exercise ->> 'title', '')) = '' then
      raise exception 'Exercise title is required';
    end if;

    insert into public.exercises (
      lesson_id, title, instructions, starter_html, starter_css, starter_js,
      hint, validator_config, order_index, is_published
    )
    values (
      v_lesson_id,
      trim(v_exercise ->> 'title'),
      coalesce(v_exercise ->> 'instructions', ''),
      coalesce(v_exercise ->> 'starter_html', ''),
      coalesce(v_exercise ->> 'starter_css', ''),
      coalesce(v_exercise ->> 'starter_js', ''),
      coalesce(v_exercise ->> 'hint', ''),
      coalesce(v_exercise -> 'validator_config', '{}'::jsonb),
      0,
      coalesce((v_exercise ->> 'is_published')::boolean, true)
    )
    on conflict (lesson_id) do update
    set
      title = excluded.title,
      instructions = excluded.instructions,
      starter_html = excluded.starter_html,
      starter_css = excluded.starter_css,
      starter_js = excluded.starter_js,
      hint = excluded.hint,
      validator_config = excluded.validator_config,
      is_published = excluded.is_published;
  else
    delete from public.exercises where lesson_id = v_lesson_id;
  end if;

  return v_lesson_id;
end;
$$;

create or replace function public.delete_lesson(p_lesson_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can manage lessons';
  end if;

  delete from public.lessons where id = p_lesson_id;

  if not found then
    raise exception 'Lesson not found';
  end if;
end;
$$;

create or replace function public.delete_module(p_module_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can manage modules';
  end if;

  delete from public.modules where id = p_module_id;

  if not found then
    raise exception 'Module not found';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- AI rate limiting (called by edge functions with the student's JWT)
-- ---------------------------------------------------------------------------

create or replace function public.check_ai_rate_limit(
  p_kind text,
  p_limit integer default 20,
  p_window_minutes integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select count(*) into v_count
  from public.ai_requests
  where student_id = v_uid
    and kind = p_kind
    and created_at > now() - make_interval(mins => p_window_minutes);

  if v_count >= p_limit then
    return false;
  end if;

  insert into public.ai_requests (student_id, kind) values (v_uid, p_kind);
  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

revoke all on function public.is_lecturer() from public;
grant execute on function public.is_lecturer() to authenticated, anon;

revoke all on function public.level_for_xp(integer) from public;
grant execute on function public.level_for_xp(integer) to service_role;

revoke all on function public.ensure_gamification_profile(uuid) from public;
grant execute on function public.ensure_gamification_profile(uuid) to service_role;

revoke all on function public.recalculate_module_progress(uuid, uuid) from public;
grant execute on function public.recalculate_module_progress(uuid, uuid) to service_role;

revoke all on function public.award_xp(uuid, text, uuid, integer) from public, anon, authenticated;
grant execute on function public.award_xp(uuid, text, uuid, integer) to service_role;

revoke all on function public.complete_lesson(uuid) from public, anon;
grant execute on function public.complete_lesson(uuid) to authenticated;

revoke all on function public.record_exercise_submission(uuid, uuid, text, text, text, boolean, text) from public, anon, authenticated;
grant execute on function public.record_exercise_submission(uuid, uuid, text, text, text, boolean, text) to service_role;

revoke all on function public.start_quiz_attempt(uuid) from public, anon;
grant execute on function public.start_quiz_attempt(uuid) to authenticated;

revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public, anon;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;

revoke all on function public.submit_project(uuid, text, text) from public, anon;
grant execute on function public.submit_project(uuid, text, text) to authenticated;

revoke all on function public.save_quiz(jsonb) from public, anon;
grant execute on function public.save_quiz(jsonb) to authenticated;

revoke all on function public.save_module(jsonb) from public, anon;
grant execute on function public.save_module(jsonb) to authenticated;

revoke all on function public.save_lesson(jsonb) from public, anon;
grant execute on function public.save_lesson(jsonb) to authenticated;

revoke all on function public.delete_lesson(uuid) from public, anon;
grant execute on function public.delete_lesson(uuid) to authenticated;

revoke all on function public.delete_module(uuid) from public, anon;
grant execute on function public.delete_module(uuid) to authenticated;

revoke all on function public.check_ai_rate_limit(text, integer, integer) from public, anon;
grant execute on function public.check_ai_rate_limit(text, integer, integer) to authenticated;
