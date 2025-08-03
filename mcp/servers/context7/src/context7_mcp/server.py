#!/usr/bin/env python3

import json
import logging
import os
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

import httpx
import tiktoken
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
    LoggingMessage
)
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("context7-mcp")

class ContextWindow(BaseModel):
    """Represents a context window with semantic boundaries."""
    id: str
    content: str
    timestamp: datetime
    priority: int = Field(default=1, ge=1, le=10)
    token_count: int
    metadata: Dict[str, Any] = Field(default_factory=dict)
    expiry: Optional[datetime] = None

class ContextManager:
    """Advanced context management with semantic chunking and prioritization."""
    
    def __init__(self, max_tokens: int = 100000):
        self.max_tokens = max_tokens
        self.windows: List[ContextWindow] = []
        self.encoding = tiktoken.get_encoding("cl100k_base")
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        
    def count_tokens(self, text: str) -> int:
        """Count tokens in text."""
        return len(self.encoding.encode(text))
    
    async def add_context(
        self, 
        content: str, 
        priority: int = 5, 
        metadata: Optional[Dict[str, Any]] = None,
        ttl_hours: Optional[int] = None
    ) -> str:
        """Add content to context with priority and optional TTL."""
        context_id = f"ctx_{datetime.now().timestamp():.6f}"
        token_count = self.count_tokens(content)
        
        expiry = None
        if ttl_hours:
            expiry = datetime.now() + timedelta(hours=ttl_hours)
        
        window = ContextWindow(
            id=context_id,
            content=content,
            timestamp=datetime.now(),
            priority=priority,
            token_count=token_count,
            metadata=metadata or {},
            expiry=expiry
        )
        
        self.windows.append(window)
        await self._optimize_context()
        
        return context_id
    
    async def remove_context(self, context_id: str) -> bool:
        """Remove specific context window."""
        original_length = len(self.windows)
        self.windows = [w for w in self.windows if w.id != context_id]
        return len(self.windows) < original_length
    
    async def get_context_summary(self) -> Dict[str, Any]:
        """Get summary of current context state."""
        await self._cleanup_expired()
        
        total_tokens = sum(w.token_count for w in self.windows)
        priority_distribution = {}
        
        for window in self.windows:
            priority = window.priority
            if priority not in priority_distribution:
                priority_distribution[priority] = {"count": 0, "tokens": 0}
            priority_distribution[priority]["count"] += 1
            priority_distribution[priority]["tokens"] += window.token_count
        
        return {
            "total_windows": len(self.windows),
            "total_tokens": total_tokens,
            "max_tokens": self.max_tokens,
            "utilization": total_tokens / self.max_tokens if self.max_tokens > 0 else 0,
            "priority_distribution": priority_distribution,
            "oldest_timestamp": min((w.timestamp for w in self.windows), default=None),
            "newest_timestamp": max((w.timestamp for w in self.windows), default=None)
        }
    
    async def search_context(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search context windows by content similarity."""
        await self._cleanup_expired()
        
        # Simple text matching for now - could be enhanced with embeddings
        matching_windows = []
        query_lower = query.lower()
        
        for window in self.windows:
            content_lower = window.content.lower()
            if query_lower in content_lower:
                # Calculate simple relevance score
                score = content_lower.count(query_lower) / len(content_lower.split())
                matching_windows.append({
                    "id": window.id,
                    "content": window.content[:500] + "..." if len(window.content) > 500 else window.content,
                    "timestamp": window.timestamp,
                    "priority": window.priority,
                    "score": score,
                    "metadata": window.metadata
                })
        
        # Sort by relevance score and priority
        matching_windows.sort(key=lambda x: (x["score"], x["priority"]), reverse=True)
        return matching_windows[:limit]
    
    async def get_priority_context(self, min_priority: int = 7) -> List[Dict[str, Any]]:
        """Get high-priority context windows."""
        await self._cleanup_expired()
        
        high_priority = [
            {
                "id": w.id,
                "content": w.content,
                "timestamp": w.timestamp,
                "priority": w.priority,
                "metadata": w.metadata,
                "token_count": w.token_count
            }
            for w in self.windows 
            if w.priority >= min_priority
        ]
        
        # Sort by priority then timestamp
        high_priority.sort(key=lambda x: (x["priority"], x["timestamp"]), reverse=True)
        return high_priority
    
    async def _cleanup_expired(self):
        """Remove expired context windows."""
        now = datetime.now()
        self.windows = [w for w in self.windows if not w.expiry or w.expiry > now]
    
    async def _optimize_context(self):
        """Optimize context by removing low-priority items if over limit."""
        await self._cleanup_expired()
        
        total_tokens = sum(w.token_count for w in self.windows)
        
        if total_tokens <= self.max_tokens:
            return
        
        # Sort by priority (ascending) then timestamp (ascending)
        # This ensures we remove oldest, lowest priority items first
        self.windows.sort(key=lambda x: (x.priority, x.timestamp))
        
        while total_tokens > self.max_tokens and self.windows:
            removed = self.windows.pop(0)
            total_tokens -= removed.token_count
            logger.info(f"Removed context window {removed.id} (priority {removed.priority}) to stay within token limit")

# Global context manager
context_manager = ContextManager(max_tokens=int(os.getenv("CONTEXT7_MAX_TOKENS", "100000")))

# Create server instance
server = Server("context7-mcp")

@server.list_tools()
async def handle_list_tools() -> List[Tool]:
    """List available context management tools."""
    return [
        Tool(
            name="add_context",
            description="Add content to the context window with priority and optional TTL",
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "Content to add to context"
                    },
                    "priority": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 10,
                        "default": 5,
                        "description": "Priority level (1=lowest, 10=highest)"
                    },
                    "metadata": {
                        "type": "object",
                        "description": "Optional metadata for the content"
                    },
                    "ttl_hours": {
                        "type": "integer",
                        "minimum": 1,
                        "description": "Time to live in hours (optional)"
                    }
                },
                "required": ["content"]
            }
        ),
        Tool(
            name="remove_context",
            description="Remove a specific context window by ID",
            inputSchema={
                "type": "object",
                "properties": {
                    "context_id": {
                        "type": "string",
                        "description": "ID of context window to remove"
                    }
                },
                "required": ["context_id"]
            }
        ),
        Tool(
            name="get_context_summary",
            description="Get summary of current context state",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="search_context",
            description="Search context windows by content",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    },
                    "limit": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 20,
                        "default": 5,
                        "description": "Maximum number of results"
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="get_priority_context",
            description="Get high-priority context windows",
            inputSchema={
                "type": "object",
                "properties": {
                    "min_priority": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 10,
                        "default": 7,
                        "description": "Minimum priority level"
                    }
                }
            }
        ),
        Tool(
            name="optimize_context",
            description="Manually trigger context optimization",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> List[TextContent]:
    """Handle tool calls."""
    try:
        if name == "add_context":
            content = arguments["content"]
            priority = arguments.get("priority", 5)
            metadata = arguments.get("metadata", {})
            ttl_hours = arguments.get("ttl_hours")
            
            context_id = await context_manager.add_context(
                content=content,
                priority=priority,
                metadata=metadata,
                ttl_hours=ttl_hours
            )
            
            return [TextContent(
                type="text",
                text=f"Added context with ID: {context_id}\nPriority: {priority}\nToken count: {context_manager.count_tokens(content)}"
            )]
        
        elif name == "remove_context":
            context_id = arguments["context_id"]
            removed = await context_manager.remove_context(context_id)
            
            return [TextContent(
                type="text",
                text=f"Context {context_id} {'removed' if removed else 'not found'}"
            )]
        
        elif name == "get_context_summary":
            summary = await context_manager.get_context_summary()
            
            return [TextContent(
                type="text",
                text=f"Context Summary:\n{json.dumps(summary, indent=2, default=str)}"
            )]
        
        elif name == "search_context":
            query = arguments["query"]
            limit = arguments.get("limit", 5)
            
            results = await context_manager.search_context(query, limit)
            
            return [TextContent(
                type="text",
                text=f"Search Results for '{query}':\n{json.dumps(results, indent=2, default=str)}"
            )]
        
        elif name == "get_priority_context":
            min_priority = arguments.get("min_priority", 7)
            
            results = await context_manager.get_priority_context(min_priority)
            
            return [TextContent(
                type="text",
                text=f"High Priority Context (>= {min_priority}):\n{json.dumps(results, indent=2, default=str)}"
            )]
        
        elif name == "optimize_context":
            await context_manager._optimize_context()
            summary = await context_manager.get_context_summary()
            
            return [TextContent(
                type="text",
                text=f"Context optimized.\n{json.dumps(summary, indent=2, default=str)}"
            )]
        
        else:
            return [TextContent(
                type="text",
                text=f"Unknown tool: {name}"
            )]
    
    except Exception as e:
        logger.error(f"Error in tool call {name}: {e}")
        return [TextContent(
            type="text",
            text=f"Error: {str(e)}"
        )]

async def main():
    """Main function to run the server."""
    # Use stdio transport
    async with server.run_stdio() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="context7-mcp",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={}
                )
            )
        )