# Musashi MCP Servers

This directory contains Model Context Protocol (MCP) servers that enhance Musashi's AI workflow design capabilities.

## Overview

Musashi integrates three specialized MCP servers:

1. **Playwright MCP** - Web automation and testing
2. **Context7 MCP** - Advanced context management  
3. **Sequential Thinking MCP** - Step-by-step reasoning

## Quick Start

### Install All MCP Servers
```bash
# From project root
make install-mcp
```

### Test MCP Servers
```bash
# Test all servers
make test-mcp

# Or test individually
cd servers/playwright && npm test
cd servers/context7 && python -m pytest
cd servers/sequential-thinking && python -m pytest
```

### Development with Docker
```bash
# Start MCP container in development mode
make mcp-dev

# Or include in full development stack
make dev
```

## MCP Servers

### 1. Playwright MCP Server

**Location**: `servers/playwright/`
**Language**: TypeScript/Node.js
**Purpose**: Web automation for workflow validation

**Available Tools**:
- `navigate` - Navigate to URL
- `click` - Click elements
- `type` - Type into inputs
- `screenshot` - Take screenshots
- `wait_for_selector` - Wait for elements
- `get_page_content` - Extract HTML
- `evaluate` - Execute JavaScript

**Usage Example**:
```bash
node servers/playwright/build/index.js
```

### 2. Context7 MCP Server

**Location**: `servers/context7/`
**Language**: Python
**Purpose**: Advanced context management with prioritization

**Available Tools**:
- `add_context` - Add content with priority/TTL
- `remove_context` - Remove specific context
- `search_context` - Semantic search
- `get_priority_context` - Get high-priority items
- `get_context_summary` - Context statistics
- `optimize_context` - Manual optimization

**Usage Example**:
```bash
python -m context7_mcp
```

**Configuration**:
- `CONTEXT7_MAX_TOKENS`: Maximum context window (default: 100,000)
- `OPENAI_API_KEY`: Required for embeddings/analysis

### 3. Sequential Thinking MCP Server

**Location**: `servers/sequential-thinking/`
**Language**: Python
**Purpose**: Step-by-step reasoning and problem analysis

**Available Tools**:
- `start_thinking_chain` - Begin reasoning process
- `add_thinking_step` - Add analysis step
- `complete_thinking_chain` - Conclude with summary
- `analyze_problem` - Auto-analyze with AI
- `get_thinking_chain` - Retrieve chain details
- `list_thinking_chains` - List active chains

**Usage Example**:
```bash
python -m sequential_thinking_mcp
```

**Configuration**:
- `ANTHROPIC_API_KEY`: Required for auto-reasoning
- `THINKING_MODEL`: Claude model (default: claude-3-sonnet-20240229)

## Integration with Musashi

### Workflow Design Enhancement

MCP servers provide additional capabilities for workflow design:

1. **Validation** (Playwright): Test agent workflows with real web interactions
2. **Memory** (Context7): Maintain design context across sessions
3. **Analysis** (Sequential Thinking): Break down complex workflow logic

### Configuration

Main configuration file: `config/mcp.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": ["/app/mcp/servers/playwright/build/index.js"]
    },
    "context7": {
      "command": "python",
      "args": ["-m", "context7_mcp"]
    },
    "sequential-thinking": {
      "command": "python", 
      "args": ["-m", "sequential_thinking_mcp"]
    }
  }
}
```

### Environment Variables

Add to your `.env` file:

```bash
# MCP Server API Keys
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# MCP Configuration
CONTEXT7_MAX_TOKENS=100000
THINKING_MODEL=claude-3-sonnet-20240229
```

## Development

### Directory Structure

```
mcp/
├── config/              # MCP configuration files
│   └── mcp.json        # Main MCP server configuration
├── servers/            # Individual MCP servers
│   ├── playwright/     # Playwright MCP server
│   ├── context7/       # Context7 MCP server
│   └── sequential-thinking/  # Sequential Thinking MCP server
├── scripts/            # Utility scripts
│   ├── install_mcp.sh  # Install all servers
│   └── test_mcp.py     # Test all servers
├── Dockerfile          # MCP container definition
└── README.md          # This file
```

### Adding New MCP Servers

1. Create server directory in `servers/`
2. Implement MCP server protocol
3. Add to `config/mcp.json`
4. Update Docker configuration
5. Add tests and documentation

### Testing

Each server includes its own test suite:

```bash
# Test individual servers
cd servers/playwright && npm test
cd servers/context7 && python -m pytest tests/
cd servers/sequential-thinking && python -m pytest tests/

# Test all servers together
python scripts/test_mcp.py
```

## Deployment

### Docker

MCP servers are included in the main Docker Compose setup:

```bash
# Development
docker-compose -f docker-compose.dev.yml up mcp

# Production
docker-compose up mcp
```

### Standalone

Each server can run independently:

```bash
# Install dependencies first
make install-mcp

# Run servers individually
node servers/playwright/build/index.js
python -m context7_mcp
python -m sequential_thinking_mcp
```

## Troubleshooting

### Common Issues

1. **Missing API Keys**: Ensure `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are set
2. **Playwright Dependencies**: Run `npx playwright install` if browser automation fails
3. **Python Dependencies**: Install with `pip install -e .` in each Python server directory
4. **Port Conflicts**: MCP services use port 3001 by default

### Logs

Check MCP server logs:

```bash
# Docker logs
docker-compose logs mcp

# Individual server logs
docker-compose exec mcp tail -f /var/log/mcp/*.log
```

### Debug Mode

Enable debug logging:

```bash
export MCP_DEBUG=1
make mcp-dev
```

## Contributing

1. Follow existing server patterns
2. Add comprehensive tests
3. Update documentation
4. Ensure Docker integration works
5. Test with Musashi workflow design features

## License

MIT License - see main project LICENSE file.