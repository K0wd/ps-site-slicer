#!/usr/bin/env python3
"""Post the SM test-generation summary to a Jira issue as a series of ADF comments.

Re-renders the data from testgen.db as native ADF (so it actually renders in
Jira — REST v3 does not accept raw HTML in comments). Splits into multiple
comments to keep each payload under a safe size.

Usage:
    python3 post_test_summary_to_jira.py KB-3            # dry-run: writes preview JSON, does not post
    python3 post_test_summary_to_jira.py KB-3 --post     # actually posts to Jira

Run from the repo root so .env is loaded by jira_api.
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import sys
import uuid
from datetime import datetime
from pathlib import Path

# Reuse the local Jira helper for auth + REST.
SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
REPO_ROOT = ROOT.parent.parent  # ps-site-slicer/
sys.path.insert(0, str(ROOT))
import jira_api  # noqa: E402

DB = ROOT / "data" / "testgen.db"
PREVIEW = ROOT / "data" / "info" / "jira-comments-preview.json"

STEP_LABELS = {
    1: "Verify Jira Auth", 2: "Find Ticket", 3: "Review Ticket",
    4: "Review Code", 5: "Draft Test Plan", 6: "Write Gherkin Steps",
    7: "Implement Gherkin Steps", 8: "Execute Tests", 9: "Determine Results",
    10: "Post Results", 11: "Transition Jira",
    101: "Automated Steps Crawler / Check Steps",
    102: "Run Tests (Automator)", 103: "Heal Scenario / Healing",
    104: "App Scraper / Decalcification", 105: "Send Test Emails",
}

# Map normalized verdicts to Atlassian status-pill colors.
STATUS_COLOR = {
    "pass": "green", "fail": "red", "warn": "yellow",
    "running": "blue", "skip": "neutral", "idle": "neutral",
}

# Soft cap per comment payload (ADF JSON bytes). Atlassian doesn't publish a
# hard limit, but staying under ~30 KB keeps comments responsive.
MAX_COMMENT_BYTES = 28000
OVERVIEW_MAX_BYTES = 32000


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


def truncate(s: str | None, n: int = 160) -> str:
    if not s:
        return ""
    s = s.replace("\r", " ").replace("\n", " ").strip()
    return s if len(s) <= n else s[: n - 1] + "…"


# -------- ADF helpers --------

def text(s: str, marks: list | None = None) -> dict:
    node = {"type": "text", "text": s if s else " "}
    if marks:
        node["marks"] = marks
    return node


def code(s: str) -> dict:
    return text(s or " ", marks=[{"type": "code"}])


def strong(s: str) -> dict:
    return text(s, marks=[{"type": "strong"}])


def link(s: str, href: str) -> dict:
    return text(s, marks=[{"type": "link", "attrs": {"href": href}}])


def paragraph(content: list) -> dict:
    return {"type": "paragraph", "content": content if content else [text(" ")]}


def heading(level: int, content: list) -> dict:
    return {"type": "heading", "attrs": {"level": level}, "content": content}


def status_pill(verdict: str) -> dict:
    norm = normalize_status(verdict)
    color = STATUS_COLOR.get(norm, "neutral")
    return {
        "type": "status",
        "attrs": {
            "text": (verdict or norm).upper(),
            "color": color,
            "localId": str(uuid.uuid4()),
        },
    }


def cell(content_blocks: list, *, header: bool = False) -> dict:
    node_type = "tableHeader" if header else "tableCell"
    if not content_blocks:
        content_blocks = [paragraph([text(" ")])]
    return {"type": node_type, "attrs": {}, "content": content_blocks}


def table(rows: list[dict]) -> dict:
    return {
        "type": "table",
        "attrs": {"isNumberColumnEnabled": False, "layout": "default"},
        "content": rows,
    }


def row(cells: list[dict]) -> dict:
    return {"type": "tableRow", "content": cells}


def doc(content: list) -> dict:
    return {"type": "doc", "version": 1, "content": content}


def adf_size(adf: dict) -> int:
    return len(json.dumps(adf, ensure_ascii=False))


# -------- Section builders --------

JIRA_BROWSE = "https://powerslicesoftware.atlassian.net/browse/"


def build_overview_adf(stats: dict, tickets_summary: list[dict], generated_at: str, target_key: str) -> dict:
    blocks: list = []
    blocks.append(heading(2, [text("SM Test Generation — Summary")]))
    blocks.append(paragraph([
        text("Source: "), code("app/TestGenerator/data/testgen.db"),
        text(" · Generated "), text(generated_at),
        text(" · Posted to: "), link(target_key, JIRA_BROWSE + target_key),
    ]))

    # KPIs as a single line of bold counters (cheaper than a 2-row table).
    blocks.append(paragraph([
        strong("Tickets "), text(f"{stats['tickets']}    "),
        strong("Rounds "), text(f"{stats['rounds']}    "),
        strong("Pass "), text(f"{stats['pass']}    "),
        strong("Warn "), text(f"{stats['warn']}    "),
        strong("Fail "), text(f"{stats['fail']}"),
    ]))

    blocks.append(paragraph([
        text("Legend: "),
        status_pill("PASS"), text(" "),
        status_pill("WARN"), text(" "),
        status_pill("FAIL"), text(" "),
        status_pill("RUNNING"), text(" "),
        status_pill("SKIP"),
        text("  ·  Per-ticket detail follows in subsequent comments."),
    ]))

    blocks.append(heading(3, [text("Overview — all tickets")]))

    overview_rows: list = [row([
        cell([paragraph([strong("Ticket")])], header=True),
        cell([paragraph([strong("Summary")])], header=True),
        cell([paragraph([strong("Rounds")])], header=True),
        cell([paragraph([strong("Latest")])], header=True),
    ])]
    for t in tickets_summary:
        tk_para = paragraph([
            link(t["key"], JIRA_BROWSE + t["key"]) if t["key"].startswith(("SM-", "KB-")) else text(t["key"])
        ])
        overview_rows.append(row([
            cell([tk_para]),
            cell([paragraph([text(truncate(t["title"], 55))])]),
            cell([paragraph([text(str(t["rounds_count"]))])]),
            cell([paragraph([status_pill(t["latest_verdict"])])]),
        ]))
    blocks.append(table(overview_rows))

    return doc(blocks)


def _ticket_header_blocks(ticket: dict, *, suffix: str = "") -> list:
    title_inlines: list = [
        link(ticket["key"], JIRA_BROWSE + ticket["key"]) if ticket["key"].startswith(("SM-", "KB-")) else text(ticket["key"]),
        text(" — "),
        text(truncate(ticket["title"], 100)),
        text("  "),
        status_pill(ticket["latest_verdict"]),
    ]
    if suffix:
        title_inlines.append(text(f"  ({suffix})"))
    return [
        heading(3, title_inlines),
        paragraph([
            text("Jira: "), strong(ticket["jira_status"]),
            text(" · Phase: "), strong(ticket["phase"]),
            text(" · Last step: "), strong(ticket["last_step_label"]),
            text(" · Rounds: "), strong(str(ticket["rounds_count"])),
            text(" · Updated: "), text(ticket["last_updated"]),
        ]),
    ]


def _round_blocks(idx: int, rnd: dict) -> list:
    blocks = [
        heading(4, [text(f"Round {idx}  "), status_pill(rnd["verdict"])]),
        paragraph([
            text("Started "), code(rnd["started"]),
            text(" · Finished "), code(rnd["finished"]),
            text(" · Steps "), code(rnd["step_range"]),
            text(" · Pipeline "), strong(rnd["status"]),
            text(" · Duration "), code(rnd["duration"]),
        ]),
    ]
    if not rnd["steps"]:
        blocks.append(paragraph([text("No step results captured.")]))
        return blocks
    step_rows: list = [row([
        cell([paragraph([strong("#")])], header=True),
        cell([paragraph([strong("Step")])], header=True),
        cell([paragraph([strong("Status")])], header=True),
        cell([paragraph([strong("Duration")])], header=True),
        cell([paragraph([strong("Tokens")])], header=True),
        cell([paragraph([strong("Message")])], header=True),
    ])]
    for st in rnd["steps"]:
        msg_inline: list = [text(truncate(st["message"], 200))]
        if st["error"]:
            msg_inline.append(text("  "))
            msg_inline.append(code(truncate(st["error"], 180)))
        step_rows.append(row([
            cell([paragraph([code(str(st["step_number"]))])]),
            cell([paragraph([text(st["step_name"])])]),
            cell([paragraph([status_pill(st["status"])])]),
            cell([paragraph([code(fmt_dur(st["duration_ms"]))])]),
            cell([paragraph([code(str(st["token_usage"]) if st["token_usage"] is not None else "—")])]),
            cell([paragraph(msg_inline)]),
        ]))
    blocks.append(table(step_rows))
    return blocks


def build_ticket_chunks(ticket: dict, max_bytes: int) -> list[tuple[str, list]]:
    """Build one or more (label, blocks) chunks for a ticket.

    A chunk fits in a single comment. Mega-tickets are split by round, with
    a continued-part header on parts after the first.
    """
    chunks: list[tuple[str, list]] = []
    if not ticket["rounds"]:
        blocks = _ticket_header_blocks(ticket)
        blocks.append(paragraph([text("No pipeline runs recorded.")]))
        chunks.append((ticket["key"], blocks))
        return chunks

    part = 1
    current_blocks = _ticket_header_blocks(ticket)
    current_round_count = 0

    for idx, rnd in enumerate(ticket["rounds"], start=1):
        rblocks = _round_blocks(idx, rnd)
        probe = doc(current_blocks + rblocks)
        if adf_size(probe) > max_bytes and current_round_count > 0:
            chunks.append((f"{ticket['key']} part {part}", current_blocks))
            part += 1
            current_blocks = _ticket_header_blocks(ticket, suffix=f"continued · part {part}")
            current_round_count = 0
        current_blocks.extend(rblocks)
        current_round_count += 1

        # If even a single round overflowed (rare), still emit it alone.
        if adf_size(doc(current_blocks)) > max_bytes and current_round_count == 1:
            chunks.append((f"{ticket['key']} part {part}", current_blocks))
            part += 1
            current_blocks = _ticket_header_blocks(ticket, suffix=f"continued · part {part}")
            current_round_count = 0

    if current_round_count > 0:
        label = f"{ticket['key']} part {part}" if part > 1 else ticket["key"]
        chunks.append((label, current_blocks))

    return chunks


# -------- DB load --------

def load_data() -> tuple[dict, list[dict]]:
    if not DB.exists():
        raise SystemExit(f"DB not found: {DB}")
    conn = sqlite3.connect(str(DB))
    conn.row_factory = sqlite3.Row
    tickets_raw = conn.execute(
        """
        SELECT ticket_key, jira_status, jira_summary, phase,
               last_step, last_step_status, total_tcs, automated_tcs, last_updated
        FROM ticket_tracker ORDER BY last_updated DESC
        """
    ).fetchall()
    runs_by_ticket: dict[str, list[sqlite3.Row]] = {}
    for r in conn.execute(
        """
        SELECT id, ticket_key, started_at, finished_at, step_start, step_end,
               status, duration_ms
        FROM pipeline_runs WHERE ticket_key IS NOT NULL
        ORDER BY ticket_key, started_at
        """
    ).fetchall():
        runs_by_ticket.setdefault(r["ticket_key"], []).append(r)
    steps_by_run: dict[int, list[sqlite3.Row]] = {}
    for r in conn.execute(
        """
        SELECT run_id, step_number, step_name, status, duration_ms,
               token_usage, message, error_output
        FROM step_results ORDER BY run_id, step_number
        """
    ).fetchall():
        steps_by_run.setdefault(r["run_id"], []).append(r)

    ordered_keys = [t["ticket_key"] for t in tickets_raw]
    extras = sorted(k for k in runs_by_ticket.keys() if k not in ordered_keys)
    ordered_keys.extend(extras)
    tracker_by_key = {t["ticket_key"]: t for t in tickets_raw}

    tickets_data: list[dict] = []
    pass_r = warn_r = fail_r = 0
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
        last_updated = (tr["last_updated"] if tr else None) or "—"

        rounds_list = []
        for run in runs:
            steps = steps_by_run.get(run["id"], [])
            verdict = derive_round_verdict(steps)
            if verdict == "pass":
                pass_r += 1
            elif verdict == "warn":
                warn_r += 1
            elif verdict == "fail":
                fail_r += 1
            rounds_list.append({
                "verdict": verdict,
                "started": run["started_at"] or "—",
                "finished": run["finished_at"] or "—",
                "step_range": f"{run['step_start']}→{run['step_end']}" if run["step_start"] is not None else "—",
                "status": run["status"] or "—",
                "duration": fmt_dur(run["duration_ms"]),
                "steps": [
                    {
                        "step_number": s["step_number"],
                        "step_name": s["step_name"] or STEP_LABELS.get(s["step_number"], "—"),
                        "status": s["status"] or "—",
                        "duration_ms": s["duration_ms"],
                        "token_usage": s["token_usage"],
                        "message": s["message"] or "",
                        "error": s["error_output"] or "",
                    }
                    for s in steps
                ],
            })
        latest_verdict = rounds_list[-1]["verdict"] if rounds_list else "idle"
        tickets_data.append({
            "key": tkey,
            "title": title,
            "jira_status": jira_status,
            "phase": phase,
            "last_step_label": last_step_label,
            "last_updated": last_updated,
            "rounds_count": len(runs),
            "rounds": rounds_list,
            "latest_verdict": latest_verdict,
        })

    stats = {
        "tickets": len(tickets_data),
        "rounds": sum(t["rounds_count"] for t in tickets_data),
        "pass": pass_r, "warn": warn_r, "fail": fail_r,
    }
    return stats, tickets_data


# -------- Comment batching --------

def build_comments(stats: dict, tickets_data: list[dict], target_key: str) -> list[dict]:
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    summary_for_overview = [
        {
            "key": t["key"], "title": t["title"], "jira_status": t["jira_status"],
            "phase": t["phase"], "last_step_label": t["last_step_label"],
            "rounds_count": t["rounds_count"], "latest_verdict": t["latest_verdict"],
        }
        for t in tickets_data
    ]
    overview_doc = build_overview_adf(stats, summary_for_overview, generated_at, target_key)
    if adf_size(overview_doc) > OVERVIEW_MAX_BYTES:
        # Should not happen with the trimmed overview, but guard anyway.
        print(f"WARN: overview comment is {adf_size(overview_doc):,} bytes (> {OVERVIEW_MAX_BYTES:,}).")
    comments = [{"label": "Overview", "adf": overview_doc}]

    # Build a flat list of (label, blocks) chunks across all tickets, then
    # greedily pack into per-comment payloads.
    all_chunks: list[tuple[str, list]] = []
    for t in tickets_data:
        all_chunks.extend(build_ticket_chunks(t, MAX_COMMENT_BYTES))

    current_blocks: list = []
    current_keys: list[str] = []

    def flush() -> None:
        nonlocal current_blocks, current_keys
        if not current_blocks or not current_keys:
            current_blocks = []
            current_keys = []
            return
        comments.append({
            "label": "Detail: " + ", ".join(current_keys),
            "adf": doc(current_blocks),
        })
        current_blocks = []
        current_keys = []

    for label, blocks in all_chunks:
        probe_size = adf_size(doc(current_blocks + blocks))
        if current_blocks and probe_size > MAX_COMMENT_BYTES:
            flush()
        current_blocks.extend(blocks)
        current_keys.append(label)

    flush()
    return comments


# -------- Posting --------

def post_comment(config: dict, issue_key: str, adf_doc: dict) -> dict:
    return jira_api.api_request(
        config, "POST", f"issue/{issue_key}/comment",
        {"body": adf_doc},
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("issue_key", help="Target Jira issue key (e.g. KB-3)")
    parser.add_argument("--post", action="store_true",
                        help="Actually post comments (without this, just writes preview)")
    args = parser.parse_args()

    stats, tickets_data = load_data()
    comments = build_comments(stats, tickets_data, args.issue_key)

    sizes = [adf_size(c["adf"]) for c in comments]
    print(f"Built {len(comments)} comment(s) for {args.issue_key}")
    for i, (c, sz) in enumerate(zip(comments, sizes), start=1):
        print(f"  [{i}] {c['label']:<60s} {sz:>7,} bytes")

    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    PREVIEW.write_text(
        json.dumps(
            [{"label": c["label"], "size_bytes": sz, "adf": c["adf"]}
             for c, sz in zip(comments, sizes)],
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Preview written: {PREVIEW}")

    if not args.post:
        print("Dry-run only. Re-run with --post to publish.")
        return

    config = jira_api.load_config()
    print(f"\nPosting to {args.issue_key} as {config['email']}…")
    posted: list[dict] = []
    for i, c in enumerate(comments, start=1):
        try:
            resp = post_comment(config, args.issue_key, c["adf"])
            cid = resp.get("id") if resp else None
            print(f"  [{i}/{len(comments)}] {c['label'][:50]:<50s} -> id={cid}")
            posted.append({"index": i, "id": cid, "label": c["label"]})
        except SystemExit:
            print(f"  [{i}/{len(comments)}] FAILED — see error above")
            raise

    log_path = ROOT / "data" / "info" / "jira-comments-posted.json"
    log_path.write_text(
        json.dumps({"issue": args.issue_key, "posted_at": datetime.now().isoformat(), "comments": posted}, indent=2),
        encoding="utf-8",
    )
    print(f"Posted {len(posted)} comments. Log: {log_path}")


if __name__ == "__main__":
    main()
