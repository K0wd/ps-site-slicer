#!/bin/bash
# Setup launchd scheduler for SM QA Automation (macOS)
# Run this script ONCE to install the launchd agent.
#
# Usage:
#   chmod +x setup-scheduler.sh
#   ./setup-scheduler.sh
#
# To remove later:
#   launchctl unload ~/Library/LaunchAgents/com.fulcrum.sm-qa-automation.plist
#   rm ~/Library/LaunchAgents/com.fulcrum.sm-qa-automation.plist

set -euo pipefail

PLIST_NAME="com.fulcrum.sm-qa-automation"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME.plist"
SCRIPT_PATH="/Users/kim/projects/github.com/fulcrum/ps-site-slicer/bite/run-qa.sh"
LOG_DIR="/Users/kim/projects/github.com/fulcrum/ps-site-slicer/bite/logs"

# Ensure the run script is executable
chmod +x "$SCRIPT_PATH"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Unload existing agent if present
if launchctl list | grep -q "$PLIST_NAME"; then
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
    echo "Unloaded existing agent: $PLIST_NAME"
fi

# Create the launchd plist — runs hourly
cat > "$PLIST_PATH" << 'PLIST_EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.fulcrum.sm-qa-automation</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/kim/projects/github.com/fulcrum/ps-site-slicer/bite/run-qa.sh</string>
    </array>

    <key>WorkingDirectory</key>
    <string>/Users/kim/projects/github.com/fulcrum/ps-site-slicer</string>

    <key>StartInterval</key>
    <integer>3600</integer>

    <key>StandardOutPath</key>
    <string>/Users/kim/projects/github.com/fulcrum/ps-site-slicer/bite/logs/launchd_stdout.log</string>

    <key>StandardErrorPath</key>
    <string>/Users/kim/projects/github.com/fulcrum/ps-site-slicer/bite/logs/launchd_stderr.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    </dict>

    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
PLIST_EOF

# Load the agent
launchctl load "$PLIST_PATH"

echo ""
echo "=== Agent '$PLIST_NAME' created successfully ==="
echo ""
echo "Schedule: Every hour (time window enforced by run-qa.sh: 5PM-5AM)"
echo "Script:   $SCRIPT_PATH"
echo ""
echo "Commands:"
echo "  Run now:      launchctl start $PLIST_NAME"
echo "  Check status: launchctl list | grep $PLIST_NAME"
echo "  Disable:      launchctl unload $PLIST_PATH"
echo "  Re-enable:    launchctl load $PLIST_PATH"
echo "  Remove:       launchctl unload $PLIST_PATH && rm $PLIST_PATH"
echo ""
echo "To run for a specific ticket:"
echo "  ./bite/run-qa.sh SM-1096"
