# Git & Code Organization Rules

Behavioral rules that train Claude on git discipline and code organization habits. These are saved as Claude memory/feedback files so they persist across conversations.

## What's Included

| File | Purpose |
|---|---|
| `memory/MEMORY.md` | Memory index (auto-loaded by Claude) |
| `memory/feedback_no_push_commit.md` | Never commit/push without explicit permission |
| `memory/feedback_rules_check.md` | Always read rules before generating code |
| `memory/feedback_code_organization.md` | Code organization principles — KISS, no over-engineering, clean structure |

## Rules Enforced

### Git Discipline
- **Never** run `git commit` or `git push` unless the user explicitly asks
- When work is done, stop — do not commit or push proactively
- "Update changelogs" means edit the files only, not commit them

### Code Organization
- Read project rules/conventions before writing any code
- Follow existing project structure and naming patterns
- Keep code simple — no premature abstractions
- Run tests after every change (double-check your work)

## Setup

Copy memory files to Claude's project memory directory:

### Windows
```powershell
$memoryDir = "$env:USERPROFILE\.claude\projects\<project-key>\memory"
New-Item -ItemType Directory -Path $memoryDir -Force
Copy-Item CLAUDE_MAN\personas\git-and-code-org\memory\* $memoryDir\
```

### Mac/Linux
```bash
mkdir -p ~/.claude/projects/<project-key>/memory
cp CLAUDE_MAN/personas/git-and-code-org/memory/* ~/.claude/projects/<project-key>/memory/
```

**Note:** Replace `<project-key>` with your project's Claude key (check `ls ~/.claude/projects/`).
