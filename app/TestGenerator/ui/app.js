const STEPS = [
  { number: 1,  name: 'Verify Jira Auth' },
  { number: 2,  name: 'Find Ticket' },
  { number: 3,  name: 'Review Ticket' },
  { number: 4,  name: 'Review Code' },
  { number: 5,  name: 'Draft Test Plan' },
  { number: 6,  name: 'Write Gherkin Steps' },
  { number: 7,  name: 'Write Automated Tests' },
  { number: 8,  name: 'Execute Tests' },
  { number: 9,  name: 'Determine Results' },
  { number: 10, name: 'Post Results' },
  { number: 11, name: 'Transition Ticket' },
];

const state = {
  steps: STEPS.map(s => ({ ...s, status: 'idle', duration: null, message: null })),
  running: false,
  ticketKey: null,
  ticketSummary: null,
  ticketStatus: null,
  ticketAssignee: null,
  schedules: [],
  schedModalStep: null,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const grid = $('#pipeline-grid');
const logOutput = $('#log-output');
const runBtn = $('#run-btn');
const ticketInput = $('#ticket-input');
const filterSelect = $('#filter-select');
const stepStartInput = $('#step-start');
const stepEndInput = $('#step-end');
const historyList = $('#history-list');
const ticketBar = $('#ticket-bar');
const clearLogsBtn = $('#clear-logs-btn');

// ═══ RENDER ═══

function renderGrid() {
  grid.innerHTML = '';
  for (const step of state.steps) {
    const statusClass = step.status !== 'idle' ? `status-${step.status}` : '';
    const stepSchedules = state.schedules.filter(s => s.step_start <= step.number && s.step_end >= step.number && s.enabled);
    const hasSchedule = stepSchedules.length > 0;

    const card = document.createElement('div');
    card.className = `step-card ${statusClass}`;
    card.innerHTML = `
      <div class="step-header">
        <span class="step-number">STEP ${String(step.number).padStart(2, '0')}</span>
        <div class="status-indicator">
          ${hasSchedule ? '<span class="sched-badge" title="Scheduled">&#128337;</span>' : ''}
          <span class="status-dot ${step.status}"></span>
          ${step.status !== 'idle' ? `<span class="status-label ${step.status}">${step.status.toUpperCase()}</span>` : ''}
        </div>
      </div>
      <div class="step-name">${step.name}</div>
      <div class="step-footer">
        <span class="step-duration">${step.duration || ''}</span>
        <div class="step-actions">
          <button class="step-sched-btn" data-step="${step.number}" title="Schedule">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
          <button class="step-run-btn" data-step="${step.number}" ${state.running ? 'disabled' : ''}>Run</button>
        </div>
      </div>
      ${step.message ? `<div class="step-message" title="${esc(step.message)}">${esc(step.message)}</div>` : ''}
    `;
    grid.appendChild(card);
  }

  grid.querySelectorAll('.step-run-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      runStep(parseInt(btn.dataset.step));
    });
  });

  grid.querySelectorAll('.step-sched-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openScheduleModal(parseInt(btn.dataset.step));
    });
  });

  grid.querySelectorAll('.step-card').forEach((card, idx) => {
    card.addEventListener('click', () => loadStepLogs(state.steps[idx].number));
  });
}

function renderTicketBar() {
  if (state.ticketKey) {
    ticketBar.classList.remove('hidden');
    $('#ticket-key-display').textContent = state.ticketKey;
    $('#ticket-summary-display').textContent = state.ticketSummary || '';
    $('#ticket-status-display').textContent = state.ticketStatus || '';
    $('#ticket-assignee-display').textContent = state.ticketAssignee || '';
  } else {
    ticketBar.classList.add('hidden');
  }
}

function appendLog(entry) {
  const line = document.createElement('div');
  line.className = `log-line ${entry.level || 'info'}`;
  line.innerHTML = `<span class="ts">${entry.timestamp || ''}</span><span class="tag">[Step ${entry.stepNumber || '?'}]</span><span class="msg">${esc(entry.message || '')}</span>`;
  logOutput.appendChild(line);
  logOutput.scrollTop = logOutput.scrollHeight;
}

function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

