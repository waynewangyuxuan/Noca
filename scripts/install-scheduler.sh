#!/bin/bash

# Install Noca daily push scheduler (macOS launchd)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PLIST_SRC="$PROJECT_DIR/config/com.noca.daily-push.plist"
PLIST_DST="$HOME/Library/LaunchAgents/com.noca.daily-push.plist"

echo "Installing Noca daily push scheduler..."

# Create LaunchAgents directory if needed
mkdir -p "$HOME/Library/LaunchAgents"

# Unload existing if present
launchctl unload "$PLIST_DST" 2>/dev/null || true

# Copy and load
cp "$PLIST_SRC" "$PLIST_DST"
launchctl load "$PLIST_DST"

echo "Done! Noca will auto-push to Notion every day at 8:00 AM."
echo ""
echo "Commands:"
echo "  Check status:  launchctl list | grep noca"
echo "  Uninstall:     launchctl unload $PLIST_DST && rm $PLIST_DST"
echo "  View logs:     cat /tmp/noca-push.log"
