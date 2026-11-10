import { describe, expect, it } from 'vitest';
import { formatDate, formatDuration, safeExternalUrl } from './format';

describe('safeExternalUrl', () => {
  it('returns null for null or empty values', () => {
    expect(safeExternalUrl(null)).toBeNull();
    expect(safeExternalUrl(undefined)).toBeNull();
    expect(safeExternalUrl('')).toBeNull();
  });

  it('allows http and https URLs', () => {
    expect(safeExternalUrl('https://example.com')).toBe('https://example.com/');
    expect(safeExternalUrl('http://localhost:5173')).toBe('http://localhost:5173/');
    expect(safeExternalUrl('https://webcode.lab/blog')).toBe('https://webcode.lab/blog');
  });

  it('rejects non-http(s) protocols', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(safeExternalUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(safeExternalUrl('file:///etc/passwd')).toBeNull();
  });

  it('returns null for values that are not valid URLs', () => {
    expect(safeExternalUrl('not-a-url')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(5)).toBe('00:05');
    expect(formatDuration(65)).toBe('01:05');
  });

  it('clamps negative values to zero', () => {
    expect(formatDuration(-10)).toBe('00:00');
  });
});

describe('formatDate', () => {
  it('returns a dash placeholder for null values', () => {
    expect(formatDate(null)).toBe('—');
  });
});
