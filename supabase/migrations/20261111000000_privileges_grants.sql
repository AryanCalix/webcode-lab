-- Ensure Postgres roles used by Supabase Auth/PostgREST have required privileges.
-- Applied via a dedicated migration because table grants were missing from the initial schema.

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant usage on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

revoke all on all tables in schema public from public;
grant all on all tables in schema public to anon, authenticated, service_role;

-- Function execution privileges
grant execute on function public.is_lecturer() to authenticated, anon;
grant execute on function public.level_for_xp(integer) to service_role;
grant execute on function public.ensure_gamification_profile(uuid) to service_role;
grant execute on function public.recalculate_module_progress(uuid, uuid) to service_role;
grant execute on function public.complete_lesson(uuid) to authenticated, anon;
grant execute on function public.record_exercise_submission(uuid, uuid, text, text, text, boolean, text) to authenticated, anon;
grant execute on function public.start_quiz_attempt(uuid) to authenticated, anon;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated, anon;
grant execute on function public.submit_project(uuid, text, text) to authenticated, anon;
grant execute on function public.save_quiz(jsonb) to authenticated, anon;
grant execute on function public.save_module(jsonb) to authenticated, anon;
grant execute on function public.save_lesson(jsonb) to authenticated, anon;
grant execute on function public.delete_lesson(uuid) to authenticated, anon;
grant execute on function public.delete_module(uuid) to authenticated, anon;
grant execute on function public.check_ai_rate_limit(text, integer, integer) to authenticated, anon;
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.protect_profile_role() to authenticated, anon;

revoke all on function public.award_xp(uuid, text, uuid, integer) from public, anon, authenticated;
grant execute on function public.award_xp(uuid, text, uuid, integer) to service_role;
revoke all on function public.ensure_gamification_profile(uuid) from public, anon, authenticated;
grant execute on function public.ensure_gamification_profile(uuid) to service_role;
revoke all on function public.recalculate_module_progress(uuid, uuid) from public, anon, authenticated;
grant execute on function public.recalculate_module_progress(uuid, uuid) to service_role;
revoke all on function public.complete_lesson(uuid) from public, anon, authenticated;
grant execute on function public.complete_lesson(uuid) to authenticated, anon;
revoke all on function public.record_exercise_submission(uuid, uuid, text, text, text, boolean, text) from public;
grant execute on function public.record_exercise_submission(uuid, uuid, text, text, text, boolean, text) to authenticated, anon;
revoke all on function public.start_quiz_attempt(uuid) from public;
grant execute on function public.start_quiz_attempt(uuid) to authenticated, anon;
revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated, anon;
revoke all on function public.submit_project(uuid, text, text) from public;
grant execute on function public.submit_project(uuid, text, text) to authenticated, anon;
revoke all on function public.save_quiz(jsonb) from public;
grant execute on function public.save_quiz(jsonb) to authenticated, anon;
revoke all on function public.save_module(jsonb) from public;
grant execute on function public.save_module(jsonb) to authenticated, anon;
revoke all on function public.save_lesson(jsonb) from public;
grant execute on function public.save_lesson(jsonb) to authenticated, anon;
revoke all on function public.delete_lesson(uuid) from public;
grant execute on function public.delete_lesson(uuid) to authenticated, anon;
revoke all on function public.delete_module(uuid) from public;
grant execute on function public.delete_module(uuid) to authenticated, anon;
revoke all on function public.check_ai_rate_limit(text, integer, integer) from public;
grant execute on function public.check_ai_rate_limit(text, integer, integer) to authenticated, anon;

-- Lock down default function execution for the public pseudo-role
revoke all on all functions in schema public from public;
grant usage on schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.protect_profile_role() from public;
grant execute on function public.protect_profile_role() to authenticated, anon;
