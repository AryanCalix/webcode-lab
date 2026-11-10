-- WebCode Lab — security hardening
-- The previous privileges migration re-granted EXECUTE on *all* public
-- functions to anon/authenticated. That made internal helpers such as
-- award_xp() and record_exercise_submission() callable from the browser.
-- This migration explicitly locks them down again and removes the blanket
-- default privileges for future functions.

revoke execute on all functions in schema public from public, anon, authenticated;

-- Only the client-facing RPCs are exposed to signed-in users.
grant execute on function public.is_lecturer() to authenticated;
grant execute on function public.complete_lesson(uuid) to authenticated;
grant execute on function public.start_quiz_attempt(uuid) to authenticated;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;
grant execute on function public.submit_project(uuid, text, text) to authenticated;
grant execute on function public.save_quiz(jsonb) to authenticated;
grant execute on function public.save_module(jsonb) to authenticated;
grant execute on function public.save_lesson(jsonb) to authenticated;
grant execute on function public.delete_lesson(uuid) to authenticated;
grant execute on function public.delete_module(uuid) to authenticated;
grant execute on function public.check_ai_rate_limit(text, integer, integer) to authenticated;

-- Internal write paths remain service-role only.
revoke all on function public.award_xp(uuid, text, uuid, integer) from public, anon, authenticated;
grant execute on function public.award_xp(uuid, text, uuid, integer) to service_role;

revoke all on function public.record_exercise_submission(uuid, uuid, text, text, text, boolean, text)
  from public, anon, authenticated;
grant execute on function public.record_exercise_submission(uuid, uuid, text, text, text, boolean, text)
  to service_role;

revoke all on function public.recalculate_module_progress(uuid, uuid) from public, anon, authenticated;
grant execute on function public.recalculate_module_progress(uuid, uuid) to service_role;

revoke all on function public.ensure_gamification_profile(uuid) from public, anon, authenticated;
grant execute on function public.ensure_gamification_profile(uuid) to service_role;

revoke all on function public.level_for_xp(integer) from public, anon, authenticated;
grant execute on function public.level_for_xp(integer) to service_role;

-- Future functions created by migrations must not be auto-exposed.
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- Anonymous users have no business reading classroom tables.
revoke all on all tables in schema public from anon;

-- Only the service role may change a profile role. Lecturers can still edit
-- profile details such as the display name.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'Only administrators can change profile roles';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_profile_role() from public, anon, authenticated;
