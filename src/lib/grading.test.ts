import { describe, expect, it } from 'vitest';
import {
  averageScore,
  calculateGrade,
  clampScore,
  gradeLetter,
  gradeTone,
} from './grading';

describe('grading', () => {
  it('clamps scores to the 0–100 range', () => {
    expect(clampScore(-10)).toBe(0);
    expect(clampScore(120)).toBe(100);
    expect(clampScore(Number.NaN)).toBe(0);
  });

  it('averages only finite scores and rounds the result', () => {
    expect(averageScore([80, 90, 100])).toBe(90);
    expect(averageScore([75, 80])).toBe(78);
    expect(averageScore([])).toBe(0);
    expect(averageScore([Number.NaN, 50])).toBe(50);
  });

  it('applies the 50/40/10 weights', () => {
    const grade = calculateGrade({
      projectScores: [80, 90],
      modulePercent: 75,
      quizScores: [100],
    });

    expect(grade.project).toBe(85);
    expect(grade.module).toBe(75);
    expect(grade.quiz).toBe(100);
    expect(grade.final).toBe(83);
    expect(grade.letter).toBe('B');
  });

  it('handles missing project and quiz scores as zero', () => {
    const grade = calculateGrade({ projectScores: [], modulePercent: 100, quizScores: [] });
    expect(grade.project).toBe(0);
    expect(grade.quiz).toBe(0);
    expect(grade.final).toBe(40);
    expect(grade.letter).toBe('E');
  });

  it('maps final scores to letters', () => {
    expect(gradeLetter(100)).toBe('A');
    expect(gradeLetter(85)).toBe('A');
    expect(gradeLetter(84)).toBe('B');
    expect(gradeLetter(75)).toBe('B');
    expect(gradeLetter(74)).toBe('C');
    expect(gradeLetter(65)).toBe('C');
    expect(gradeLetter(64)).toBe('D');
    expect(gradeLetter(55)).toBe('D');
    expect(gradeLetter(54)).toBe('E');
  });

  it('maps scores to badge tones', () => {
    expect(gradeTone(90)).toBe('green');
    expect(gradeTone(70)).toBe('amber');
    expect(gradeTone(50)).toBe('blue');
    expect(gradeTone(20)).toBe('slate');
  });
});
