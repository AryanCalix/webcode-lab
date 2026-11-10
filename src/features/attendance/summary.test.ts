import { describe, expect, it } from 'vitest';
import type { AttendanceRecordRow, AttendanceStatus } from '../../lib/database.types';
import { summariseAttendance } from './summary';

function record(
  studentId: string,
  status: AttendanceStatus = 'present',
  sessionId = 'session-1',
): AttendanceRecordRow {
  return {
    session_id: sessionId,
    student_id: studentId,
    status,
    note: '',
    updated_at: '2026-11-10T00:00:00.000Z',
  };
}

describe('summariseAttendance', () => {
  it('counts every stored status', () => {
    const summary = summariseAttendance([
      record('s1', 'present'),
      record('s2', 'excused'),
      record('s3', 'sick'),
      record('s4', 'absent'),
    ]);

    expect(summary).toEqual({
      total: 4,
      present: 1,
      excused: 1,
      sick: 1,
      absent: 1,
      percentage: 25,
    });
  });

  it('treats missing records as present', () => {
    const summary = summariseAttendance([record('s1', 'absent')], 3);

    expect(summary.total).toBe(3);
    expect(summary.present).toBe(2);
    expect(summary.absent).toBe(1);
    expect(summary.percentage).toBe(67);
  });

  it('reports a full class as present when no records were stored', () => {
    const summary = summariseAttendance([], 4);

    expect(summary.total).toBe(4);
    expect(summary.present).toBe(4);
    expect(summary.percentage).toBe(100);
  });

  it('never drops stored records when the expected total is lower', () => {
    const summary = summariseAttendance([record('s1'), record('s2')], 1);

    expect(summary.total).toBe(2);
    expect(summary.present).toBe(2);
  });

  it('returns a zero percentage when there is nothing to count', () => {
    const summary = summariseAttendance([], 0);

    expect(summary.total).toBe(0);
    expect(summary.percentage).toBe(0);
  });
});
