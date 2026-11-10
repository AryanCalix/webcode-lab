-- WebCode Lab — lecturer project authoring and grading
-- Projects were previously seed-only. Lecturers can now create them and
-- grade the submissions (0–100) with written feedback.

create or replace function public.save_project(p_project jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_module_id uuid := (p_project ->> 'module_id')::uuid;
  v_project_id uuid;
  v_title text := trim(coalesce(p_project ->> 'title', ''));
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can manage projects';
  end if;

  if v_title = '' then
    raise exception 'Project title is required';
  end if;

  if not exists (select 1 from public.modules where id = v_module_id) then
    raise exception 'Module not found';
  end if;

  if nullif(p_project ->> 'id', '') is not null then
    v_project_id := (p_project ->> 'id')::uuid;

    update public.projects
    set
      module_id = v_module_id,
      title = v_title,
      description = coalesce(p_project ->> 'description', ''),
      deadline_at = nullif(p_project ->> 'deadline_at', '')::timestamptz,
      is_published = coalesce((p_project ->> 'is_published')::boolean, false)
    where id = v_project_id;

    if not found then
      raise exception 'Project not found';
    end if;
  else
    insert into public.projects (
      module_id, title, description, deadline_at, is_published, created_by
    )
    values (
      v_module_id,
      v_title,
      coalesce(p_project ->> 'description', ''),
      nullif(p_project ->> 'deadline_at', '')::timestamptz,
      coalesce((p_project ->> 'is_published')::boolean, false),
      auth.uid()
    )
    returning id into v_project_id;
  end if;

  return v_project_id;
end;
$$;

create or replace function public.delete_project(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can manage projects';
  end if;

  delete from public.projects where id = p_project_id;

  if not found then
    raise exception 'Project not found';
  end if;
end;
$$;

create or replace function public.delete_quiz(p_quiz_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can manage quizzes';
  end if;

  delete from public.quizzes where id = p_quiz_id;

  if not found then
    raise exception 'Quiz not found';
  end if;
end;
$$;

create or replace function public.grade_project_submission(
  p_submission_id uuid,
  p_score integer,
  p_feedback text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can grade projects';
  end if;

  if p_score is null or p_score < 0 or p_score > 100 then
    raise exception 'Score must be between 0 and 100';
  end if;

  update public.project_submissions
  set score = p_score, feedback = coalesce(trim(p_feedback), '')
  where id = p_submission_id;

  if not found then
    raise exception 'Project submission not found';
  end if;
end;
$$;

revoke all on function public.save_project(jsonb) from public, anon;
grant execute on function public.save_project(jsonb) to authenticated;

revoke all on function public.delete_project(uuid) from public, anon;
grant execute on function public.delete_project(uuid) to authenticated;

revoke all on function public.delete_quiz(uuid) from public, anon;
grant execute on function public.delete_quiz(uuid) to authenticated;

revoke all on function public.grade_project_submission(uuid, integer, text) from public, anon;
grant execute on function public.grade_project_submission(uuid, integer, text) to authenticated;
