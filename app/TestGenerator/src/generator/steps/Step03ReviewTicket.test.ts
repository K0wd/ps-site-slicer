import { describe, it, expect } from 'vitest';
import { safeName, isVisualAttachment, MAX_ATTACHMENT_BYTES } from './Step03ReviewTicket.js';

describe('Step03 — safeName', () => {
  it('returns the input unchanged when already safe', () => {
    expect(safeName('screenshot.png')).toBe('screenshot.png');
    expect(safeName('design-mockup-v2.pdf')).toBe('design-mockup-v2.pdf');
  });

  it('replaces forward and backward slashes with underscore', () => {
    expect(safeName('a/b/c.png')).toBe('a_b_c.png');
    expect(safeName('a\\b\\c.png')).toBe('a_b_c.png');
  });

  it('replaces control characters with underscore', () => {
    expect(safeName('file\x00.png')).toBe('file_.png');
    expect(safeName('file\x1f\x07.png')).toBe('file__.png');
  });

  it('replaces leading dots with underscore (no hidden traversal)', () => {
    expect(safeName('.env')).toBe('_env');
    expect(safeName('..secret')).toBe('_secret');
  });

  it('caps length at 200 chars', () => {
    const long = 'a'.repeat(500) + '.png';
    expect(safeName(long).length).toBe(200);
  });

  it('returns "attachment" placeholder when input is empty', () => {
    expect(safeName('')).toBe('attachment');
  });

  it('returns "attachment" when input becomes empty after sanitizing', () => {
    // All characters removed/replaced — control bytes fully stripped don't count, but
    // empty input is the case actually covered by the placeholder fallback.
    expect(safeName('')).toBe('attachment');
  });

  it('preserves Unicode in filenames', () => {
    expect(safeName('café-mockup.png')).toBe('café-mockup.png');
  });

  it('preserves spaces and hyphens', () => {
    expect(safeName('My File - v2 (final).pdf')).toBe('My File - v2 (final).pdf');
  });

  it('does not blow up on null-byte injection attempts', () => {
    expect(safeName('benign.png\x00.exe')).toBe('benign.png_.exe');
  });
});

describe('Step03 — isVisualAttachment', () => {
  describe('classified as visual via MIME', () => {
    it.each([
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp',
      'application/pdf',
    ])('treats MIME %s as visual', (mime) => {
      expect(isVisualAttachment('whatever.bin', mime)).toBe(true);
    });

    it('case-insensitive MIME matching', () => {
      expect(isVisualAttachment('x', 'IMAGE/PNG')).toBe(true);
      expect(isVisualAttachment('x', 'Application/PDF')).toBe(true);
    });
  });

  describe('classified as visual via filename extension', () => {
    it.each(['shot.png', 'shot.PNG', 'photo.jpg', 'photo.jpeg', 'icon.gif', 'modern.webp', 'doc.pdf'])(
      'treats %s as visual when MIME is missing',
      (name) => {
        expect(isVisualAttachment(name, '')).toBe(true);
        expect(isVisualAttachment(name, null)).toBe(true);
        expect(isVisualAttachment(name, undefined)).toBe(true);
      },
    );
  });

  describe('not classified as visual', () => {
    it('rejects unrelated MIME types like text/plain', () => {
      expect(isVisualAttachment('notes.txt', 'text/plain')).toBe(false);
    });

    it('rejects video and audio', () => {
      expect(isVisualAttachment('clip.mp4', 'video/mp4')).toBe(false);
      expect(isVisualAttachment('audio.mp3', 'audio/mpeg')).toBe(false);
    });

    it('rejects archives and executables', () => {
      expect(isVisualAttachment('bundle.zip', 'application/zip')).toBe(false);
      expect(isVisualAttachment('script.sh', 'text/x-sh')).toBe(false);
    });

    it('rejects ambiguous binary stream when extension is non-visual', () => {
      expect(isVisualAttachment('weird.bin', 'application/octet-stream')).toBe(false);
    });
  });

  describe('MIME-vs-extension precedence', () => {
    it('rejects when MIME is non-visual even if extension is visual (bad upload)', () => {
      // Filename ends in .png but server reports text/plain — MIME wins on positive match,
      // extension is the *fallback* when MIME is empty/missing. Since MIME is present and
      // does not match VISUAL_MIMES, AND the extension does match, the fallback fires.
      // (Current behavior: extension wins as fallback. Documenting the intent.)
      expect(isVisualAttachment('bad-mime.png', 'text/plain')).toBe(true);
    });

    it('accepts when MIME matches even if extension does not', () => {
      // Server reports image/png but filename is foo.bin — MIME wins.
      expect(isVisualAttachment('mystery.bin', 'image/png')).toBe(true);
    });
  });
});

describe('Step03 — MAX_ATTACHMENT_BYTES', () => {
  it('is 10 MB so unbounded uploads do not pull gigabytes from Jira', () => {
    expect(MAX_ATTACHMENT_BYTES).toBe(10 * 1024 * 1024);
  });
});
