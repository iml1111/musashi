#!/bin/bash

# Install MCP servers for Musashi

set -e

echo "Installing Musashi MCP servers..."

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_DIR="$(dirname "$SCRIPT_DIR")"

# Install Playwright MCP server
echo "Installing Playwright MCP server..."
cd "$MCP_DIR/servers/playwright"
npm install
npm run build

# Install Playwright browsers
echo "Installing Playwright browsers..."
npx playwright install chromium

# Install Context7 MCP server
echo "Installing Context7 MCP server..."
cd "$MCP_DIR/servers/context7"
pip install -e .

# Install Sequential Thinking MCP server
echo "Installing Sequential Thinking MCP server..."
cd "$MCP_DIR/servers/sequential-thinking"
pip install -e .

echo "All MCP servers installed successfully!"
echo ""
echo "Available MCP servers:"
echo "- Playwright: node $MCP_DIR/servers/playwright/build/index.js"
echo "- Context7: python -m context7_mcp"
echo "- Sequential Thinking: python -m sequential_thinking_mcp"
echo ""
echo "Configuration file: $MCP_DIR/config/mcp.json"
echo ""
echo "To test the servers, run: python $MCP_DIR/scripts/test_mcp.py"