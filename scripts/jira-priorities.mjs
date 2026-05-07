import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Load .env manually
const envContent = readFileSync(resolve(root, '.env'), 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const baseUrl = env.JIRA_BASE_URL || 'https://powerslicesoftware.atlassian.net';
const email = env.JIRA_EMAIL;
const token = env.JIRA_API_TOKEN;

if (!email || !token) {
  console.error('Missing JIRA_EMAIL or JIRA_API_TOKEN in .env');
  process.exit(1);
}

const auth = Buffer.from(`${email}:${token}`).toString('base64');

const jql = 'project = SM AND assignee = currentUser() AND status != Done ORDER BY duedate ASC, priority ASC';
const fields = ['summary', 'priority', 'status', 'duedate', 'issuetype', 'created', 'updated'];
const url = `${baseUrl}/rest/api/3/search/jql`;

console.log('Fetching tickets from Jira...');

const res = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Basic ${auth}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ jql, fields, maxResults: 100 }),
});

if (!res.ok) {
  console.error(`Jira API error: ${res.status} ${res.statusText}`);
  const body = await res.text();
  console.error(body);
  process.exit(1);
}

const data = await res.json();
const issues = data.issues || [];
console.log(`Found ${issues.length} tickets assigned to you.`);

function priorityColor(name) {
  switch (name?.toLowerCase()) {
    case 'highest': return '#d32f2f';
    case 'high': return '#f57c00';
    case 'medium': return '#fbc02d';
    case 'low': return '#388e3c';
    case 'lowest': return '#1976d2';
    default: return '#757575';
  }
}

function statusBadge(name) {
  const colors = {
    'to do': '#e0e0e0',
    'backlog': '#e0e0e0',
    'in progress': '#bbdefb',
    'in review': '#c8e6c9',
    'done': '#a5d6a7',
  };
  const bg = colors[name?.toLowerCase()] || '#e0e0e0';
  return `<span style="background:${bg};padding:2px 8px;border-radius:4px;font-size:12px;">${name}</span>`;
}

function formatDate(dateStr) {
  if (!dateStr) return '<span style="color:#999">No due date</span>';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  let color = '#333';
  if (diff < 0) color = '#d32f2f';
  else if (diff <= 7) color = '#f57c00';
  return `<span style="color:${color}">${d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>`;
}

const infoDir = resolve(root, 'app/TestGenerator/logs/info');

const planContents = {};
for (const issue of issues) {
  const planPath = resolve(infoDir, issue.key, '5_plan_manual.html');
  if (existsSync(planPath)) {
    planContents[issue.key] = readFileSync(planPath, 'utf8');
  }
}
console.log(`Found ${Object.keys(planContents).length} tickets with 5_plan_manual.html`);

const rows = issues.map((issue) => {
  const f = issue.fields;
  const hasPlan = !!planContents[issue.key];
  const planCell = hasPlan
    ? `<a href="${issue.key}/5_plan_manual.html" target="_blank" class="plan-link" title="Open test plan">📄 View</a> <button class="copy-btn" data-key="${issue.key}" title="Copy test plan">📋</button>`
    : `<span style="color:#ccc" title="No plan file">—</span>`;
  return `
    <tr>
      <td data-col="key"><a href="${baseUrl}/browse/${issue.key}" target="_blank">${issue.key}</a></td>
      <td data-col="priority"><span style="color:${priorityColor(f.priority?.name)};font-weight:bold;">●</span> ${f.priority?.name || '-'}</td>
      <td data-col="summary">${f.summary}</td>
      <td data-col="type">${f.issuetype?.name || '-'}</td>
      <td data-col="status">${statusBadge(f.status?.name)}</td>
      <td data-col="duedate">${formatDate(f.duedate)}</td>
      <td data-col="plan">${planCell}</td>
    </tr>`;
}).join('');