function formatDuration(ms) {
  if (!ms) return '';
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${secs % 60}s`;
}

function now() { return new Date().toLocaleTimeString(); }

// ═══ HISTORY ═══

const runDetail = $('#run-detail');

async function loadHistory() {
  try {
    const resp = await fetch('/api/runs');
    const runs = await resp.json();
    historyList.innerHTML = '';
    historyList.classList.remove('hidden');
    runDetail.classList.add('hidden');
    if (runs.length === 0) {
      historyList.innerHTML = '<div class="empty-state">No runs yet</div>';
      return;
    }
    for (const run of runs) {
      const statusIcon = run.status === 'completed' ? '&#10003;' : run.status === 'failed' ? '&#10007;' : '&#8987;';
      const circles = (run.steps || []).map(s =>
        `<span class="step-circle ${s.status}" title="Step ${s.step_number}: ${s.status}"></span>`
      ).join('');
      const item = document.createElement('div');
      item.className = 'history-item';
      item.dataset.runId = run.id;
      item.innerHTML = `
        <span class="run-dot ${run.status}"></span>
        <span class="run-time">${formatRunTime(run.started_at)}</span>
        <span class="run-ticket">${run.ticket_key || 'auto'}</span>
        <span class="step-circles">${circles}</span>
        <span class="run-status-text ${run.status}">${statusIcon} ${run.status}</span>
        <span class="run-duration">${formatDuration(run.duration_ms)}</span>
      `;
      item.addEventListener('click', () => loadRunDetail(run.id));
      historyList.appendChild(item);
    }
  } catch { historyList.innerHTML = '<div class="empty-state">Failed to load history</div>'; }
}

function formatRunTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr + 'Z');
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function loadRunDetail(runId) {
  try {
    const resp = await fetch(`/api/runs/${runId}`);
    const run = await resp.json();
    historyList.classList.add('hidden');
    runDetail.classList.remove('hidden');

    const statusClass = run.status === 'completed' ? 'pass' : 'fail';
    const stepsHtml = (run.steps || []).map(s => {
      const icon = s.status === 'pass' ? '&#10003;' : s.status === 'fail' ? '&#10007;' : s.status === 'warn' ? '&#9888;' : s.status === 'running' ? '&#8987;' : '&#8212;';
      const sClass = s.status === 'pass' ? 'pass' : s.status === 'fail' ? 'fail' : s.status === 'warn' ? 'warn' : 'idle';
      const logsHtml = (s.logs || []).map(l =>
        `<div class="detail-log ${l.level}">${esc(l.message)}</div>`
      ).join('');
      const errorHtml = s.error_output ? `<pre class="detail-error">${esc(s.error_output)}</pre>` : '';
      return `
        <div class="detail-step">
          <div class="detail-step-header ${sClass}">
            <span class="detail-step-icon">${icon}</span>
            <span class="detail-step-num">Step ${String(s.step_number).padStart(2,'0')}</span>
            <span class="detail-step-name">${esc(s.step_name)}</span>
            ${s.ticket_key ? `<span class="detail-step-ticket">${esc(s.ticket_key)}</span>` : ''}
            <span class="detail-step-dur">${formatDuration(s.duration_ms)}</span>
          </div>
          ${s.message ? `<div class="detail-step-msg">${esc(s.message)}</div>` : ''}
          ${logsHtml ? `<div class="detail-logs">${logsHtml}</div>` : ''}
          ${errorHtml}
        </div>`;
    }).join('');

    runDetail.innerHTML = `
      <div class="detail-header">
        <button class="detail-back" id="detail-back">&larr; Back to History</button>
        <div class="detail-title">
          <span class="run-dot ${run.status}"></span>
          Run #${run.id} — ${formatRunTime(run.started_at)}
        </div>
        <div class="detail-meta">
          <span class="detail-status ${statusClass}">${run.status}</span>
          <span>${formatDuration(run.duration_ms)}</span>
          ${run.ticket_key ? `<span class="run-ticket">${run.ticket_key}</span>` : ''}
          <span>Steps ${run.step_start}-${run.step_end}</span>
        </div>
      </div>
      <div class="detail-steps">${stepsHtml || '<div class="empty-state">No step data recorded</div>'}</div>
    `;

    $('#detail-back').addEventListener('click', loadHistory);
  } catch {
    runDetail.innerHTML = '<div class="empty-state">Failed to load run details</div>';
  }
}

// ═══ STEP LOGS ═══

const stepLogsHeader = $('#step-logs-header');
const stepLogsOutput = $('#step-logs-output');

function switchTab(tabName) {
  $$('.tab').forEach(t => t.classList.remove('active'));
  $$('.tab-content').forEach(c => c.classList.remove('active'));
  const tabBtn = $(`.tab[data-tab="${tabName}"]`);
  if (tabBtn) tabBtn.classList.add('active');
  $(`#tab-${tabName}`)?.classList.add('active');
}

