#!/usr/bin/env python3
"""Generate an HTML report of SM tickets that have been tested.

Reads testgen.db and produces data/info/test-summary.html with per-ticket
rounds and step-level detail so it's clear how each test-generation pass went.
"""
from __future__ import annotations

import html
import sqlite3
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "testgen.db"
OUT = ROOT / "data" / "info" / "test-summary.html"


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


def status_class(status: str | None) -> str:
    if not status:
        return "s-idle"
    s = status.lower()
    if s in ("pass", "passed", "completed", "ok"):
        return "s-pass"
    if s in ("fail", "failed", "aborted", "error"):
        return "s-fail"
    if s in ("warn", "warning"):
        return "s-warn"
    if s in ("running", "in_progress", "in-progress"):
        return "s-run"
    if s in ("cancelled", "canceled", "skipped", "blocked"):
        return "s-skip"
    return "s-idle"


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


def main() -> None:
    if not DB.exists():
        raise SystemExit(f"DB not found: {DB}")

    conn = sqlite3.connect(str(DB))
    conn.row_factory = sqlite3.Row

    tickets = conn.execute(
        """
        SELECT
          t.ticket_key, t.jira_status, t.jira_summary, t.phase,
          t.last_step, t.last_step_status, t.total_tcs, t.automated_tcs,
          t.last_updated
        FROM ticket_tracker t
        ORDER BY t.last_updated DESC
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

    # Counts for the header KPIs.
    total_tickets = len(tickets)
    total_rounds = sum(len(v) for v in runs_by_ticket.values())
    pass_rounds = warn_rounds = fail_rounds = 0
    for ticket_key, runs in runs_by_ticket.items():
        for run in runs:
            v = derive_round_verdict(steps_by_run.get(run["id"], []))
            if v == "pass":
                pass_rounds += 1
            elif v == "warn":
                warn_rounds += 1
            elif v == "fail":
                fail_rounds += 1

    generated = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    parts: list[str] = []
    parts.append(
        f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<title>SM Test Generation — Summary</title>
<style>
  :root {{
    --bg:#0f1115; --panel:#161a22; --panel-2:#1d2230; --border:#272d3d;
    --fg:#e7ecf3; --muted:#8b94a7; --accent:#5da9ff;
    --pass:#2ea668; --fail:#d6453d; --warn:#d9a441; --run:#5da9ff; --skip:#7a8294; --idle:#5b6273;
  }}
  body {{ background:var(--bg); color:var(--fg); font:13px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; margin:0; }}
  header {{ padding:24px 32px; border-bottom:1px solid var(--border); background:var(--panel); }}
  header h1 {{ margin:0 0 4px; font-size:22px; }}
  header .sub {{ color:var(--muted); font-size:12px; }}
  .kpis {{ display:flex; gap:18px; margin-top:14px; flex-wrap:wrap; }}
  .kpi {{ background:var(--panel-2); border:1px solid var(--border); border-radius:8px; padding:10px 14px; min-width:130px; }}
  .kpi .label {{ color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:.05em; }}
  .kpi .val {{ font-size:20px; font-weight:600; margin-top:2px; }}
  main {{ padding:24px 32px 60px; }}
  .ticket {{ background:var(--panel); border:1px solid var(--border); border-radius:10px; margin:0 0 18px; overflow:hidden; }}
  .ticket > summary {{ list-style:none; cursor:pointer; padding:14px 18px; display:flex; gap:14px; align-items:center; }}
  .ticket > summary::-webkit-details-marker {{ display:none; }}
  .ticket > summary::before {{ content:'▸'; color:var(--muted); transition:transform .15s; }}
  .ticket[open] > summary::before {{ transform:rotate(90deg); display:inline-block; }}
  .tk {{ font-weight:600; min-width:84px; color:var(--accent); font-family:ui-monospace,Menlo,Consolas,monospace; }}
  .tt {{ flex:1; }}
  .tt .title {{ font-weight:500; }}
  .tt .meta {{ color:var(--muted); font-size:11px; margin-top:2px; }}
  .badge {{ display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600; line-height:1.4; }}
  .b-pass {{ background:rgba(46,166,104,.15); color:#7be0a7; border:1px solid rgba(46,166,104,.4); }}
  .b-fail {{ background:rgba(214,69,61,.15); color:#ff8d87; border:1px solid rgba(214,69,61,.4); }}
  .b-warn {{ background:rgba(217,164,65,.15); color:#ffd38a; border:1px solid rgba(217,164,65,.4); }}
  .b-run  {{ background:rgba(93,169,255,.15); color:#9cc7ff; border:1px solid rgba(93,169,255,.4); }}
  .b-skip {{ background:rgba(122,130,148,.15); color:#bfc6d4; border:1px solid rgba(122,130,148,.4); }}
  .b-idle {{ background:rgba(91,98,115,.15); color:#aab1c2; border:1px solid rgba(91,98,115,.4); }}
  .rounds {{ padding:0 18px 18px; }}
  .round {{ background:var(--panel-2); border:1px solid var(--border); border-radius:8px; margin:10px 0; }}
  .round > summary {{ cursor:pointer; padding:10px 14px; display:flex; gap:12px; align-items:center; list-style:none; }}
  .round > summary::-webkit-details-marker {{ display:none; }}
  .round > summary::before {{ content:'▸'; color:var(--muted); }}
  .round[open] > summary::before {{ transform:rotate(90deg); display:inline-block; }}
  .round .rn {{ font-weight:700; min-width:64px; }}
  .round .rmeta {{ color:var(--muted); font-size:11px; }}
  table.steps {{ width:100%; border-collapse:collapse; font-size:12px; }}
  table.steps th, table.steps td {{ padding:8px 12px; border-top:1px solid var(--border); text-align:left; vertical-align:top; }}
  table.steps th {{ color:var(--muted); font-weight:500; background:rgba(0,0,0,.15); font-size:11px; text-transform:uppercase; letter-spacing:.04em; }}
  table.steps td.num {{ font-family:ui-monospace,Menlo,Consolas,monospace; color:var(--muted); width:36px; }}
  table.steps td.dur {{ font-family:ui-monospace,Menlo,Consolas,monospace; color:var(--muted); width:90px; white-space:nowrap; }}
  table.steps td.st  {{ width:80px; }}
  table.steps td.msg {{ font-family:ui-monospace,Menlo,Consolas,monospace; font-size:11.5px; color:#cdd5e6; word-break:break-word; }}
  table.steps td.msg .err {{ color:#ff8d87; display:block; margin-top:4px; white-space:pre-wrap; }}
  .note {{ color:var(--muted); font-size:11.5px; padding:8px 14px; }}
  .legend {{ display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; }}
  .legend .badge {{ font-size:10.5px; }}
  details > summary:hover {{ background:rgba(255,255,255,.02); }}
</style>
</head>
<body>
<header>
  <h1>SM Test Generation — Summary</h1>
  <div class=\"sub\">testgen.db · generated {html.escape(generated)}</div>
  <div class=\"kpis\">
    <div class=\"kpi\"><div class=\"label\">Tickets touched</div><div class=\"val\">{total_tickets}</div></div>
    <div class=\"kpi\"><div class=\"label\">Total rounds</div><div class=\"val\">{total_rounds}</div></div>
    <div class=\"kpi\"><div class=\"label\">Pass rounds</div><div class=\"val\" style=\"color:#7be0a7\">{pass_rounds}</div></div>
    <div class=\"kpi\"><div class=\"label\">Warn rounds</div><div class=\"val\" style=\"color:#ffd38a\">{warn_rounds}</div></div>
    <div class=\"kpi\"><div class=\"label\">Fail rounds</div><div class=\"val\" style=\"color:#ff8d87\">{fail_rounds}</div></div>
  </div>
  <div class=\"legend\">
    <span class=\"badge b-pass\">pass</span>
    <span class=\"badge b-warn\">warn</span>
    <span class=\"badge b-fail\">fail</span>
    <span class=\"badge b-run\">running</span>
    <span class=\"badge b-skip\">cancelled / blocked</span>
    <span class=\"badge b-idle\">idle / unknown</span>
  </div>
</header>
<main>
"""
    )

    # Render each ticket
    # Ticket order: keep ticket_tracker last_updated DESC, then any tickets with
    # pipeline runs but no tracker row appended at end.
    ordered_keys: list[str] = [t["ticket_key"] for t in tickets]
    extras = [k for k in runs_by_ticket.keys() if k not in ordered_keys]
    extras.sort()
    ordered_keys.extend(extras)

    tracker_by_key = {t["ticket_key"]: t for t in tickets}

    for tkey in ordered_keys:
        runs = runs_by_ticket.get(tkey, [])
        tr = tracker_by_key.get(tkey)
        title = (tr["jira_summary"] if tr else None) or "(no Jira summary cached)"
        jira_status = (tr["jira_status"] if tr else None) or "—"
        phase = (tr["phase"] if tr else None) or "—"
        last_step = (tr["last_step"] if tr else None)
        last_step_status = (tr["last_step_status"] if tr else None)
        last_updated = (tr["last_updated"] if tr else None) or "—"

        # Determine the highest step ever attempted across all rounds for this ticket.
        max_step_attempted = 0
        last_round_verdict = "idle"
        for run in runs:
            steps = steps_by_run.get(run["id"], [])
            for s in steps:
                if s["step_number"] and s["step_number"] > max_step_attempted:
                    max_step_attempted = s["step_number"]
        if runs:
            last_round_verdict = derive_round_verdict(
                steps_by_run.get(runs[-1]["id"], [])
            )

        ts_badge = f'<span class="badge b-{status_class(last_step_status).split("-")[1] if last_step_status else "idle"}">' \
                   f'phase: {html.escape(phase)} · last step {last_step or "—"} {html.escape(last_step_status or "")}</span>'

        latest_badge = f'<span class="badge b-{last_round_verdict if last_round_verdict in ("pass","warn","fail","run","skip") else "idle"}">latest round: {last_round_verdict}</span>'

        parts.append(
            f"""<details class=\"ticket\">
  <summary>
    <span class=\"tk\">{html.escape(tkey)}</span>
    <span class=\"tt\">
      <div class=\"title\">{html.escape(title)}</div>
      <div class=\"meta\">jira: {html.escape(jira_status)} · rounds: {len(runs)} · max step reached: {max_step_attempted or '—'} · last update: {html.escape(last_updated)}</div>
    </span>
    {latest_badge}
    {ts_badge}
  </summary>
  <div class=\"rounds\">
"""
        )

        if not runs:
            parts.append('    <div class="note">No pipeline runs recorded for this ticket.</div>\n')
        else:
            for idx, run in enumerate(runs, start=1):
                steps = steps_by_run.get(run["id"], [])
                verdict = derive_round_verdict(steps)
                vbadge_cls = verdict if verdict in ("pass", "warn", "fail") else ("run" if verdict == "running" else "idle")
                started = run["started_at"] or "—"
                finished = run["finished_at"] or "—"
                step_range = f"{run['step_start']}→{run['step_end']}" if run["step_start"] is not None else "—"
                duration = fmt_dur(run["duration_ms"])
                run_status = run["status"] or "—"

                parts.append(
                    f"""    <details class=\"round\">
      <summary>
        <span class=\"rn\">Round {idx}</span>
        <span class=\"badge b-{vbadge_cls}\">{verdict}</span>
        <span class=\"rmeta\">started {html.escape(started)} · finished {html.escape(finished)} · steps {step_range} · {html.escape(run_status)} · duration {duration}</span>
      </summary>
"""
                )

                if not steps:
                    parts.append('      <div class="note">No step results captured for this run.</div>\n')
                else:
                    parts.append(
                        """      <table class=\"steps\">
        <thead><tr><th>#</th><th>Step</th><th>Status</th><th>Duration</th><th>Tokens</th><th>Message</th></tr></thead>
        <tbody>
"""
                    )
                    for st in steps:
                        cls = status_class(st["status"])
                        msg = st["message"] or ""
                        err = st["error_output"] or ""
                        if len(msg) > 400:
                            msg = msg[:400] + "…"
                        if len(err) > 400:
                            err = err[:400] + "…"
                        msg_html = html.escape(msg)
                        if err:
                            msg_html += f'<span class="err">{html.escape(err)}</span>'
                        tok = st["token_usage"]
                        parts.append(
                            f"""          <tr>
            <td class=\"num\">{st['step_number']}</td>
            <td>{html.escape(st['step_name'] or STEP_LABELS.get(st['step_number'], '—'))}</td>
            <td class=\"st\"><span class=\"badge b-{cls.split('-')[1]}\">{html.escape(st['status'] or '—')}</span></td>
            <td class=\"dur\">{fmt_dur(st['duration_ms'])}</td>
            <td class=\"dur\">{tok if tok is not None else '—'}</td>
            <td class=\"msg\">{msg_html}</td>
          </tr>
"""
                        )
                    parts.append("        </tbody>\n      </table>\n")
                parts.append("    </details>\n")

        parts.append("  </div>\n</details>\n")

    parts.append("</main>\n</body>\n</html>\n")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("".join(parts), encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size:,} bytes)")
    print(f"  tickets={total_tickets}  rounds={total_rounds}  pass={pass_rounds} warn={warn_rounds} fail={fail_rounds}")


if __name__ == "__main__":
    main()
