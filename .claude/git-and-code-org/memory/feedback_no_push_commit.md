---
name: Never push or commit without explicit permission
description: Do not run git commit or git push unless the user explicitly asks for it
type: feedback
---

Never run `git commit` or `git push` unless the user explicitly asks for it.

**Why:** The user wants full control over when changes are committed and pushed. Committing or pushing proactively — even after completing work — is unwanted.

**How to apply:** When work is done, stop. Do not commit or push. If the user says "commit" or "push", then do it. If they say "update changelogs and readme", that means edit the files only — not commit/push them.
