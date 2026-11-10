export const lecturerKeys = {
  all: ['lecturer'] as const,
  students: () => [...lecturerKeys.all, 'students'] as const,
  modules: () => [...lecturerKeys.all, 'modules'] as const,
  lessons: () => [...lecturerKeys.all, 'lessons'] as const,
  moduleLessons: (moduleId: string) => [...lecturerKeys.all, 'module-lessons', moduleId] as const,
  lesson: (lessonId: string) => [...lecturerKeys.all, 'lesson', lessonId] as const,
  exercise: (lessonId: string) => [...lecturerKeys.all, 'exercise', lessonId] as const,
  results: () => [...lecturerKeys.all, 'results'] as const,
};