const columns = ['key', 'priority', 'summary', 'type', 'status', 'duedate', 'plan'];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SM Priority Tickets — ${email}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #f5f5f5; }
    h1 { margin-bottom: 4px; font-size: 22px; }
    .subtitle { color: #666; margin-bottom: 12px; font-size: 14px; }
    .toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .col-toggle { display: none; gap: 8px; flex-wrap: wrap; padding: 12px; background: white; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 16px; }
    .col-toggle.open { display: flex; }
    .col-toggle label { display: flex; align-items: center; gap: 4px; font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 4px; background: #f5f5f5; user-select: none; }
    .col-toggle label:hover { background: #e3f2fd; }
    .col-toggle input:checked + span { font-weight: 600; }
    .settings-btn { border: 1px solid #ddd; background: white; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-size: 13px; }
    .settings-btn:hover { background: #e3f2fd; border-color: #90caf9; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th { background: #263238; color: white; text-align: left; padding: 12px 16px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 16px; border-bottom: 1px solid #eee; font-size: 14px; }
    tr:hover td { background: #f9f9f9; }
    a { color: #1565c0; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
    .copy-btn { border: 1px solid #ddd; background: white; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 14px; }
    .copy-btn:hover { background: #e3f2fd; border-color: #90caf9; }
    .copy-btn.copied { background: #c8e6c9; border-color: #66bb6a; }
    .empty { text-align: center; padding: 40px; color: #999; }
    .generated { margin-top: 16px; font-size: 12px; color: #999; }
    .col-hidden { display: none; }
  </style>
</head>
<body>
  <h1>Site Manager — My Priority Tickets</h1>
  <p class="subtitle">${issues.length} open tickets assigned to ${email} · Sorted by due date</p>
  <div class="toolbar">
    <button class="settings-btn" id="toggle-settings">Columns</button>
  </div>
  <div class="col-toggle" id="col-settings">
    ${columns.map(c => `<label><input type="checkbox" data-col="${c}" checked><span>${c.charAt(0).toUpperCase() + c.slice(1).replace('duedate','Due Date')}</span></label>`).join('\n    ')}
  </div>
  ${issues.length === 0 ? '<p class="empty">No tickets found!</p>' : `
  <table id="tickets-table">
    <thead>
      <tr>
        <th data-col="key">Key</th>
        <th data-col="priority">Priority</th>
        <th data-col="summary">Summary</th>
        <th data-col="type">Type</th>
        <th data-col="status">Status</th>
        <th data-col="duedate">Due Date</th>
        <th data-col="plan">Plan</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`}
  <p class="generated">Generated ${new Date().toLocaleString()} · <a href="${baseUrl}/jira/software/c/projects/SM/boards/6" target="_blank">Open Board</a></p>
  <script id="plan-data" type="application/json">${JSON.stringify(planContents)}</script>
  <script>
    const STORAGE_KEY = 'sm-priorities-columns';
    const allCols = ${JSON.stringify(columns)};

    function loadSettings() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
    }

    function saveSettings(visible) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visible));
    }

    function applyColumns(visible) {
      allCols.forEach(col => {
        const show = visible.includes(col);
        document.querySelectorAll('[data-col="' + col + '"]').forEach(el => {
          el.classList.toggle('col-hidden', !show);
        });
      });
    }

    // Init
    const saved = loadSettings() || allCols.slice();
    const checkboxes = document.querySelectorAll('#col-settings input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = saved.includes(cb.dataset.col);
      cb.addEventListener('change', () => {
        const visible = Array.from(checkboxes).filter(c => c.checked).map(c => c.dataset.col);
        saveSettings(visible);
        applyColumns(visible);
      });
    });
    applyColumns(saved);

    // Toggle settings panel
    document.getElementById('toggle-settings').addEventListener('click', () => {
      document.getElementById('col-settings').classList.toggle('open');
    });

    // Copy plan buttons
    const plans = JSON.parse(document.getElementById('plan-data').textContent);
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const key = btn.dataset.key;
        const content = plans[key];
        if (!content) return;
        try {
          await navigator.clipboard.writeText(content);
          btn.classList.add('copied');
          btn.textContent = '✓';
          setTimeout(() => { btn.classList.remove('copied'); btn.textContent = '📋'; }, 2000);
        } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = content;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          btn.classList.add('copied');
          btn.textContent = '✓';
          setTimeout(() => { btn.classList.remove('copied'); btn.textContent = '📋'; }, 2000);
        }
      });
    });
  </script>
</body>
</html>`;

const outPath = resolve(root, 'app/TestGenerator/logs/info/my-priorities.html');
writeFileSync(outPath, html);
console.log(`✓ Written to ${outPath}`);
console.log(`  Open: http://localhost:4000/my-priorities.html`);
