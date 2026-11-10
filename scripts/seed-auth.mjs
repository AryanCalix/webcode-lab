#!/usr/bin/env node
/**
 * Creates the two demo accounts and seeds their demo activity.
 *
 * Requires a service role key and must never run in the browser.
 *
 *   cp .env.seed.example .env.seed   # fill SUPABASE_SERVICE_ROLE_KEY
 *   npm run seed:auth
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. See .env.seed.example.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const STUDENT = {
  email: 'budi@webcode.lab',
  password: process.env.DEMO_STUDENT_PASSWORD ?? 'budi1234',
  fullName: 'Budi Santoso',
  role: 'student',
};

const LECTURER = {
  email: 'siti@webcode.lab',
  password: process.env.DEMO_LECTURER_PASSWORD ?? 'siti1234',
  fullName: 'Dr. Siti Aminah',
  role: 'lecturer',
};

const MODULE_IDS = [
  'a0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000003',
  'a0000000-0000-4000-8000-000000000004',
];

const MODULE_ONE_AND_TWO_LESSONS = [
  'b0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000003',
  'b0000000-0000-4000-8000-000000000011',
  'b0000000-0000-4000-8000-000000000012',
  'b0000000-0000-4000-8000-000000000013',
];

const MODULE_THREE_COMPLETED_LESSON = 'b0000000-0000-4000-8000-000000000021';

function jakartaDate(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

async function findUserByEmail(email) {
  let page = 1;

  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) return null;
    page += 1;
  }

  return null;
}

async function ensureUser({ email, password, fullName, role }) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  let user = data?.user ?? null;

  if (error) {
    if (!/already|registered|exists/i.test(error.message)) throw error;
    user = await findUserByEmail(email);
  }

  if (!user) throw new Error(`Could not create or find ${email}`);

  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (updateError) throw updateError;

  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: user.id, full_name: fullName, role }, { onConflict: 'id' });
  if (profileError) throw profileError;

  return user;
}

async function seedStudentActivity(studentId, lecturerId) {
  const { error: completionsError } = await admin.from('lesson_completions').upsert(
    [...MODULE_ONE_AND_TWO_LESSONS, MODULE_THREE_COMPLETED_LESSON].map((lessonId) => ({
      student_id: studentId,
      lesson_id: lessonId,
    })),
    { onConflict: 'student_id,lesson_id', ignoreDuplicates: true },
  );
  if (completionsError) throw completionsError;

  for (const moduleId of MODULE_IDS) {
    const { error } = await admin.rpc('recalculate_module_progress', {
      p_student_id: studentId,
      p_module_id: moduleId,
    });
    if (error) throw error;
  }

  const { error: submissionError } = await admin.from('exercise_submissions').upsert(
    [
      {
        exercise_id: 'c0000000-0000-4000-8000-000000000001',
        student_id: studentId,
        html_code: '<h1>Halo Web</h1>',
        css_code: '',
        js_code: '',
        is_correct: true,
        feedback: 'Kode benar! Heading HTML Anda valid.',
        submitted_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        exercise_id: 'c0000000-0000-4000-8000-000000000002',
        student_id: studentId,
        html_code:
          '<header><h1>Budi</h1></header><section><h2>Proyek</h2></section><footer>© 2027</footer>',
        css_code: '',
        js_code: '',
        is_correct: true,
        feedback: 'Kode benar! Struktur portofolio Anda sudah semantik.',
        submitted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],
    { onConflict: 'student_id,exercise_id' },
  );
  if (submissionError) throw submissionError;

  const { error: attemptError } = await admin.from('quiz_attempts').upsert(
    {
      id: 'aa000000-0000-4000-8000-000000000001',
      quiz_id: 'd0000000-0000-4000-8000-000000000001',
      student_id: studentId,
      answers: [0, 0, 0],
      score: 100,
      status: 'submitted',
      started_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      submitted_at: new Date(Date.now() - 4 * 86400000 + 600000).toISOString(),
    },
    { onConflict: 'id' },
  );
  if (attemptError) throw attemptError;

  const { error: projectError } = await admin.from('project_submissions').upsert(
    {
      project_id: 'f0000000-0000-4000-8000-000000000001',
      student_id: studentId,
      submission_url: 'https://example.com/budi-portofolio',
      submission_text: null,
      submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    { onConflict: 'student_id,project_id' },
  );
  if (projectError) throw projectError;

  const { error: xpError } = await admin.from('xp_transactions').upsert(
    [
      {
        student_id: studentId,
        source_type: 'exercise',
        source_id: 'c0000000-0000-4000-8000-000000000001',
        xp_amount: 20,
      },
      {
        student_id: studentId,
        source_type: 'exercise',
        source_id: 'c0000000-0000-4000-8000-000000000002',
        xp_amount: 20,
      },
      {
        student_id: studentId,
        source_type: 'quiz',
        source_id: 'd0000000-0000-4000-8000-000000000001',
        xp_amount: 50,
      },
      {
        student_id: studentId,
        source_type: 'project',
        source_id: 'f0000000-0000-4000-8000-000000000001',
        xp_amount: 50,
      },
    ],
    { onConflict: 'student_id,source_type,source_id', ignoreDuplicates: true },
  );
  if (xpError) throw xpError;

  const yesterday = jakartaDate(new Date(Date.now() - 86400000));
  const { error: profileError } = await admin.from('gamification_profiles').upsert(
    {
      student_id: studentId,
      total_xp: 140,
      level: 2,
      level_name: 'Menengah',
      current_streak: 5,
      last_activity_date: yesterday,
    },
    { onConflict: 'student_id' },
  );
  if (profileError) throw profileError;

  const { error: badgesError } = await admin.from('student_badges').upsert(
    [
      { student_id: studentId, badge_id: 'first-solve' },
      { student_id: studentId, badge_id: 'quiz-ace' },
      { student_id: studentId, badge_id: 'project-builder' },
    ],
    { onConflict: 'student_id,badge_id', ignoreDuplicates: true },
  );
  if (badgesError) throw badgesError;

  const { error: threadError } = await admin.from('forum_threads').upsert(
    {
      id: 'ab000000-0000-4000-8000-000000000001',
      author_id: studentId,
      title: 'Tanya tentang selector CSS untuk warna',
      body: 'Saya bingung, apakah kita harus pakai `color` atau `background-color` untuk menata warna teks?',
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    { onConflict: 'id' },
  );
  if (threadError) throw threadError;

  const { error: replyError } = await admin.from('forum_replies').upsert(
    {
      id: 'ac000000-0000-4000-8000-000000000001',
      thread_id: 'ab000000-0000-4000-8000-000000000001',
      author_id: lecturerId,
      body: 'Untuk warna teks pakai properti `color`. `background-color` hanya untuk latar belakang elemen.',
      created_at: new Date(Date.now() - 6 * 86400000 + 3600000).toISOString(),
    },
    { onConflict: 'id' },
  );
  if (replyError) throw replyError;
}

async function main() {
  console.log(`Seeding demo accounts on ${url}`);
  const student = await ensureUser(STUDENT);
  const lecturer = await ensureUser(LECTURER);

  await seedStudentActivity(student.id, lecturer.id);

  console.log('Done. Demo accounts:');
  console.log(`  student:  ${STUDENT.email} / ${STUDENT.password}`);
  console.log(`  lecturer: ${LECTURER.email} / ${LECTURER.password}`);
  console.log('Rotate these passwords before using the app outside a demo.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
