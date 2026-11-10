import type {
  AttendanceRecordRow,
  AttendanceSessionRow,
  AttendanceStatus,
  Json,
} from '../../lib/database.types';
import { throwIfError } from '../../lib/errors';
import { getSupabase } from '../../lib/supabase';

export interface AttendanceRecordInput {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export async function fetchAttendanceSessions(): Promise<AttendanceSessionRow[]> {
  const { data, error } = await getSupabase()
    .from('attendance_sessions')
    .select('*')
    .order('session_date', { ascending: false });

  throwIfError(error);
  return data ?? [];
}

export async function fetchAttendanceRecords(): Promise<AttendanceRecordRow[]> {
  const { data, error } = await getSupabase()
    .from('attendance_records')
    .select('*')
    .order('student_id');

  throwIfError(error);
  return data ?? [];
}

export async function saveAttendance(input: {
  sessionDate: string;
  topic: string;
  records: AttendanceRecordInput[];
}): Promise<string> {
  const payload = input.records.map((record) => ({
    student_id: record.studentId,
    status: record.status,
    note: record.note ?? '',
  }));

  const { data, error } = await getSupabase().rpc('save_attendance', {
    p_session_date: input.sessionDate,
    p_topic: input.topic,
    p_records: payload as unknown as Json,
  });

  throwIfError(error);
  if (typeof data !== 'string') throw new Error('Gagal menyimpan absensi.');
  return data;
}

export async function deleteAttendanceSession(sessionId: string): Promise<void> {
  const { error } = await getSupabase().rpc('delete_attendance_session', {
    p_session_id: sessionId,
  });
  throwIfError(error);
}
