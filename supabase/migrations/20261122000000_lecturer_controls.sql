-- WebCode Lab — lecturer lesson controls
-- Reordering a lesson must not go through save_lesson(), because that function
-- also rewrites (and can delete) the attached exercise. This RPC only touches
-- order_index and is safe for both material and exercise lessons.

create or replace function public.reorder_lessons(
  p_module_id uuid,
  p_lesson_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_index integer;
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can reorder lessons';
  end if;

  if not exists (select 1 from public.modules where id = p_module_id) then
    raise exception 'Module not found';
  end if;

  select count(*) into v_count
  from public.lessons
  where module_id = p_module_id;

  if v_count = 0 then
    return;
  end if;

  if coalesce(array_length(p_lesson_ids, 1), 0) <> v_count then
    raise exception 'Lesson list is out of date. Reload the module and try again.';
  end if;

  if (
    select count(distinct t.lesson_id)
    from unnest(p_lesson_ids) as t(lesson_id)
  ) <> v_count then
    raise exception 'Lesson list contains duplicates';
  end if;

  if exists (
    select 1
    from unnest(p_lesson_ids) as t(lesson_id)
    where not exists (
      select 1 from public.lessons
      where lessons.id = t.lesson_id and lessons.module_id = p_module_id
    )
  ) then
    raise exception 'One or more lessons do not belong to this module';
  end if;

  for v_index in 1..v_count loop
    update public.lessons
    set order_index = v_index - 1
    where id = p_lesson_ids[v_index];
  end loop;
end;
$$;

revoke all on function public.reorder_lessons(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_lessons(uuid, uuid[]) to authenticated;
