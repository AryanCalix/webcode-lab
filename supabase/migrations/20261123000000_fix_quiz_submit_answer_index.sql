-- The answer index from row_number() is bigint, and Postgres has no
-- jsonb ->> bigint operator. Cast it to integer before indexing the array.
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
    where (p_answers ->> q.idx::integer) is null
       or (p_answers ->> q.idx::integer) !~ '^[0-9]+$'
       or (p_answers ->> q.idx::integer)::integer < 0
       or (p_answers ->> q.idx::integer)::integer >= jsonb_array_length(q.options)
  ) then
    raise exception 'One or more answers are invalid';
  end if;

  select coalesce(sum(
    case
      when (p_answers ->> q.idx::integer)::integer = q.correct_index then q.points
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
        'chosen_index', (p_answers ->> q.idx::integer)::integer,
        'correct_index', q.correct_index,
        'is_correct', (p_answers ->> q.idx::integer)::integer = q.correct_index,
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

revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public, anon;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;
