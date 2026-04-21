# Top 10 Improvements for the TestGenerator Pipeline

Ranked by impact vs effort. Each item includes what it fixes, why it matters, and rough effort.

---

## 1. Drop `comment` from step 3 issue fetch (or deduplicate)

**Problem:** The `comment` field is 28-32 KB and is fetched inside `get-issue` AND separately via `get-comments`. Both are piped into step 5's Claude prompt, doubling comment tokens.

**Fix:** Remove `comment` from the `ISSUE_FIELDS` list in step 3. Comments already live in `3_comments.json`.

**Impact:** Cuts step 3 output from ~80 KB to ~8-10 KB. Directly reduces Claude token usage in step 5.

**Effort:** 1 line change.

---

## 2. Trim comments JSON to text-only (strip Atlassian Document Format)

**Problem:** `get-comments` returns Jira's ADF (Atlassian Document Format) — deeply nested JSON with `type: "paragraph"`, `type: "text"`, `attrs`, etc. A 5-line developer comment becomes 200+ lines of JSON.

**Fix:** Add a post-processing step (Python one-liner) that extracts plain text from each comment's ADF body, keeping only `author`, `created`, and the flattened text. Save as `3_comments_trimmed.json` or overwrite the original.

**Impact:** Could reduce comments payload by 60-80%. Huge token savings in step 5.

**Effort:** Small — ~15 lines of Python.

---

## 3. Add retry logic for failed Claude calls in step 6

**Problem:** Step 6 launches 10-18 parallel Claude calls. If one fails (API timeout, rate limit, transient error), that TC gets a TODO placeholder and the entire pipeline continues with a gap. The only recovery is to re-run the whole step.

**Fix:** Add a retry loop (1-2 retries with exponential backoff) around each background Claude call in step 6. If the first attempt fails, wait and retry before marking as failed.

**Impact:** Reduces manual re-runs. Especially valuable for large plans with 15+ TCs where one flaky failure wastes the entire parallel batch.

**Effort:** Medium — modify the background subshell in step 6 to add retry logic.

---

## 4. Step 5 context references wrong filenames for step 4 outputs

**Problem:** Step 5 looks for `4_commits.md` and `4_changed_files.md` but step 4 writes `4_commits.txt` and `4_changed_files.txt`. The context from step 4 is silently skipped every run.

**Fix:** Align the filenames — either change step 4 to write `.md` or change step 5 to read `.txt`.

**Impact:** Step 5 test plans would include commit history and changed file context, producing better-targeted test cases especially for code-change-driven stories.

**Effort:** 2 line change.

---

## 5. Add cost tracking alongside tokens

**Problem:** Token count alone doesn't tell you the dollar cost. Step 6 with 18 parallel Opus calls is expensive, but you can't see how much without manual calculation.

**Fix:** The `--output-format json` response already includes `total_cost_usd`. Extract it alongside tokens and aggregate per step. Add a `Cost ($)` column to the timing summary.

**Impact:** Visibility into spend per ticket, per step. Enables cost-based optimization decisions.

**Effort:** Small — the data is already available in the JSON output.

---

## 6. Step 7 sequential-per-step is slow — batch missing steps per TC

**Problem:** Step 7 implements one missing step definition at a time, calling Claude + bddgen after each. For a TC with 8 missing steps, that's 8 serial Claude calls + 8 bddgen compiles. With ~10s per cycle, a single TC can take 80+ seconds.

**Fix:** Batch all missing steps for a TC into one Claude prompt: "Implement these 8 step definitions." Then run bddgen once. Fall back to per-step only if the batch fails.

**Impact:** Could reduce step 7 wall time by 5-8x for new feature tickets where most steps are missing.

**Effort:** Medium-high — requires restructuring the step 7 inner loop and building a batched prompt.

---

## 7. Add step skip/cache logic for re-runs

**Problem:** Running `./TestGenerator.sh 3-6 SM-864` re-fetches the Jira issue, re-fetches comments, re-generates the test plan, and re-generates all Gherkin — even if nothing changed. This wastes time and tokens on repeat runs (e.g., after fixing a step 6 failure).

**Fix:** Add a `--force` flag to TestGenerator.sh. Without it, each step checks for existing output files and skips if they exist and are recent (e.g., <1 hour old). With `--force`, always re-run.

**Impact:** Re-runs of `3-6` drop from ~3 minutes to ~30 seconds when only step 6 needs to regenerate.

**Effort:** Medium — add timestamp checks per step in TestGenerator.sh or each step script.

---

## 8. Parallelize step 7 across TCs (not just steps within each TC)

**Problem:** Step 7 processes TCs sequentially: TC-01 all steps → TC-02 all steps → ... For 10 TCs, this is fully serial.

**Fix:** After step 6 compiles the feature file, launch step 7's per-TC loop in parallel (similar to step 6's approach). Each TC gets its own background process. Use file locks or separate step file directories to avoid write conflicts.

**Impact:** Step 7 wall time reduced from O(TCs * steps) to O(max_TC_steps). Could turn a 10-minute step into 2-3 minutes.

**Effort:** High — write conflicts on shared .steps.ts files need careful handling (each TC may add to the same file).

---

## 9. Add a dry-run / plan-only mode

**Problem:** There's no way to preview what bite will do without actually executing. Running `./TestGenerator.sh 1-11 all` on the wrong filter could transition tickets you didn't intend to touch.

**Fix:** Add a `--dry-run` flag that runs steps 1-5 (information gathering + test plan) but stops before step 6 (code generation). Print a summary: "Would process 3 tickets: SM-864, SM-1030, SM-934. Run without --dry-run to continue."

**Impact:** Safety net for multi-ticket runs. Also useful for reviewing test plans before committing to full automation.

**Effort:** Small — add a flag check in TestGenerator.sh's step loop.

---

## 10. Consolidate steps 8 + 9 into a single step

**Problem:** Step 8 (execute tests) and step 9 (determine results) are tightly coupled — step 9 just re-reads step 8's output and reformats it. This adds an extra Claude call and an extra step in the timing summary for what is essentially post-processing.

**Fix:** Have step 8 produce both the results and the structured report in one Claude call. The prompt already asks for a results table — adding the structured report format is minimal. Remove step 9 as a separate script; renumber 10→9, 11→10.

**Impact:** Saves one Claude call per ticket (~$0.05-0.15), simplifies the pipeline, reduces total steps from 11 to 10.

**Effort:** Medium — merge the prompts, update chomp-logger references, renumber TestGenerator.sh step mapping.
