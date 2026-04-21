#!/usr/bin/env python3
"""Jira REST API helper for Claude Code (trimmed for sandbox compatibility).

Config is read from .jira-config.json (checks: home dir, script dir, cwd):
{
    "email": "user@company.com",
    "api_token": "your-api-token-here"
}
"""

import argparse
import base64
import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# Fix macOS SSL certificate issue — use certifi certs if available
try:
    import certifi
    _ssl_context = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    _ssl_context = ssl.create_default_context()


def _load_dotenv():
    """Load .env file from project root (script parent's parent) or cwd."""
    for base in [Path(__file__).parent.parent, Path.cwd()]:
        env_file = base / ".env"
        if env_file.exists():
            with open(env_file) as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())
            return


def load_config() -> dict:
    # Try environment variables first (from .env or shell)
    _load_dotenv()
    email = os.environ.get("JIRA_EMAIL")
    token = os.environ.get("JIRA_API_TOKEN")
    if email and token:
        return {
            "email": email,
            "api_token": token,
            "base_url": os.environ.get("JIRA_BASE_URL", "https://powerslicesoftware.atlassian.net").rstrip("/"),
        }

    # Fall back to .jira-config.json
    search_paths = [
        Path.home() / ".jira-config.json",
        Path(__file__).parent / ".jira-config.json",
        Path.cwd() / ".jira-config.json",
    ]
    config_path = None
    for p in search_paths:
        if p.exists():
            config_path = p
            break
    if config_path is None:
        print("Error: No Jira config found. Set JIRA_EMAIL + JIRA_API_TOKEN in .env, or create .jira-config.json")
        sys.exit(1)

    with open(config_path) as f:
        config = json.load(f)
    if "base_url" not in config or not config["base_url"]:
        config["base_url"] = "https://powerslicesoftware.atlassian.net"
    config["base_url"] = config["base_url"].rstrip("/")
    return config


def make_auth_header(config):
    creds = f"{config['email']}:{config['api_token']}"
    return f"Basic {base64.b64encode(creds.encode()).decode()}"


def api_request(config, method, path, data=None):
    url = f"{config['base_url']}/rest/api/3/{path.lstrip('/')}"
    headers = {"Authorization": make_auth_header(config), "Accept": "application/json"}
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=_ssl_context) as resp:
            resp_body = resp.read().decode("utf-8")
            return json.loads(resp_body) if resp_body else None
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="replace")[:500]
        print(f"Error: HTTP {e.code}")
        if detail:
            print(f"Details: {detail}")
        sys.exit(1)


def api_upload(config, path, file_path):
    url = f"{config['base_url']}/rest/api/3/{path.lstrip('/')}"
    fp = Path(file_path)
    if not fp.exists():
        print(f"Error: File not found: {fp}")
        sys.exit(1)
    boundary = "----FormBoundary7MA4YWxkTrZu0gW"
    with open(fp, "rb") as f:
        file_data = f.read()
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{fp.name}\"\r\n"
        f"Content-Type: application/octet-stream\r\n\r\n"
    ).encode() + file_data + f"\r\n--{boundary}--\r\n".encode()
    headers = {
        "Authorization": make_auth_header(config), "Accept": "application/json",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "X-Atlassian-Token": "no-check",
    }
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, context=_ssl_context) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"Error: Upload failed with HTTP {e.code}")
        sys.exit(1)


def cmd_test(config, args):
    result = api_request(config, "GET", "myself")
    print(f"Authentication successful!")
    print(f"  Display name: {result.get('displayName', 'N/A')}")
    print(f"  Email: {result.get('emailAddress', 'N/A')}")


def cmd_get_issue(config, args):
    path = f"issue/{args.issue_key}"
    if args.fields:
        path += f"?fields={args.fields}"
    print(json.dumps(api_request(config, "GET", path), indent=2))


def cmd_search(config, args):
    data = {"jql": args.jql, "maxResults": args.max_results}
    if args.fields:
        data["fields"] = args.fields.split(",")
    all_issues = []
    while True:
        result = api_request(config, "POST", "search/jql", data)
        all_issues.extend(result.get("issues", []))
        npt = result.get("nextPageToken")
        if not npt or len(all_issues) >= args.max_results:
            break
        data["nextPageToken"] = npt
    print(json.dumps({"returned": len(all_issues), "issues": all_issues}, indent=2))


