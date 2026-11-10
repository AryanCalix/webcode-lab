import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type {
  AttendanceRecordRow,
  AttendanceSessionRow,
} from '../../lib/database.types';
import {
  deleteAttendanceSession,
  fetchAttendanceRecords,
  fetchAttendanceSessions,
  saveAttendance,
  type AttendanceRecordInput,
} from './api';
import { summariseAttendance } from './summary';

export const attendanceKeys = {
  all: ['attendance'] as const,
  sessions: () => [...attendanceKeys.all, 'sessions'] as const,
  records: () => [...attendanceKeys.all, 'records'] as const,
};

export function useAttendanceSessions() {
  return useQuery({ queryKey: attendanceKeys.sessions(), queryFn: fetchAttendanceSessions });
}

export function useAttendanceRecords() {
  return useQuery({ queryKey: attendanceKeys.records(), queryFn: fetchAttendanceRecords });
}

export function useAttendanceData() {
  const sessionsQuery = useAttendanceSessions();
  const recordsQuery = useAttendanceRecords();

  const sessions = useMemo(() => {
    const recordsBySession = new Map<string, AttendanceRecordRow[]>();
    for (const record of recordsQuery.data ?? []) {
      const list = recordsBySession.get(record.session_id) ?? [];
      list.push(record);
      recordsBySession.set(record.session_id, list);
    }

    return (sessionsQuery.data ?? []).map((session) => ({
      ...session,
      records: recordsBySession.get(session.id) ?? [],
    }));
  }, [sessionsQuery.data, recordsQuery.data]);

  return {
    sessions,
    records: recordsQuery.data ?? [],
    isLoading: sessionsQuery.isLoading || recordsQuery.isLoading,
    error: sessionsQuery.error ?? recordsQuery.error,
    refetch: () => {
      void sessionsQuery.refetch();
      void recordsQuery.refetch();
    },
  };
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      sessionDate: string;
      topic: string;
      records: AttendanceRecordInput[];
    }) => saveAttendance(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useDeleteAttendanceSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => deleteAttendanceSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
    },
  });
}

export function useStudentAttendance(studentId: string | undefined) {
  const { sessions, records, isLoading, error, refetch } = useAttendanceData();

  const ownRecords = useMemo(
    () => records.filter((record) => record.student_id === studentId),
    [records, studentId],
  );

  const bySession = useMemo(
    () => new Map(ownRecords.map((record) => [record.session_id, record] as const)),
    [ownRecords],
  );

  return {
    sessions: sessions.map((session) => ({
      ...session,
      record: bySession.get(session.id) ?? null,
    })),
    summary: summariseAttendance(ownRecords, sessions.length),
    isLoading,
    error,
    refetch,
  };
}

export { summariseAttendance };
export type { AttendanceSummary } from './summary';
export type { AttendanceSessionRow, AttendanceRecordRow };
