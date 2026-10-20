#!/bin/bash
# Make the Playwright MCP plugin work in Claude Code cloud sessions.
# The plugin launches Google Chrome from /opt/google/chrome/chrome, but the
# container only ships Playwright's Chromium, and it runs as root, which
# Chromium refuses without --no-sandbox. Put a wrapper at the expected path.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

CHROMIUM="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}/chromium"
CHROME=/opt/google/chrome/chrome
MARKER="# playwright-mcp chromium wrapper"

if [ ! -x "$CHROMIUM" ]; then
  echo "session-start: Chromium not found at $CHROMIUM, skipping Chrome wrapper" >&2
  exit 0
fi

# Leave a real Chrome install alone; only (re)write our own wrapper.
if [ -e "$CHROME" ] && ! grep -q "$MARKER" "$CHROME" 2>/dev/null; then
  exit 0
fi

mkdir -p "$(dirname "$CHROME")"
cat > "$CHROME" <<WRAPPER
#!/bin/sh
$MARKER
exec "$CHROMIUM" --no-sandbox "\$@"
WRAPPER
chmod +x "$CHROME"
