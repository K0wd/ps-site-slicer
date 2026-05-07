#!/usr/bin/env python3
"""Generate a Jira-friendly HTML summary of SM tickets that have been tested.

Reads testgen.db and produces data/info/test-summary-jira.html. Output uses
simple flat HTML (headings + tables, inline styles, no <details>/JS/CSS-vars)
so it pastes cleanly into a Jira description or renders fine when attached
to a ticket.
"""
from __future__ import annotations

import html
import sqlite3
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "testgen.db"
OUT = ROOT / "data" / "info" / "test-summary-jira.html"


STEP_LABELS = {
    1: "Verify Jira Auth",
    2: "Find Ticket",
    3: "Review Ticket",
    4: "Review Code",
    5: "Draft Test Plan",
    6: "Write Gherkin Steps",
    7: "Implement Gherkin Steps",
    8: "Execute Tests",
    9: "Determine Results",
    10: "Post Results",
    11: "Transition Jira",
    101: "Automated Steps Crawler / Check Steps",
    102: "Run Tests (Automator)",
    103: "Heal Scenario / Healing",
    104: "App Scraper / Decalcification",
    105: "Send Test Emails",
}

JIRA_BASE = "https://powerslicesoftware.atlassian.net/browse/"


# Jira-safe palette (no CSS vars; all inline).
COLORS = {
    "pass":    {"bg": "#e3fcef", "fg": "#006644", "bd": "#abf5d1"},
    "fail":    {"bg": "#ffebe6", "fg": "#bf2600", "bd": "#ffbdad"},
    "warn":    {"bg": "#fffae6", "fg": "#974f0c", "bd": "#ffe380"},
    "running": {"bg": "#deebff", "fg": "#0747a6", "bd": "#b3d4ff"},
    "skip":    {"bg": "#f4f5f7", "fg": "#42526e", "bd": "#dfe1e6"},
    "idle":    {"bg": "#f4f5f7", "fg": "#42526e", "bd": "#dfe1e6"},
}


def normalize_status(status: str | None) -> str:
    if not status:
        return "idle"
    s = status.lower()
    if s in ("pass", "passed", "completed", "ok"):
        return "pass"
    if s in ("fail", "failed", "aborted", "error"):
        return "fail"
    if s in ("warn", "warning"):
        return "warn"
    if s in ("running", "in_progress", "in-progress"):
        return "running"
    if s in ("cancelled", "canceled", "skipped", "blocked"):
        return "skip"
    return "idle"


def badge(status: str | None, *, label: str | None = None) -> str:
    norm = normalize_status(status)
    palette = COLORS[norm]
    text = label if label is not None else (status or "—")
    return (
        f'<span style="display:inline-block;padding:1px 8px;border-radius:3px;'
        f'background:{palette["bg"]};color:{palette["fg"]};border:1px solid {palette["bd"]};'
        f'font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;">'
        f'{html.escape(text)}</span>'
    )


