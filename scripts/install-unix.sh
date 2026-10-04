#!/usr/bin/env bash
# Agentic Hub Office — 1-Click macOS & Linux Setup
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================================="
echo "        Setting up Agentic Hub Desktop Software           "
echo "=========================================================="

if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js is required. Please install Node.js 20+ first."
    exit 1
fi

echo "[*] Installing dependencies and building..."
npm --prefix "$ROOT_DIR" ci
npm --prefix "$ROOT_DIR" run build

# Create a local desktop launcher script in user bin
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"
cat << 'EOF' > "$BIN_DIR/agentic-hub"
#!/usr/bin/env bash
EOF
echo "exec node \"$ROOT_DIR/bin/agent-office.js\" \"\$@\"" >> "$BIN_DIR/agentic-hub"
chmod +x "$BIN_DIR/agentic-hub"

echo "[+] Created 'agentic-hub' launcher in $BIN_DIR/agentic-hub"
echo "Launch it anytime with: agentic-hub --port 4600 --password dev"
