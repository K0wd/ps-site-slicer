import type { Config } from '../shared/config/Config.js';

export interface JiraAttachment { id: string; filename: string; }

export class JiraService {
  private authHeader: string;
  private baseApiUrl: string;

  constructor(private config: Config) {
    const creds = Buffer.from(`${config.jiraEmail}:${config.jiraApiToken}`).toString('base64');
    this.authHeader = `Basic ${creds}`;
    this.baseApiUrl = `${config.jiraBaseUrl}/rest/api/3`;
  }

  private async request(method: string, path: string, body?: unknown): Promise<any> {
    const url = `${this.baseApiUrl}/${path.replace(/^\//, '')}`;
    const headers: Record<string, string> = {
      'Authorization': this.authHeader,
      'Accept': 'application/json',
    };

    const init: RequestInit = { method, headers };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    const resp = await fetch(url, init);

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      throw new Error(`Jira API error: HTTP ${resp.status} — ${detail.substring(0, 500)}`);
    }

    const text = await resp.text();
    return text ? JSON.parse(text) : null;
  }

  async testAuth(): Promise<{ displayName: string; email: string }> {
    const result = await this.request('GET', 'myself');
    return {
      displayName: result.displayName || 'N/A',
      email: result.emailAddress || 'N/A',
    };
  }

  async getIssue(issueKey: string, fields?: string): Promise<any> {
    const path = fields ? `issue/${issueKey}?fields=${fields}` : `issue/${issueKey}`;
    return this.request('GET', path);
  }

  async search(jql: string, fields?: string, maxResults = 50): Promise<any> {
    const body: any = { jql, maxResults };
    if (fields) body.fields = fields.split(',');

    const allIssues: any[] = [];
    let nextPageToken: string | undefined;

    do {
      if (nextPageToken) body.nextPageToken = nextPageToken;
      const result = await this.request('POST', 'search/jql', body);
      allIssues.push(...(result.issues || []));
      nextPageToken = result.nextPageToken;
    } while (nextPageToken && allIssues.length < maxResults);

    return { returned: allIssues.length, issues: allIssues };
  }

  async getComments(issueKey: string): Promise<any> {
    return this.request('GET', `issue/${issueKey}/comment`);
  }

  async addComment(issueKey: string, bodyText: string, inlineImages?: JiraAttachment[]): Promise<any> {
    const content: any[] = bodyText.split('\n').map(line => ({
      type: 'paragraph',
      content: [{ type: 'text', text: line.trim() || ' ' }],
    }));

    if (inlineImages && inlineImages.length > 0) {
      content.push({
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Test Evidence' }],
      });
      for (const img of inlineImages) {
        content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: img.filename, marks: [{ type: 'code' }] }],
        });
        content.push({
          type: 'mediaSingle',
          attrs: { layout: 'center' },
          content: [{ type: 'media', attrs: { id: img.id, type: 'file', collection: '' } }],
        });
      }
    }

    return this.request('POST', `issue/${issueKey}/comment`, {
      body: { type: 'doc', version: 1, content },
    });
  }

  async getTransitions(issueKey: string): Promise<any[]> {
    const result = await this.request('GET', `issue/${issueKey}/transitions`);
    return result.transitions || [];
  }

  async transition(issueKey: string, statusName: string): Promise<void> {
    const transitions = await this.getTransitions(issueKey);
    const match = transitions.find(
      (t: any) => t.name.toLowerCase() === statusName.toLowerCase()
    );
    if (!match) {
      const available = transitions.map((t: any) => t.name).join(', ');
      throw new Error(`Transition '${statusName}' not available. Available: ${available}`);
    }
    await this.request('POST', `issue/${issueKey}/transitions`, {
      transition: { id: match.id },
    });
  }

  async getAttachments(issueKey: string): Promise<any[]> {
    const result = await this.request('GET', `issue/${issueKey}?fields=attachment`);
    return result.fields?.attachment || [];
  }

  // Download a Jira attachment to disk. The attachment `content` URL requires the same
  // Basic auth as the API (it's not anonymous), and goes to the wiki host, not /rest/api/3.
  async downloadAttachment(contentUrl: string, destPath: string): Promise<{ bytes: number; contentType: string }> {
    const resp = await fetch(contentUrl, {
      headers: { 'Authorization': this.authHeader, 'Accept': '*/*' },
      redirect: 'follow',
    });
    if (!resp.ok) {
      throw new Error(`Attachment download failed: HTTP ${resp.status} ${resp.statusText} for ${contentUrl}`);
    }
    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const buf = Buffer.from(await resp.arrayBuffer());
    const { writeFileSync, mkdirSync } = await import('fs');
    const { dirname } = await import('path');
    mkdirSync(dirname(destPath), { recursive: true });
    writeFileSync(destPath, buf);
    return { bytes: buf.length, contentType };
  }

  async uploadAttachment(issueKey: string, filePath: string): Promise<any> {
    const { readFileSync } = await import('fs');
    const { basename } = await import('path');

    const fileName = basename(filePath);
    const fileData = readFileSync(filePath);
    const boundary = '----FormBoundary7MA4YWxkTrZu0gW';

    const prefix = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`;
    const suffix = `\r\n--${boundary}--\r\n`;

    const body = Buffer.concat([Buffer.from(prefix), fileData, Buffer.from(suffix)]);

    const url = `${this.baseApiUrl}/issue/${issueKey}/attachments`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Accept': 'application/json',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-Atlassian-Token': 'no-check',
      },
      body,
    });

    if (!resp.ok) {
      throw new Error(`Upload failed: HTTP ${resp.status}`);
    }

    return resp.json();
  }
}
