import type { AttendanceStatus } from '../../lib/database.types';

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'present',
  'excused',
  'sick',
  'absent',
];

export const attendanceLabels: Record<AttendanceStatus, string> = {
  present: 'Hadir',
  excused: 'Izin',
  sick: 'Sakit',
  absent: 'Tidak Hadir',
};

export const attendanceTones: Record<
  AttendanceStatus,
  'green' | 'amber' | 'blue' | 'slate' | 'red'
> = {
  present: 'green',
  excused: 'amber',
  sick: 'blue',
  absent: 'red',
};
