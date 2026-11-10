import type { AttendanceRecordRow, AttendanceStatus } from '../../lib/database.types';

export interface AttendanceSummary {
  total: number;
  present: number;
  excused: number;
  sick: number;
  absent: number;
  percentage: number;
}

/**
 * Counts attendance records into a summary. Students without a row are treated
 * as present, which is how sessions are saved (only exceptions are stored). Pass
 * the expected number of records (sessions × students) so students added after a
 * session was recorded are not silently left out of the percentage.
 */
export function summariseAttendance(
  records: AttendanceRecordRow[],
  expectedTotal = records.length,
): AttendanceSummary {
  const counts: Record<AttendanceStatus, number> = {
    present: 0,
    excused: 0,
    sick: 0,
    absent: 0,
  };

  for (const record of records) {
    counts[record.status] += 1;
  }

  const total = Math.max(records.length, expectedTotal);
  const missing = total - records.length;
  const present = counts.present + missing;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return {
    total,
    present,
    excused: counts.excused,
    sick: counts.sick,
    absent: counts.absent,
    percentage,
  };
}