async function loadStepLogs(stepNum) {
  switchTab('step-logs');
  const stepDef = STEPS.find(s => s.number === stepNum);
  stepLogsHeader.innerHTML = `<span class="step-logs-title">Step ${String(stepNum).padStart(2,'0')}: ${stepDef?.name || ''}</span>`;
  stepLogsOutput.innerHTML = '<div class="empty-state">Loading...</div>';

  // highlight selected card
  $$('.step-card').forEach(c => c.classList.remove('selected'));
  $$('.step-card')[stepNum - 1]?.classList.add('selected');

  try {
    const resp = await fetch(`/api/steps/${stepNum}/history`);
    const results = await resp.json();
    stepLogsOutput.innerHTML = '';

    if (results.length === 0) {
      stepLogsOutput.innerHTML = '<div class="empty-state">No logs for this step yet</div>';
      return;
    }

    for (const r of results) {
      const statusIcon = r.status === 'pass' ? '&#10003;' : r.status === 'fail' ? '&#10007;' : r.status === 'warn' ? '&#9888;' : '&#8212;';
      const sClass = r.status === 'pass' ? 'pass' : r.status === 'fail' ? 'fail' : r.status === 'warn' ? 'warn' : 'idle';
      const time = formatRunTime(r.run_started_at || r.started_at);
      const ticket = r.ticket_key ? ` | ${r.ticket_key}` : '';

      const header = document.createElement('div');
      header.className = `step-log-run ${sClass}`;
      header.innerHTML = `
        <span class="step-log-icon">${statusIcon}</span>
        <span class="step-log-time">${time}</span>
        <span class="step-log-status">${r.status.toUpperCase()}</span>
        <span class="step-log-dur">${formatDuration(r.duration_ms)}${ticket}</span>
      `;
      stepLogsOutput.appendChild(header);

      if (r.message) {
        const msg = document.createElement('div');
        msg.className = 'step-log-msg';
        msg.textContent = r.message;
        stepLogsOutput.appendChild(msg);
      }

      if (r.logs && r.logs.length > 0) {
        for (const l of r.logs) {
          const line = document.createElement('div');
          line.className = `log-line ${l.level || 'info'}`;
          line.innerHTML = `<span class="ts">${l.timestamp || ''}</span><span class="msg">${esc(l.message || '')}</span>`;
          stepLogsOutput.appendChild(line);
        }
      }

      if (r.error_output) {
        const err = document.createElement('pre');
        err.className = 'detail-error';
        err.textContent = r.error_output;
        stepLogsOutput.appendChild(err);
      }
    }
  } catch {
    stepLogsOutput.innerHTML = '<div class="empty-state">Failed to load step logs</div>';
  }
}

// ═══ TABS ═══

$$('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.tab);
    if (tab.dataset.tab === 'history') loadHistory();
  });
});

clearLogsBtn.addEventListener('click', () => { logOutput.innerHTML = ''; });

// ═══ API ═══

