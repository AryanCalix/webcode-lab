export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Role = 'student' | 'lecturer';

export type ProfileRow = {
  id: string;
  full_name: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export type ModuleRow = {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type LessonRow = {
  id: string;
  module_id: string;
  title: string;
  content: string;
  video_url: string | null;
  kind: 'material' | 'exercise';
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type ExerciseRow = {
  id: string;
  lesson_id: string;
  title: string;
  instructions: string;
  starter_html: string;
  starter_css: string;
  starter_js: string;
  hint: string;
  validator_config: Json;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type ExerciseSubmissionRow = {
  id: string;
  exercise_id: string;
  student_id: string;
  html_code: string;
  css_code: string;
  js_code: string;
  is_correct: boolean;
  feedback: string;
  submitted_at: string;
}

export type LessonCompletionRow = {
  student_id: string;
  lesson_id: string;
  completed_at: string;
}

export type StudentProgressRow = {
  id: string;
  student_id: string;
  module_id: string;
  completed_lessons: number;
  total_lessons: number;
  progress_percent: number;
  completed_at: string | null;
  updated_at: string;
}

export type QuizRow = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  duration_minutes: number | null;
  deadline_at: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type QuizQuestionRow = {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice';
  options: Json;
  correct_index: number;
  points: number;
  order_index: number;
  created_at: string;
}

export type QuizAttemptRow = {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Json | null;
  score: number | null;
  status: 'in_progress' | 'submitted' | 'expired';
  started_at: string;
  expires_at: string | null;
  submitted_at: string | null;
}

export type ProjectRow = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  deadline_at: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectSubmissionRow = {
  id: string;
  project_id: string;
  student_id: string;
  submission_url: string | null;
  submission_text: string | null;
  score: number | null;
  feedback: string | null;
  submitted_at: string;
}

export type AttendanceStatus = 'present' | 'excused' | 'sick' | 'absent';

export type AttendanceSessionRow = {
  id: string;
  session_date: string;
  topic: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type AttendanceRecordRow = {
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  note: string;
  updated_at: string;
}

export type ForumThreadRow = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export type ForumReplyRow = {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export type GamificationProfileRow = {
  student_id: string;
  total_xp: number;
  level: number;
  level_name: string;
  current_streak: number;
  last_activity_date: string | null;
  updated_at: string;
}

export type XpTransactionRow = {
  id: string;
  student_id: string;
  source_type: string;
  source_id: string;
  xp_amount: number;
  created_at: string;
}

export type BadgeRow = {
  id: string;
  name: string;
  description: string;
}

export type StudentBadgeRow = {
  student_id: string;
  badge_id: string;
  awarded_at: string;
}

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        {
          id: string;
          full_name?: string;
          role?: Role;
          created_at?: string;
          updated_at?: string;
        }
      >;
      modules: Table<
        ModuleRow,
        {
          id?: string;
          title: string;
          description?: string;
          order_index?: number;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      lessons: Table<
        LessonRow,
        {
          id?: string;
          module_id: string;
          title: string;
          content?: string;
          video_url?: string | null;
          kind?: 'material' | 'exercise';
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      exercises: Table<
        ExerciseRow,
        {
          id?: string;
          lesson_id: string;
          title: string;
          instructions?: string;
          starter_html?: string;
          starter_css?: string;
          starter_js?: string;
          hint?: string;
          validator_config?: Json;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      exercise_submissions: Table<
        ExerciseSubmissionRow,
        {
          id?: string;
          exercise_id: string;
          student_id: string;
          html_code?: string;
          css_code?: string;
          js_code?: string;
          is_correct?: boolean;
          feedback?: string;
          submitted_at?: string;
        }
      >;
      lesson_completions: Table<
        LessonCompletionRow,
        { student_id: string; lesson_id: string; completed_at?: string }
      >;
      student_progress: Table<
        StudentProgressRow,
        {
          id?: string;
          student_id: string;
          module_id: string;
          completed_lessons?: number;
          total_lessons?: number;
          progress_percent?: number;
          completed_at?: string | null;
          updated_at?: string;
        }
      >;
      quizzes: Table<
        QuizRow,
        {
          id?: string;
          module_id: string;
          title: string;
          description?: string;
          duration_minutes?: number | null;
          deadline_at?: string | null;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      quiz_questions: Table<
        QuizQuestionRow,
        {
          id?: string;
          quiz_id: string;
          question_text: string;
          question_type?: 'multiple_choice';
          options: Json;
          correct_index: number;
          points?: number;
          order_index?: number;
          created_at?: string;
        }
      >;
      quiz_attempts: Table<
        QuizAttemptRow,
        {
          id?: string;
          quiz_id: string;
          student_id: string;
          answers?: Json | null;
          score?: number | null;
          status?: 'in_progress' | 'submitted' | 'expired';
          started_at?: string;
          expires_at?: string | null;
          submitted_at?: string | null;
        }
      >;
      projects: Table<
        ProjectRow,
        {
          id?: string;
          module_id: string;
          title: string;
          description?: string;
          deadline_at?: string | null;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      project_submissions: Table<
        ProjectSubmissionRow,
        {
          id?: string;
          project_id: string;
          student_id: string;
          submission_url?: string | null;
          submission_text?: string | null;
          score?: number | null;
          feedback?: string | null;
          submitted_at?: string;
        }
      >;
      attendance_sessions: Table<
        AttendanceSessionRow,
        {
          id?: string;
          session_date: string;
          topic?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      attendance_records: Table<
        AttendanceRecordRow,
        {
          session_id: string;
          student_id: string;
          status?: AttendanceStatus;
          note?: string;
          updated_at?: string;
        }
      >;
      forum_threads: Table<
        ForumThreadRow,
        {
          id?: string;
          author_id: string;
          title: string;
          body: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      forum_replies: Table<
        ForumReplyRow,
        { id?: string; thread_id: string; author_id: string; body: string; created_at?: string }
      >;
      gamification_profiles: Table<
        GamificationProfileRow,
        {
          student_id: string;
          total_xp?: number;
          level?: number;
          level_name?: string;
          current_streak?: number;
          last_activity_date?: string | null;
          updated_at?: string;
        }
      >;
      xp_transactions: Table<
        XpTransactionRow,
        {
          id?: string;
          student_id: string;
          source_type: string;
          source_id: string;
          xp_amount: number;
          created_at?: string;
        }
      >;
      badges: Table<BadgeRow, { id: string; name: string; description?: string }>;
      student_badges: Table<
        StudentBadgeRow,
        { student_id: string; badge_id: string; awarded_at?: string }
      >;
      ai_requests: Table<
        { id: number; student_id: string; kind: string; created_at: string },
        { student_id: string; kind: string; created_at?: string }
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      complete_lesson: { Args: { p_lesson_id: string }; Returns: Json };
      start_quiz_attempt: { Args: { p_quiz_id: string }; Returns: Json };
      submit_quiz_attempt: { Args: { p_attempt_id: string; p_answers: Json }; Returns: Json };
      submit_project: {
        Args: { p_project_id: string; p_url: string | null; p_text: string | null };
        Returns: Json;
      };
      save_quiz: { Args: { p_quiz: Json }; Returns: string };
      save_module: { Args: { p_module: Json }; Returns: string };
      save_lesson: { Args: { p_lesson: Json }; Returns: string };
      delete_lesson: { Args: { p_lesson_id: string }; Returns: null };
      delete_module: { Args: { p_module_id: string }; Returns: null };
      check_ai_rate_limit: {
        Args: { p_kind: string; p_limit?: number; p_window_minutes?: number };
        Returns: boolean;
      };
      recalculate_module_progress: {
        Args: { p_student_id: string; p_module_id: string };
        Returns: null;
      };
      save_project: { Args: { p_project: Json }; Returns: string };
      delete_project: { Args: { p_project_id: string }; Returns: null };
      delete_quiz: { Args: { p_quiz_id: string }; Returns: null };
      grade_project_submission: {
        Args: { p_submission_id: string; p_score: number; p_feedback: string };
        Returns: null;
      };
      save_attendance: {
        Args: { p_session_date: string; p_topic: string; p_records: Json };
        Returns: string;
      };
      delete_attendance_session: { Args: { p_session_id: string }; Returns: null };
      reorder_lessons: {
        Args: { p_module_id: string; p_lesson_ids: string[] };
        Returns: null;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
