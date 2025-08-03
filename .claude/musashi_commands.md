# Musashi-Specific SuperClaude Commands

This file defines Musashi project-specific commands and workflows.

## /workflow
**Purpose**: Create and manage AI agent workflows
**Usage**: `/workflow [create|edit|validate|export] [name]`
**Description**: Comprehensive workflow management with visual design support.

### Subcommands:
- `/workflow create [name]` - Create new workflow with template
- `/workflow edit [id]` - Open workflow in visual editor
- `/workflow validate [id]` - Validate workflow logic and connections
- `/workflow export [id] [format]` - Export workflow (JSON, YAML, or code)

## /node
**Purpose**: Manage workflow nodes and components
**Usage**: `/node [add|edit|connect|test] [type] [properties]`
**Description**: Handle individual workflow nodes and their properties.

### Node Types:
- `input` - Data sources, user inputs, API endpoints
- `process` - Data transformation, AI model calls
- `decision` - Conditional logic and routing
- `output` - Results, notifications, integrations

## /flow
**Purpose**: Analyze and optimize workflow flows
**Usage**: `/flow [analyze|optimize|debug] [workflow_id]`
**Description**: Flow analysis with automatic layout and optimization suggestions.

## /agent
**Purpose**: Design AI agent behaviors and capabilities
**Usage**: `/agent [design|test|deploy] [agent_name]`
**Description**: Create and manage AI agent definitions within workflows.

## /mcp
**Purpose**: Integrate with MCP servers for enhanced functionality
**Usage**: `/mcp [playwright|context7|thinking] [command] [args]`
**Description**: Direct integration with Musashi's MCP servers.

### MCP Integrations:
- `/mcp playwright [navigate|test|screenshot]` - Web automation
- `/mcp context7 [add|search|optimize]` - Context management
- `/mcp thinking [analyze|chain|reason]` - Sequential reasoning

## /template
**Purpose**: Manage workflow templates and patterns
**Usage**: `/template [create|apply|list] [category]`
**Description**: Work with predefined workflow templates and design patterns.

### Template Categories:
- `customer-service` - Support and FAQ agents
- `content-generation` - Writing and creative workflows
- `data-processing` - ETL and analysis pipelines
- `integration` - API and system integration patterns

## /team
**Purpose**: Collaboration and team management
**Usage**: `/team [invite|roles|share] [workspace]`
**Description**: Handle team collaboration features and permissions.

## /deploy
**Purpose**: Workflow deployment and integration
**Usage**: `/deploy [prepare|validate|export] [target]`
**Description**: Prepare workflows for deployment to various platforms.

### Deployment Targets:
- `json` - Export as JSON configuration
- `code` - Generate executable code
- `api` - Create REST API endpoints
- `webhook` - Configure webhook integrations

## Musashi Development Commands

### /musashi-dev
**Purpose**: Development utilities for Musashi platform
**Usage**: `/musashi-dev [setup|test|build|deploy]`
**Description**: Development workflow automation for the Musashi platform itself.

### /musashi-api
**Purpose**: API development and testing
**Usage**: `/musashi-api [generate|test|document] [endpoint]`
**Description**: FastAPI endpoint generation and testing utilities.

### /musashi-ui
**Purpose**: Frontend development assistance
**Usage**: `/musashi-ui [component|page|style] [name]`
**Description**: React component generation and UI development support.

## Integration Examples

### Creating a Customer Service Workflow
```
/workflow create customer-support
/template apply customer-service
/node add input user-message
/node add process intent-classification  
/node add decision route-by-intent
/node add output response-generator
/flow analyze customer-support
/workflow validate customer-support
```

### Testing Workflow with MCP
```
/mcp playwright navigate https://example.com
/mcp context7 add "Customer context from chat history"
/mcp thinking analyze "How to improve response accuracy"
/workflow test customer-support
```

### Team Collaboration
```
/team invite developer@company.com editor
/workflow share customer-support read-only
/team roles list customer-support
```

These commands are available when working on Musashi projects and integrate seamlessly with the existing SuperClaude framework.