import { invokeFunction } from '../../lib/edge';

export interface ExerciseSubmissionResult {
  id: string;
  exercise_id: string;
  is_correct: boolean;
  feedback: string;
  submitted_at: string;
}

export interface AiHintResult {
  hint: string;
  source: 'ai' | 'fallback';
}

export interface AiExplanationResult {
  explanation: string;
  source: 'ai' | 'fallback';
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatResult {
  reply: string;
  source: 'ai' | 'fallback';
}

export function submitExercise(input: {
  exerciseId: string;
  html: string;
  css: string;
  js: string;
}): Promise<ExerciseSubmissionResult> {
  return invokeFunction<ExerciseSubmissionResult>('submit-exercise', input);
}

export function requestAiHint(input: {
  exerciseId: string;
  html: string;
  css: string;
  js: string;
  errorMessage?: string;
}): Promise<AiHintResult> {
  return invokeFunction<AiHintResult>('ai-hint', input);
}

export function requestAiExplanation(input: {
  exerciseId: string;
  html: string;
  css: string;
  js: string;
  errorMessage: string;
}): Promise<AiExplanationResult> {
  return invokeFunction<AiExplanationResult>('ai-error-explanation', input);
}

export function requestAiChat(input: {
  exerciseId: string;
  messages: AiChatMessage[];
  code: { html: string; css: string; js: string };
}): Promise<AiChatResult> {
  return invokeFunction<AiChatResult>('ai-chat', {
    exerciseId: input.exerciseId,
    code: input.code,
    messages: input.messages,
  });
}