async function runStep(stepNum) {
  const ticketKey = ticketInput.value.trim().toUpperCase() || undefined;
  try {
    await fetch(`/api/run/step/${stepNum}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketKey }),
    });
  } catch (e) { appendLog({ timestamp: now(), level: 'error', message: `Failed: ${e.message}` }); }
}

async function runPipeline() {
  const ticketKey = ticketInput.value.trim().toUpperCase() || undefined;
  const filter = ticketKey ? undefined : filterSelect.value;
  const stepStart = parseInt(stepStartInput.value);
  const stepEnd = parseInt(stepEndInput.value);
  try {
    const resp = await fetch('/api/run', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepStart, stepEnd, ticketKey, filter }),
    });
    if (resp.status === 409) {
      appendLog({ timestamp: now(), level: 'warn', stepNumber: '-', message: 'Pipeline is already running' });
    }
  } catch (e) { appendLog({ timestamp: now(), level: 'error', message: `Failed: ${e.message}` }); }
}

runBtn.addEventListener('click', runPipeline);

// ═══ SCHEDULE MODAL ═══

const schedModal = $('#schedule-modal');
const modalClose = $('#modal-close');
const schedHourInput = $('#sched-hour');
const schedMinuteInput = $('#sched-minute');
const cronHH = $('#cron-hh');
const cronMM = $('#cron-mm');
const cronLabel = $('#cron-label');
const cronDesc = $('#cron-desc');
const schedSaveBtn = $('#sched-save-btn');
const schedList = $('#sched-list');
const modalTitle = $('#modal-title');
const freqPills = $('#freq-pills');
const hourField = $('#hour-field');

let selectedFreq = 24;

function openScheduleModal(stepNum) {
  state.schedModalStep = stepNum;
  const stepDef = STEPS.find(s => s.number === stepNum);
  modalTitle.textContent = `Schedule — Step ${String(stepNum).padStart(2,'0')}: ${stepDef?.name || ''}`;
  schedModal.classList.remove('hidden');
  loadSchedules();
  selectFreq(24);
  updateCronPreview();
}

modalClose.addEventListener('click', () => schedModal.classList.add('hidden'));
schedModal.addEventListener('click', (e) => { if (e.target === schedModal) schedModal.classList.add('hidden'); });

function selectFreq(freq) {
  selectedFreq = freq;
  freqPills.querySelectorAll('.freq-pill').forEach(p => {
    p.classList.toggle('active', parseInt(p.dataset.freq) === freq);
  });
  hourField.style.display = freq === 24 ? '' : 'none';
  updateCronPreview();
}

freqPills.addEventListener('click', (e) => {
  const pill = e.target.closest('.freq-pill');
  if (pill) selectFreq(parseInt(pill.dataset.freq));
});

function updateCronPreview() {
  const h = parseInt(schedHourInput.value) || 0;
  const m = parseInt(schedMinuteInput.value) || 0;

  if (selectedFreq === 24) {
    cronHH.textContent = String(h).padStart(2, '0');
    cronMM.textContent = String(m).padStart(2, '0');
    cronLabel.textContent = 'Daily at';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    cronDesc.textContent = `every day at ${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  } else {
    cronHH.textContent = String(selectedFreq).padStart(2, '0');
    cronMM.textContent = 'h';
    cronLabel.textContent = 'Every';
    const minStr = m > 0 ? ` at :${String(m).padStart(2, '0')} past each hour` : ' on the hour';
    cronDesc.textContent = `runs every ${selectedFreq} hours${minStr}`;
  }
}

schedHourInput.addEventListener('input', updateCronPreview);
schedMinuteInput.addEventListener('input', updateCronPreview);

schedSaveBtn.addEventListener('click', async () => {
  const stepNum = state.schedModalStep || 1;
  const h = selectedFreq === 24 ? (parseInt(schedHourInput.value) || 0) : 0;
  const m = parseInt(schedMinuteInput.value) || 0;
  const intervalHours = selectedFreq < 24 ? selectedFreq : null;
  const stepDef = STEPS.find(s => s.number === stepNum);
  const freqLabel = intervalHours ? `every ${intervalHours}h` : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  const name = $('#sched-name').value.trim() || `${stepDef?.name || 'Step ' + stepNum} — ${freqLabel}`;
  const filter = $('#sched-filter').value;
  const ticketKey = $('#sched-ticket').value.trim().toUpperCase() || undefined;

  try {
    await fetch('/api/schedules', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, minute: m, hour: h, stepStart: stepNum, stepEnd: stepNum, filter, ticketKey, intervalHours }),
    });
    $('#sched-name').value = '';
    await refreshSchedules();
    appendLog({ timestamp: now(), stepNumber: '-', level: 'info', message: `Schedule "${name}" created — ${freqLabel}` });
  } catch (e) { appendLog({ timestamp: now(), level: 'error', message: `Failed: ${e.message}` }); }
});

async function refreshSchedules() {
  try {
    const resp = await fetch('/api/schedules');
    state.schedules = await resp.json();
    renderGrid();
    loadSchedules();
  } catch { /* ok */ }
}