def cmd_get_comments(config, args):
    print(json.dumps(api_request(config, "GET", f"issue/{args.issue_key}/comment"), indent=2))


def cmd_add_comment(config, args):
    if args.file:
        with open(args.file) as f:
            body_text = f.read()
    else:
        body_text = args.text
    content_blocks = []
    for line in body_text.split("\n"):
        content_blocks.append({"type": "paragraph", "content": [{"type": "text", "text": line if line.strip() else " "}]})
    data = {"body": {"type": "doc", "version": 1, "content": content_blocks}}
    result = api_request(config, "POST", f"issue/{args.issue_key}/comment", data)
    print(f"Comment added successfully (ID: {result.get('id', 'N/A')})")


def cmd_get_transitions(config, args):
    result = api_request(config, "GET", f"issue/{args.issue_key}/transitions")
    print(f"Available transitions for {args.issue_key}:")
    for t in result.get("transitions", []):
        print(f"  - {t['name']} (ID: {t['id']}) -> {t.get('to', {}).get('name', 'N/A')}")


def cmd_transition(config, args):
    result = api_request(config, "GET", f"issue/{args.issue_key}/transitions")
    target = args.status.lower()
    match = None
    for t in result.get("transitions", []):
        if t["name"].lower() == target:
            match = t
            break
    if not match:
        available = [t["name"] for t in result.get("transitions", [])]
        print(f"Error: Transition '{args.status}' not available")
        print(f"Available: {', '.join(available)}")
        sys.exit(1)
    api_request(config, "POST", f"issue/{args.issue_key}/transitions", {"transition": {"id": match["id"]}})
    print(f"Issue {args.issue_key} transitioned to '{match['name']}'")


def cmd_get_attachments(config, args):
    result = api_request(config, "GET", f"issue/{args.issue_key}?fields=attachment")
    attachments = result.get("fields", {}).get("attachment", [])
    if not attachments:
        print(f"No attachments on {args.issue_key}")
        return
    for a in attachments:
        print(f"  - {a['filename']} ({a.get('size', 0)} bytes) URL: {a['content']}")


def cmd_upload_attachment(config, args):
    result = api_upload(config, f"issue/{args.issue_key}/attachments", args.file_path)
    if isinstance(result, list) and len(result) > 0:
        print(f"Uploaded: {result[0].get('filename', 'N/A')} to {args.issue_key}")
    else:
        print(f"Upload completed for {args.issue_key}")


def main():
    parser = argparse.ArgumentParser(description="Jira API helper")
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("test")

    p = sub.add_parser("get-issue")
    p.add_argument("issue_key")
    p.add_argument("--fields")

    p = sub.add_parser("search")
    p.add_argument("jql")
    p.add_argument("--fields")
    p.add_argument("--max-results", type=int, default=50)

    p = sub.add_parser("get-comments")
    p.add_argument("issue_key")

    p = sub.add_parser("add-comment")
    p.add_argument("issue_key")
    p.add_argument("text", nargs="?")
    p.add_argument("--file")

    p = sub.add_parser("get-transitions")
    p.add_argument("issue_key")

    p = sub.add_parser("transition")
    p.add_argument("issue_key")
    p.add_argument("status")

    p = sub.add_parser("get-attachments")
    p.add_argument("issue_key")

    p = sub.add_parser("upload-attachment")
    p.add_argument("issue_key")
    p.add_argument("file_path")

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)

    config = load_config()
    cmds = {
        "test": cmd_test, "get-issue": cmd_get_issue, "search": cmd_search,
        "get-comments": cmd_get_comments, "add-comment": cmd_add_comment,
        "get-transitions": cmd_get_transitions, "transition": cmd_transition,
        "get-attachments": cmd_get_attachments, "upload-attachment": cmd_upload_attachment,
    }
    cmds[args.command](config, args)


if __name__ == "__main__":
    main()
