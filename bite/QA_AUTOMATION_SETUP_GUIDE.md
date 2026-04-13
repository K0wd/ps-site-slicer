# SM QA Automation — Setup Guide (macOS)

## What This Does

An automated system that tests Jira tickets in "Testing" status every hour overnight (5PM-5AM). It uses Claude Code CLI + Playwright to run browser tests against the test server, posts results with screenshots to Jira, and transitions tickets based on pass/fail.


## Prerequisites

1. Claude Code CLI installed (`claude` available on PATH)
2. Node.js 20+ (via nvm — run: nvm install 20.20.0)
3. Python 3 (`python3` available on PATH)
4. Playwright — run: npx playwright install
5. Jira API Token — generate at https://id.atlassian.com/manage-profile/security/api-tokens


## Files

All files are in `bite/`:

    jira_api.py              — Jira API wrapper, handles all Jira operations
    run-qa.sh                — Main runner script, finds tickets and invokes Claude
    qa-prompt.md             — Prompt template telling Claude how to test
    setup-scheduler.sh       — One-time setup script for macOS launchd


## Configuration

### 1. Jira Credentials

Create `~/.jira-config.json`:

```json
{
    "email": "your_email@example.com",
    "api_token": "your_api_token_here",
    "base_url": "https://powerslicesoftware.atlassian.net"
}
```

### 2. Verify Setup

Test Jira auth:

    python3 bite/jira_api.py test

Expected output: "Authentication successful! Display name: ..."


## Setup Steps (do these in order)

Step 1: Create `~/.jira-config.json` with your credentials (see above)

Step 2: Make the runner executable:

    chmod +x bite/run-qa.sh

Step 3: Test Jira auth:

    python3 bite/jira_api.py test

Step 4: Test manually on a single ticket:

    ./bite/run-qa.sh SM-XXXX

    Replace SM-XXXX with an actual ticket in "Testing" status.
    This will take about 10-20 minutes. Check Jira to see if results were posted.

Step 5: Once the manual test works, install the launchd scheduler:

    chmod +x bite/setup-scheduler.sh
    ./bite/setup-scheduler.sh

    This creates a launchd agent called "com.fulcrum.sm-qa-automation".


## How It Works (what happens each run)

    1. Script checks if current time is within 5PM-5AM window
    2. Verifies Jira API access
    3. Queries Jira for the highest priority SM ticket in "Testing" status
    4. Claude reads the ticket details, comments, and attachments
    5. Claude reviews the related code changes in the codebase
    6. Claude writes a test plan (bite/logs/{ticket}_plan.md)
    7. Claude runs Playwright browser tests against the test server
    8. Screenshots are captured for each test case
    9. Results are posted as a Jira comment with screenshots attached
   10. Ticket is transitioned:
       - PASS  ->  "Verify"
       - FAIL  ->  "QA Failed"


## Managing the Scheduler

Run immediately (don't wait for schedule):
    launchctl start com.fulcrum.sm-qa-automation

Check status:
    launchctl list | grep com.fulcrum.sm-qa-automation

Disable (pause automation):
    launchctl unload ~/Library/LaunchAgents/com.fulcrum.sm-qa-automation.plist

Re-enable:
    launchctl load ~/Library/LaunchAgents/com.fulcrum.sm-qa-automation.plist

Test a specific ticket manually:
    ./bite/run-qa.sh SM-XXXX

Skip a ticket from automation:
    Add the label "no_ai_test" to the ticket in Jira

Remove entirely:
    launchctl unload ~/Library/LaunchAgents/com.fulcrum.sm-qa-automation.plist
    rm ~/Library/LaunchAgents/com.fulcrum.sm-qa-automation.plist


## Logs & Output

Where to find what happened:

    bite/logs/qa_run_{timestamp}.log
        Runner log — did it start, find a ticket, finish

    bite/logs/claude_output_{ticket}_{timestamp}.txt
        Full Claude analysis output

    bite/logs/prompt_{timestamp}.txt
        Prompt that was sent to Claude

    bite/logs/{ticket}_plan.md
        Generated test plan for the ticket

    bite/logs/{ticket}_results.txt
        Test results (also posted to Jira)


## Test Server Credentials

    SM URL:      https://testserver.betacom.com/spa
    PWA URL:     https://testserver.betacom.com/testpwa
    Username:    hawseyl
    Password:    test1234


## Important Notes

- Your machine must be awake overnight (screen locked is fine, sleep/shutdown will miss runs)
- Each run processes ONE ticket — with hourly runs, up to 12 tickets can be tested per night
- To exclude a ticket from automation, add the label "no_ai_test" in Jira
- The time window (5PM-5AM) prevents accidental test runs during active development hours
- macOS may require you to grant Full Disk Access to the terminal app running the launchd agent


## Troubleshooting

"Outside testing window" in logs:
    Normal — means the script ran during daytime (5AM-5PM) and correctly skipped.

"No eligible Testing tickets found":
    No SM tickets are in "Testing" status, or all have "no_ai_test" label.

"Jira API auth failed":
    Check ~/.jira-config.json. Generate a new token if expired.

Claude CLI not found:
    Make sure Claude Code CLI is installed and `claude` is on your PATH.
    Check: which claude

Tests failing unexpectedly:
    Check the test server is accessible. Try opening https://testserver.betacom.com/spa in your browser.

Launchd agent not running:
    Check: launchctl list | grep sm-qa
    Reload: launchctl unload ~/Library/LaunchAgents/com.fulcrum.sm-qa-automation.plist && launchctl load ~/Library/LaunchAgents/com.fulcrum.sm-qa-automation.plist