async function loadSchedules() {
  try {
    const resp = await fetch('/api/schedules');
    const schedules = await resp.json();
    state.schedules = schedules;
    schedList.innerHTML = '';

    // Filter to show schedules relevant to the current modal step
    const relevantScheds = state.schedModalStep
      ? schedules.filter(s => s.step_start <= state.schedModalStep && s.step_end >= state.schedModalStep)
      : schedules;

    if (relevantScheds.length === 0) {
      schedList.innerHTML = '<div class="sched-empty">No schedules for this step</div>';
      return;
    }

    for (const s of relevantScheds) {
      const timeStr = s.interval_hours
        ? `${s.interval_hours}h`
        : `${String(s.hour).padStart(2, '0')}:${String(s.minute).padStart(2, '0')}`;
      const detail = `Step ${s.step_start}${s.ticket_key ? ` | ${s.ticket_key}` : ''} | ${s.filter || 'all'}`;
      const nextRun = s.next_run_at ? new Date(s.next_run_at).toLocaleString() : '—';

      const item = document.createElement('div');
      item.className = 'sched-item';
      item.innerHTML = `
        <span class="sched-time">${timeStr}</span>
        <div class="sched-info">
          <div class="sched-item-name">${esc(s.name)}</div>
          <div class="sched-item-detail">${detail} | Next: ${nextRun}</div>
        </div>
        <button class="sched-toggle ${s.enabled ? 'enabled' : ''}" data-id="${s.id}">${s.enabled ? 'ON' : 'OFF'}</button>
        <button class="sched-delete" data-id="${s.id}" title="Delete">&times;</button>
      `;
      schedList.appendChild(item);
    }

    schedList.querySelectorAll('.sched-toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        await fetch(`/api/schedules/toggle/${btn.dataset.id}`, { method: 'POST' });
        await refreshSchedules();
      });
    });

    schedList.querySelectorAll('.sched-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        await fetch(`/api/schedules/delete/${btn.dataset.id}`, { method: 'POST' });
        await refreshSchedules();
      });
    });
  } catch { schedList.innerHTML = '<div class="sched-empty">Failed to load</div>'; }
}

// ═══ SSE ═══

function connectSSE() {
  const source = new EventSource('/api/stream');

  source.addEventListener('connected', () => {
    appendLog({ timestamp: now(), level: 'info', stepNumber: '-', message: 'Connected to TestGenerator' });
  });

  source.addEventListener('log', (e) => { appendLog(JSON.parse(e.data)); });

  source.addEventListener('step-status', (e) => {
    const data = JSON.parse(e.data);
    const step = state.steps.find(s => s.number === data.stepNumber);
    if (step) {
      step.status = data.status;
      step.message = data.message || null;
      if (data.stepNumber === 3 && data.status === 'pass' && data.message) {
        const match = data.message.match(/^(SM-\S+)\s+—\s+(.+?)(?:\s+\||$)/);
        if (match) { state.ticketSummary = match[2]; renderTicketBar(); }
      }
      renderGrid();
    }
  });

  source.addEventListener('step-progress', (e) => {
    const data = JSON.parse(e.data);
    const step = state.steps.find(s => s.number === data.stepNumber);
    if (step && data.duration) { step.duration = data.duration; renderGrid(); }
  });

  source.addEventListener('ticket-selected', (e) => {
    const data = JSON.parse(e.data);
    if (data.ticketKey) { ticketInput.value = data.ticketKey; state.ticketKey = data.ticketKey; renderTicketBar(); }
  });

  source.addEventListener('run-started', () => {
    state.running = true;
    renderGrid();
  });

  source.addEventListener('run-complete', (e) => {
    const data = JSON.parse(e.data);
    state.running = false; renderGrid();
    appendLog({ timestamp: now(), stepNumber: '-', level: data.status === 'completed' ? 'info' : 'error',
      message: `Pipeline ${data.status}${data.durationMs ? ` (${formatDuration(data.durationMs)})` : ''}` });
    loadHistory();
  });

  source.addEventListener('schedule-fired', (e) => {
    const data = JSON.parse(e.data);
    appendLog({ timestamp: now(), stepNumber: '-', level: 'info', message: `Scheduled: "${data.name}" fired (${data.time})` });
  });

  source.addEventListener('error', (e) => {
    try { const data = JSON.parse(e.data); appendLog({ timestamp: now(), level: 'error', stepNumber: '-', message: data.message || 'Error' }); } catch { /* reconnect */ }
  });

  source.onerror = () => { state.running = false; };
}

// ═══ INIT ═══

async function init() {
  renderGrid();
  renderTicketBar();

  try {
    const [statusResp, schedResp] = await Promise.all([
      fetch('/api/status'),
      fetch('/api/schedules'),
    ]);
    const status = await statusResp.json();
    state.running = status.running;
    for (const s of status.steps) {
      const step = state.steps.find(st => st.number === s.stepNumber);
      if (step) step.status = s.status;
    }
    state.schedules = await schedResp.json();
    renderGrid();
  } catch {
    state.running = false;
  }

  connectSSE();
  loadHistory();
}

init();
