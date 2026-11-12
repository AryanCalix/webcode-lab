-- WebCode Lab — keep progress consistent after expanding lesson content.
-- Adding lessons changes the denominator used by recalculate_module_progress,
-- so recompute every student's progress once for all modules.

do $$
declare
  item record;
begin
  for item in
    select profile.id as student_id, module.id as module_id
    from public.profiles as profile
    cross join public.modules as module
    where profile.role = 'student'
  loop
    perform public.recalculate_module_progress(item.student_id, item.module_id);
  end loop;
end;
$$;
