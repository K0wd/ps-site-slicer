#!/bin/bash
# build-context.sh — Assemble context files for Claude CLI --append-system-prompt-file
#
# Source this from any step script AFTER PROJECT_DIR is set.
# Functions build temp files and echo the path. Call cleanup_context on exit.
#
# Usage:
#   source "$SCRIPT_DIR/build-context.sh"
#   BASE_CONTEXT=$(build_base_context)
#   trap cleanup_context EXIT

: "${PROJECT_DIR:?PROJECT_DIR must be set before sourcing build-context.sh}"

_BITE_CTX_DIR="${TMPDIR:-/tmp}/bite-ctx-$$"
mkdir -p "$_BITE_CTX_DIR"

_append_file() {
    local src="$1" dest="$2"
    if [ -f "$src" ]; then
        printf '\n---\n## %s\n\n' "$(basename "$src")" >> "$dest"
        cat "$src" >> "$dest"
    fi
}

# Base context: project wiki + brain files (shared by all claude-calling steps)
build_base_context() {
    local out="$_BITE_CTX_DIR/base-context.md"
    echo "# Project Context — SiteManager" > "$out"
    _append_file "$PROJECT_DIR/.claude-self/wiki.md" "$out"
    _append_file "$PROJECT_DIR/.claude-self/client-powerslice/wiki.md" "$out"
    _append_file "$PROJECT_DIR/.claude-self/client-powerslice/brain.md" "$out"
    _append_file "$PROJECT_DIR/.claude-self/rules/brain.md" "$out"
    echo "$out"
}

# Step 6 context: base + full QA expert knowledge (top-level .md + rules/*.mdc)
build_step6_context() {
    local out="$_BITE_CTX_DIR/step6-context.md"
    local base
    base=$(build_base_context)
    cat "$base" > "$out"
    printf '\n\n# QA Expert Knowledge\n\n' >> "$out"
    for f in "$PROJECT_DIR/.claude-self/qa-expert"/*.md; do
        [ -f "$f" ] || continue
        _append_file "$f" "$out"
    done
    for f in "$PROJECT_DIR/.claude-self/rules"/*.mdc; do
        [ -f "$f" ] || continue
        _append_file "$f" "$out"
    done
    echo "$out"
}

# Step 7 context: base + specific ISTQB automation refs + full test-automation-expert
build_step7_context() {
    local out="$_BITE_CTX_DIR/step7-context.md"
    local base
    base=$(build_base_context)
    cat "$base" > "$out"
    printf '\n\n# ISTQB Test Automation References\n\n' >> "$out"
    _append_file "$PROJECT_DIR/.claude-self/rules/istqb-ct-tas-test-automation-strategy-aide-context.mdc" "$out"
    _append_file "$PROJECT_DIR/.claude-self/rules/istqb-ctal-tae-test-automation-engineering-aide-context.mdc" "$out"
    printf '\n\n# Test Automation Expert Knowledge\n\n' >> "$out"
    for f in "$PROJECT_DIR/.claude-self/test-automation-expert"/*.md; do
        [ -f "$f" ] || continue
        _append_file "$f" "$out"
    done
    echo "$out"
}

cleanup_context() {
    rm -rf "$_BITE_CTX_DIR"
}
