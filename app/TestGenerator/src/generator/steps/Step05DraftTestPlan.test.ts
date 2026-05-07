import { describe, it, expect } from 'vitest';
import { parseVisualEntries } from './Step05DraftTestPlan.js';

// Helper: build the same shape Step03 writes to 3_attachments.md so the parser is exercised
// against realistic input, not contrived strings.
function attachmentBlock(opts: {
  filename: string;
  localPath: string;
  remoteUrl?: string;
  mime?: string;
  size?: number;
  visual: 'yes' | 'no';
  status: string;
}): string {
  return [
    `## ${opts.filename}`,
    '',
    `- **Local path:** \`${opts.localPath}\``,
    `- **Remote URL:** ${opts.remoteUrl || 'https://example/x'}`,
    `- **MIME:** ${opts.mime || 'image/png'}`,
    `- **Size:** ${opts.size ?? 1234} bytes`,
    `- **Visual (Claude can Read):** ${opts.visual}`,
    `- **Status:** ${opts.status}`,
    '',
  ].join('\n');
}

function attachmentsMd(blocks: string[]): string {
  return ['# Attachments for SM-1118', '', ...blocks].join('\n');
}

describe('Step05 — parseVisualEntries', () => {
  it('returns empty array for an empty file', () => {
    expect(parseVisualEntries('')).toEqual([]);
  });

  it('returns empty array for the "no attachments" placeholder', () => {
    expect(parseVisualEntries('No attachments on SM-1118')).toEqual([]);
  });

  it('extracts a single visual entry with downloaded status', () => {
    const md = attachmentsMd([
      attachmentBlock({
        filename: 'screenshot.png',
        localPath: '/tmp/x/screenshot.png',
        visual: 'yes',
        status: 'downloaded 12345 bytes (image/png)',
      }),
    ]);
    expect(parseVisualEntries(md)).toEqual([
      { localPath: '/tmp/x/screenshot.png', status: 'downloaded 12345 bytes (image/png)' },
    ]);
  });

  it('extracts cached-on-disk entries (idempotent re-runs)', () => {
    const md = attachmentsMd([
      attachmentBlock({
        filename: 'mockup.pdf',
        localPath: '/tmp/x/mockup.pdf',
        visual: 'yes',
        status: 'cached on disk',
      }),
    ]);
    expect(parseVisualEntries(md)).toHaveLength(1);
  });

  it('skips entries flagged "Visual: no"', () => {
    const md = attachmentsMd([
      attachmentBlock({
        filename: 'log.txt',
        localPath: '/tmp/x/log.txt',
        visual: 'no',
        status: 'downloaded 800 bytes (text/plain)',
      }),
    ]);
    expect(parseVisualEntries(md)).toEqual([]);
  });

  it('skips entries with "skipped:" status (over size cap)', () => {
    const md = attachmentsMd([
      attachmentBlock({
        filename: 'huge.png',
        localPath: '/tmp/x/huge.png',
        visual: 'yes',
        status: 'skipped: 50000000 bytes exceeds 10485760-byte cap',
      }),
    ]);
    expect(parseVisualEntries(md)).toEqual([]);
  });

  it('skips entries with "download failed" status', () => {
    const md = attachmentsMd([
      attachmentBlock({
        filename: 'broken.png',
        localPath: '/tmp/x/broken.png',
        visual: 'yes',
        status: 'download failed: HTTP 403 Forbidden',
      }),
    ]);
    expect(parseVisualEntries(md)).toEqual([]);
  });

  it('returns multiple visual entries in document order', () => {
    const md = attachmentsMd([
      attachmentBlock({
        filename: 'one.png',
        localPath: '/tmp/x/one.png',
        visual: 'yes',
        status: 'downloaded 100 bytes (image/png)',
      }),
      attachmentBlock({
        filename: 'two.pdf',
        localPath: '/tmp/x/two.pdf',
        visual: 'yes',
        status: 'cached on disk',
      }),
      attachmentBlock({
        filename: 'three.jpg',
        localPath: '/tmp/x/three.jpg',
        visual: 'yes',
        status: 'downloaded 200 bytes (image/jpeg)',
      }),
    ]);
    const out = parseVisualEntries(md);
    expect(out.map(e => e.localPath)).toEqual([
      '/tmp/x/one.png',
      '/tmp/x/two.pdf',
      '/tmp/x/three.jpg',
    ]);
  });

  it('mixes visual + non-visual + skipped + failed and returns only the keepers', () => {
    const md = attachmentsMd([
      attachmentBlock({
        filename: 'good.png',
        localPath: '/tmp/x/good.png',
        visual: 'yes',
        status: 'downloaded 100 bytes (image/png)',
      }),
      attachmentBlock({
        filename: 'log.txt',
        localPath: '/tmp/x/log.txt',
        visual: 'no',
        status: 'downloaded 50 bytes (text/plain)',
      }),
      attachmentBlock({
        filename: 'big.png',
        localPath: '/tmp/x/big.png',
        visual: 'yes',
        status: 'skipped: too big',
      }),
      attachmentBlock({
        filename: 'cached.pdf',
        localPath: '/tmp/x/cached.pdf',
        visual: 'yes',
        status: 'cached on disk',
      }),
      attachmentBlock({
        filename: 'broken.jpg',
        localPath: '/tmp/x/broken.jpg',
        visual: 'yes',
        status: 'download failed: 500',
      }),
    ]);
    const out = parseVisualEntries(md);
    expect(out.map(e => e.localPath)).toEqual(['/tmp/x/good.png', '/tmp/x/cached.pdf']);
  });

  it('case-insensitive on "Visual" flag and "skipped/failed" status checks', () => {
    const md = `# Attachments

## a
- **Local path:** \`/tmp/a.png\`
- **Visual (Claude can Read):** YES
- **Status:** Downloaded 1 bytes
`;
    expect(parseVisualEntries(md)).toHaveLength(1);
  });

  it('ignores entries with no Local path field', () => {
    const md = `# Attachments

## broken
- **Visual (Claude can Read):** yes
- **Status:** downloaded
`;
    expect(parseVisualEntries(md)).toEqual([]);
  });

  it('handles paths with spaces and Unicode', () => {
    const md = attachmentsMd([
      attachmentBlock({
        filename: 'café shot.png',
        localPath: '/tmp/some dir/café shot.png',
        visual: 'yes',
        status: 'downloaded 100 bytes (image/png)',
      }),
    ]);
    const out = parseVisualEntries(md);
    expect(out[0]!.localPath).toBe('/tmp/some dir/café shot.png');
  });
});