def fmt_dur(ms: int | None) -> str:
    if ms is None:
        return "—"
    if ms < 1000:
        return f"{ms} ms"
    s = ms / 1000.0
    if s < 60:
        return f"{s:.1f} s"
    m = int(s // 60)
    rs = s - m * 60
    if m < 60:
        return f"{m}m {rs:.0f}s"
    h = m // 60
    rm = m % 60
    return f"{h}h {rm}m"


def derive_round_verdict(steps: list[sqlite3.Row]) -> str:
    statuses = [(s["status"] or "").lower() for s in steps]
    if any(x in ("fail", "failed", "aborted", "error") for x in statuses):
        return "fail"
    if any(x in ("warn", "warning") for x in statuses):
        return "warn"
    if any(x in ("running", "in_progress", "in-progress") for x in statuses):
        return "running"
    if statuses and all(x in ("pass", "passed", "completed", "ok", "skip", "skipped") for x in statuses):
        return "pass"
    return "idle"


def truncate(s: str | None, n: int = 320) -> str:
    if not s:
        return ""
    return s if len(s) <= n else s[: n - 1] + "…"


def main() -> None:
    if not DB.exists():
        raise SystemExit(f"DB not found: {DB}")

    conn = sqlite3.connect(str(DB))
    conn.row_factory = sqlite3.Row

    tickets = conn.execute(
        """
        SELECT ticket_key, jira_status, jira_summary, phase,
               last_step, last_step_status, total_tcs, automated_tcs,
               last_updated
        FROM ticket_tracker
        ORDER BY last_updated DESC
        """
    ).fetchall()

    runs_by_ticket: dict[str, list[sqlite3.Row]] = {}
    for r in conn.execute(
        """
        SELECT id, ticket_key, started_at, finished_at, step_start, step_end,
               status, duration_ms
        FROM pipeline_runs
        WHERE ticket_key IS NOT NULL
        ORDER BY ticket_key, started_at
        """
    ).fetchall():
        runs_by_ticket.setdefault(r["ticket_key"], []).append(r)

    steps_by_run: dict[int, list[sqlite3.Row]] = {}
    for r in conn.execute(
        """
        SELECT run_id, step_number, step_name, ticket_key, status,
               started_at, finished_at, duration_ms, token_usage,
               message, error_output
        FROM step_results
        ORDER BY run_id, step_number
        """
    ).fetchall():
        steps_by_run.setdefault(r["run_id"], []).append(r)

    total_tickets = len(tickets)
    total_rounds = sum(len(v) for v in runs_by_ticket.values())
    pass_rounds = warn_rounds = fail_rounds = 0
    ticket_verdicts: dict[str, str] = {}
    for ticket_key, runs in runs_by_ticket.items():
        latest_v = "idle"
        for run in runs:
            v = derive_round_verdict(steps_by_run.get(run["id"], []))
            if v == "pass":
                pass_rounds += 1
            elif v == "warn":
                warn_rounds += 1
            elif v == "fail":
                fail_rounds += 1
        if runs:
            latest_v = derive_round_verdict(
                steps_by_run.get(runs[-1]["id"], [])
            )
        ticket_verdicts[ticket_key] = latest_v

    generated = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    parts: list[str] = []
    parts.append(
        f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<title>SM Test Generation — Summary (Jira-friendly)</title>
</head>
<body style=\"font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#172b4d;background:#ffffff;margin:0;padding:24px 32px 48px;font-size:14px;line-height:1.5;\">

<h1 style=\"margin:0 0 4px;font-size:22px;color:#172b4d;\">SM Test Generation — Summary</h1>
<div style=\"color:#5e6c84;font-size:12px;margin-bottom:16px;\">Source: <code>app/TestGenerator/data/testgen.db</code> · Generated {html.escape(generated)}</div>

<table style=\"border-collapse:collapse;margin:0 0 20px;\">
  <tr>
    <td style=\"padding:8px 14px;border:1px solid #dfe1e6;background:#f4f5f7;\"><b>Tickets touched</b><br><span style=\"font-size:18px;\">{total_tickets}</span></td>
    <td style=\"padding:8px 14px;border:1px solid #dfe1e6;background:#f4f5f7;\"><b>Total rounds</b><br><span style=\"font-size:18px;\">{total_rounds}</span></td>
    <td style=\"padding:8px 14px;border:1px solid #dfe1e6;background:#e3fcef;\"><b>Pass rounds</b><br><span style=\"font-size:18px;color:#006644;\">{pass_rounds}</span></td>
    <td style=\"padding:8px 14px;border:1px solid #dfe1e6;background:#fffae6;\"><b>Warn rounds</b><br><span style=\"font-size:18px;color:#974f0c;\">{warn_rounds}</span></td>
    <td style=\"padding:8px 14px;border:1px solid #dfe1e6;background:#ffebe6;\"><b>Fail rounds</b><br><span style=\"font-size:18px;color:#bf2600;\">{fail_rounds}</span></td>
  </tr>
</table>

<p style=\"margin:0 0 6px;color:#5e6c84;font-size:12px;\">
Legend: {badge('pass')} {badge('warn')} {badge('fail')} {badge('running')} {badge('skip', label='cancelled / blocked')} {badge('idle')}
</p>

<h2 style=\"margin:24px 0 8px;font-size:17px;border-bottom:2px solid #dfe1e6;padding-bottom:4px;\">Overview</h2>
<table style=\"border-collapse:collapse;width:100%;font-size:13px;\">
  <thead>
    <tr style=\"background:#f4f5f7;\">
      <th style=\"text-align:left;padding:8px 10px;border:1px solid #dfe1e6;\">Ticket</th>
      <th style=\"text-align:left;padding:8px 10px;border:1px solid #dfe1e6;\">Summary</th>
      <th style=\"text-align:left;padding:8px 10px;border:1px solid #dfe1e6;\">Jira status</th>
      <th style=\"text-align:left;padding:8px 10px;border:1px solid #dfe1e6;\">Phase</th>
      <th style=\"text-align:left;padding:8px 10px;border:1px solid #dfe1e6;\">Last step</th>
      <th style=\"text-align:left;padding:8px 10px;border:1px solid #dfe1e6;\">Rounds</th>
      <th style=\"text-align:left;padding:8px 10px;border:1px solid #dfe1e6;\">Latest verdict</th>
    </tr>
  </thead>
  <tbody>
"""
    )

    ordered_keys: list[str] = [t["ticket_key"] for t in tickets]
    extras = sorted(k for k in runs_by_ticket.keys() if k not in ordered_keys)
    ordered_keys.extend(extras)
    tracker_by_key = {t["ticket_key"]: t for t in tickets}

    for tkey in ordered_keys:
        runs = runs_by_ticket.get(tkey, [])
        tr = tracker_by_key.get(tkey)
        title = (tr["jira_summary"] if tr else None) or "(no Jira summary cached)"
        jira_status = (tr["jira_status"] if tr else None) or "—"
        phase = (tr["phase"] if tr else None) or "—"
        last_step = tr["last_step"] if tr else None
        last_step_status = tr["last_step_status"] if tr else None
        last_step_label = (
            f"{last_step} {STEP_LABELS.get(last_step, '')} {last_step_status or ''}".strip()
            if last_step is not None else "—"
        )
        link = f'<a href="{JIRA_BASE}{html.escape(tkey)}" style="color:#0052cc;text-decoration:none;font-family:ui-monospace,Menlo,Consolas,monospace;">{html.escape(tkey)}</a>' if tkey.startswith("SM-") else html.escape(tkey)
        parts.append(
            f"""    <tr>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;font-weight:600;\">{link}</td>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;\">{html.escape(title)}</td>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;\">{html.escape(jira_status)}</td>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;\">{html.escape(phase)}</td>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;\">{html.escape(last_step_label)}</td>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;text-align:right;\">{len(runs)}</td>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;\">{badge(ticket_verdicts.get(tkey, 'idle'))}</td>
    </tr>
"""
        )

    parts.append("  </tbody>\n</table>\n")

    parts.append('<h2 style="margin:28px 0 8px;font-size:17px;border-bottom:2px solid #dfe1e6;padding-bottom:4px;">Per-ticket detail</h2>\n')

    for tkey in ordered_keys:
        runs = runs_by_ticket.get(tkey, [])
        tr = tracker_by_key.get(tkey)
        title = (tr["jira_summary"] if tr else None) or "(no Jira summary cached)"
        jira_status = (tr["jira_status"] if tr else None) or "—"
        phase = (tr["phase"] if tr else None) or "—"
        last_step = tr["last_step"] if tr else None
        last_step_status = tr["last_step_status"] if tr else None
        last_updated = (tr["last_updated"] if tr else None) or "—"

        link = (
            f'<a href="{JIRA_BASE}{html.escape(tkey)}" style="color:#0052cc;text-decoration:none;">{html.escape(tkey)}</a>'
            if tkey.startswith("SM-") else html.escape(tkey)
        )
        latest_v = ticket_verdicts.get(tkey, "idle")
        parts.append(
            f"""<h3 style=\"margin:20px 0 4px;font-size:15px;color:#172b4d;\">
  {link} — {html.escape(title)} {badge(latest_v)}
</h3>
<div style=\"color:#5e6c84;font-size:12px;margin-bottom:8px;\">
  Jira status: <b>{html.escape(jira_status)}</b> ·
  Phase: <b>{html.escape(phase)}</b> ·
  Last step: <b>{last_step if last_step is not None else '—'} {html.escape(last_step_status or '')}</b> ·
  Rounds: <b>{len(runs)}</b> ·
  Last updated: {html.escape(last_updated)}
</div>
"""
        )

        if not runs:
            parts.append('<p style="color:#5e6c84;font-style:italic;margin:0 0 12px;">No pipeline runs recorded for this ticket.</p>\n')
            continue

        for idx, run in enumerate(runs, start=1):
            steps = steps_by_run.get(run["id"], [])
            verdict = derive_round_verdict(steps)
            started = run["started_at"] or "—"
            finished = run["finished_at"] or "—"
            step_range = f"{run['step_start']}→{run['step_end']}" if run["step_start"] is not None else "—"
            duration = fmt_dur(run["duration_ms"])
            run_status = run["status"] or "—"

            parts.append(
                f"""<h4 style=\"margin:14px 0 4px;font-size:13px;color:#172b4d;\">Round {idx} {badge(verdict)}</h4>
<div style=\"color:#5e6c84;font-size:11.5px;margin-bottom:6px;\">
  Started {html.escape(started)} · Finished {html.escape(finished)} ·
  Steps {step_range} · Pipeline status <b>{html.escape(run_status)}</b> · Duration {duration}
</div>
"""
            )

            if not steps:
                parts.append('<p style="color:#5e6c84;font-style:italic;margin:0 0 8px;">No step results captured for this run.</p>\n')
                continue

            parts.append(
                """<table style=\"border-collapse:collapse;width:100%;font-size:12.5px;margin:0 0 10px;\">
  <thead>
    <tr style=\"background:#f4f5f7;\">
      <th style=\"text-align:left;padding:6px 10px;border:1px solid #dfe1e6;width:36px;\">#</th>
      <th style=\"text-align:left;padding:6px 10px;border:1px solid #dfe1e6;\">Step</th>
      <th style=\"text-align:left;padding:6px 10px;border:1px solid #dfe1e6;width:80px;\">Status</th>
      <th style=\"text-align:left;padding:6px 10px;border:1px solid #dfe1e6;width:90px;\">Duration</th>
      <th style=\"text-align:left;padding:6px 10px;border:1px solid #dfe1e6;width:80px;\">Tokens</th>
      <th style=\"text-align:left;padding:6px 10px;border:1px solid #dfe1e6;\">Message</th>
    </tr>
  </thead>
  <tbody>
"""
            )
            for st in steps:
                msg = truncate(st["message"], 320)
                err = truncate(st["error_output"], 320)
                msg_html = html.escape(msg)
                if err:
                    msg_html += f'<div style="color:#bf2600;font-family:ui-monospace,Menlo,Consolas,monospace;margin-top:4px;white-space:pre-wrap;">{html.escape(err)}</div>'
                tok = st["token_usage"]
                parts.append(
                    f"""    <tr>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;font-family:ui-monospace,Menlo,Consolas,monospace;color:#5e6c84;\">{st['step_number']}</td>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;\">{html.escape(st['step_name'] or STEP_LABELS.get(st['step_number'], '—'))}</td>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;\">{badge(st['status'])}</td>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;font-family:ui-monospace,Menlo,Consolas,monospace;color:#5e6c84;\">{fmt_dur(st['duration_ms'])}</td>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;font-family:ui-monospace,Menlo,Consolas,monospace;color:#5e6c84;\">{tok if tok is not None else '—'}</td>
      <td style=\"padding:6px 10px;border:1px solid #dfe1e6;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#172b4d;word-break:break-word;\">{msg_html}</td>
    </tr>
"""
                )
            parts.append("  </tbody>\n</table>\n")

    parts.append("</body>\n</html>\n")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("".join(parts), encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size:,} bytes)")
    print(f"  tickets={total_tickets}  rounds={total_rounds}  pass={pass_rounds} warn={warn_rounds} fail={fail_rounds}")


if __name__ == "__main__":
    main()
