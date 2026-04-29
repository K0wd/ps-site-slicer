#!/usr/bin/env bash
# push-both.sh — push current branch to both 'origin' (GitHub) and 'gitlab'
# Forces ~/.ssh/fulcrum for both pushes via GIT_SSH_COMMAND (no ~/.ssh/config changes).
#
# Usage:
#   ./scripts/push-both.sh          # interactive confirmation
#   ./scripts/push-both.sh -y       # skip confirmation
#
# One-time setup:
#   git remote add gitlab git@gitlab.com:powerslice-software-development/sm-test-artifacts.git
#   # Add ~/.ssh/fulcrum.pub to BOTH GitHub and GitLab account SSH keys.

set -euo pipefail

KEY="$HOME/.ssh/fulcrum"
ORIGIN_REMOTE="origin"
GITLAB_REMOTE="gitlab"

# --- Sanity checks ---

if [ ! -f "$KEY" ]; then
  echo "ERROR: SSH key not found at $KEY" >&2
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: not inside a git work tree" >&2
  exit 1
fi

if ! git remote get-url "$ORIGIN_REMOTE" >/dev/null 2>&1; then
  echo "ERROR: '$ORIGIN_REMOTE' remote not configured" >&2
  exit 1
fi

if ! git remote get-url "$GITLAB_REMOTE" >/dev/null 2>&1; then
  cat >&2 <<EOF
ERROR: '$GITLAB_REMOTE' remote not configured.
Run once:
  git remote add $GITLAB_REMOTE git@gitlab.com:powerslice-software-development/sm-test-artifacts.git
EOF
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "HEAD" ]; then
  echo "ERROR: detached HEAD — checkout a branch before pushing" >&2
  exit 1
fi

# --- Show plan ---

echo "Branch:        $BRANCH"
echo "Origin (GH):   $(git remote get-url "$ORIGIN_REMOTE")"
echo "GitLab:        $(git remote get-url "$GITLAB_REMOTE")"
echo "SSH key:       $KEY"
echo

# --- Confirmation (skip with -y) ---

if [ "${1:-}" != "-y" ]; then
  read -r -p "Push '$BRANCH' to BOTH remotes? [y/N] " reply
  case "$reply" in
    y|Y) ;;
    *) echo "Aborted."; exit 1 ;;
  esac
fi

# Force fulcrum key for any ssh invocation git makes during this script
export GIT_SSH_COMMAND="ssh -i $KEY -o IdentitiesOnly=yes"

push_to() {
  local remote="$1"
  echo
  echo "→ Pushing to $remote..."
  if git push -u "$remote" "$BRANCH"; then
    echo "✓ $remote OK"
    return 0
  else
    echo "✗ $remote FAILED" >&2
    return 1
  fi
}

# Try both even if one fails; track via $fail
fail=0
push_to "$ORIGIN_REMOTE" || fail=1
push_to "$GITLAB_REMOTE" || fail=1

echo
if [ "$fail" -eq 0 ]; then
  echo "✓ All pushes succeeded."
else
  echo "✗ One or more pushes FAILED — see output above." >&2
  exit 1
fi
