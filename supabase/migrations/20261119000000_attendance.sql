-- WebCode Lab — attendance (single class)
-- Lecturers create a session and mark only the students who are not present.
-- Every other student defaults to "present".

create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  session_date date not null,
  topic text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_date, topic)
);

create table if not exists public.attendance_records (
  session_id uuid not null references public.attendance_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'present'
    check (status in ('present', 'excused', 'sick', 'absent')),
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (session_id, student_id)
);

create index if not exists attendance_sessions_date_idx
  on public.attendance_sessions (session_date desc);
create index if not exists attendance_records_student_idx
  on public.attendance_records (student_id, session_id);

drop trigger if exists attendance_sessions_set_updated_at on public.attendance_sessions;
create trigger attendance_sessions_set_updated_at
  before update on public.attendance_sessions
  for each row execute function public.set_updated_at();

alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;

create policy "attendance_sessions_select_authenticated"
  on public.attendance_sessions for select to authenticated
  using (true);

create policy "attendance_sessions_insert_lecturer"
  on public.attendance_sessions for insert to authenticated
  with check (public.is_lecturer());

create policy "attendance_sessions_update_lecturer"
  on public.attendance_sessions for update to authenticated
  using (public.is_lecturer())
  with check (public.is_lecturer());

create policy "attendance_sessions_delete_lecturer"
  on public.attendance_sessions for delete to authenticated
  using (public.is_lecturer());

create policy "attendance_records_select_own_or_lecturer"
  on public.attendance_records for select to authenticated
  using (student_id = auth.uid() or public.is_lecturer());

create policy "attendance_records_insert_lecturer"
  on public.attendance_records for insert to authenticated
  with check (public.is_lecturer());

create policy "attendance_records_update_lecturer"
  on public.attendance_records for update to authenticated
  using (public.is_lecturer())
  with check (public.is_lecturer());

create policy "attendance_records_delete_lecturer"
  on public.attendance_records for delete to authenticated
  using (public.is_lecturer());

-- Creates or updates one session and replaces the whole roster. Records sent
-- from the client only contain non-present students; everybody else is present.
create or replace function public.save_attendance(
  p_session_date date,
  p_topic text,
  p_records jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_record jsonb;
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can manage attendance';
  end if;

  if p_session_date is null then
    raise exception 'Session date is required';
  end if;

  insert into public.attendance_sessions (session_date, topic, created_by)
  values (p_session_date, coalesce(trim(p_topic), ''), auth.uid())
  on conflict (session_date, topic) do update
    set updated_at = now()
  returning id into v_session_id;

  delete from public.attendance_records where session_id = v_session_id;

  insert into public.attendance_records (session_id, student_id, status, note)
  select v_session_id, p.id, 'present', ''
  from public.profiles p
  where p.role = 'student'
  on conflict (session_id, student_id) do nothing;

  for v_record in
    select value from jsonb_array_elements(coalesce(p_records, '[]'::jsonb))
  loop
    update public.attendance_records
    set
      status = coalesce(v_record ->> 'status', 'present'),
      note = coalesce(v_record ->> 'note', ''),
      updated_at = now()
    where session_id = v_session_id
      and student_id = (v_record ->> 'student_id')::uuid
      and coalesce(v_record ->> 'status', 'present')
        in ('present', 'excused', 'sick', 'absent');
  end loop;

  return v_session_id;
end;
$$;

create or replace function public.delete_attendance_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_lecturer() then
    raise exception 'Only lecturers can manage attendance';
  end if;

  delete from public.attendance_sessions where id = p_session_id;

  if not found then
    raise exception 'Attendance session not found';
  end if;
end;
$$;

revoke all on function public.save_attendance(date, text, jsonb) from public, anon;
grant execute on function public.save_attendance(date, text, jsonb) to authenticated;

revoke all on function public.delete_attendance_session(uuid) from public, anon;
grant execute on function public.delete_attendance_session(uuid) to authenticated;
