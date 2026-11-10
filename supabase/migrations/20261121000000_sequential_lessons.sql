-- WebCode Lab — sequential lessons and progress integrity
-- Students must finish lessons in order. Quizzes and projects unlock only
-- after every published lesson in the module is complete.

create or replace function public.assert_lesson_unlocked(
  p_lesson_id uuid,
  p_student_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_module_id uuid;
  v_order integer;
begin
  select module_id, order_index
    into v_module_id, v_order
    from public.lessons
    where id = p_lesson_id and is_published;

  if not found then
    raise exception 'Lesson not found';
  end if;

  if exists (
    select 1
    from public.lessons l
    where l.module_id = v_module_id
      and l.is_published
      and (l.order_index, l.id) < (v_order, p_lesson_id)
      and not exists (
        select 1
        from public.lesson_completions lc
        where lc.student_id = p_student_id
          and lc.lesson_id = l.id
      )
  ) then
    raise exception 'Selesaikan pelajaran sebelumnya terlebih dahulu';
  end if;
end;
$$;

create or replace function public.assert_module_lessons_completed(
  p_module_id uuid,
  p_student_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.lessons l
    where l.module_id = p_module_id
      and l.is_published
      and not exists (
        select 1
        from public.lesson_completions lc
        where lc.student_id = p_student_id
          and lc.lesson_id = l.id
      )
  ) then
    raise exception 'Selesaikan semua pelajaran modul ini terlebih dahulu';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- complete_lesson: enforce the sequence
-- ---------------------------------------------------------------------------
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

  if not exists (
    select 1 from public.lesson_completions
    where student_id = v_uid and lesson_id = p_lesson_id
  ) then
    perform public.assert_lesson_unlocked(p_lesson_id, v_uid);
  end if;

  insert into public.lesson_completions (student_id, lesson_id)
  values (v_uid, p_lesson_id)
  on conflict (student_id, lesson_id) do nothing;

  perform public.recalculate_module_progress(v_uid, v_module_id);

  return jsonb_build_object('lesson_id', p_lesson_id, 'module_id', v_module_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- record_exercise_submission: enforce the sequence (called by edge function)
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

  if not exists (
    select 1 from public.lesson_completions
    where student_id = p_student_id and lesson_id = v_lesson_id
  ) then
    perform public.assert_lesson_unlocked(v_lesson_id, p_student_id);
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
-- start_quiz_attempt: quiz must belong to a published module and all lessons
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

  if not exists (
    select 1 from public.modules
    where id = v_quiz.module_id and is_published
  ) then
    raise exception 'Quiz not found';
  end if;

  perform public.assert_module_lessons_completed(v_quiz.module_id, v_uid);

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

-- ---------------------------------------------------------------------------
-- submit_project: project must belong to a published module and all lessons
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

  if not exists (
    select 1 from public.modules
    where id = v_project.module_id and is_published
  ) then
    raise exception 'Project not found';
  end if;

  perform public.assert_module_lessons_completed(v_project.module_id, v_uid);

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
-- Block quiz edits while a student is still working on an attempt
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

    if exists (
      select 1 from public.quiz_attempts
      where quiz_id = v_quiz_id and status = 'in_progress'
    ) then
      raise exception 'Tidak dapat mengubah kuis saat ada mahasiswa yang sedang mengerjakan';
    end if;

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

-- ---------------------------------------------------------------------------
-- Keep student progress in sync when lesson content changes
-- ---------------------------------------------------------------------------
create or replace function public.recalculate_module_progress_for_all(p_module_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
begin
  for v_student_id in
    select student_id from public.student_progress where module_id = p_module_id
    union
    select distinct lc.student_id
    from public.lesson_completions lc
    join public.lessons l on l.id = lc.lesson_id
    where l.module_id = p_module_id
  loop
    perform public.recalculate_module_progress(v_student_id, p_module_id);
  end loop;
end;
$$;

create or replace function public.handle_lesson_progress_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_module_progress_for_all(old.module_id);
    return old;
  end if;

  perform public.recalculate_module_progress_for_all(new.module_id);

  if tg_op = 'UPDATE' and new.module_id is distinct from old.module_id then
    perform public.recalculate_module_progress_for_all(old.module_id);
  end if;

  return new;
end;
$$;

drop trigger if exists lessons_progress_change on public.lessons;
create trigger lessons_progress_change
  after insert or update or delete on public.lessons
  for each row execute function public.handle_lesson_progress_change();

revoke all on function public.assert_lesson_unlocked(uuid, uuid) from public, anon, authenticated;
revoke all on function public.assert_module_lessons_completed(uuid, uuid) from public, anon, authenticated;
revoke all on function public.recalculate_module_progress_for_all(uuid) from public, anon, authenticated;
revoke all on function public.handle_lesson_progress_change() from public, anon, authenticated;
