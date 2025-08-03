#!/usr/bin/env python3

import json
import logging
import os
from typing import Any, Dict, List, Optional, Union
from datetime import datetime
from enum import Enum

import anthropic
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
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sequential-thinking-mcp")

console = Console()

class ThinkingStep(BaseModel):
    """Represents a single step in the thinking process."""
    step_number: int
    title: str
    description: str
    reasoning: str
    output: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0, default=0.8)
    timestamp: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ThinkingChain(BaseModel):
    """Represents a complete chain of reasoning."""
    id: str
    problem: str
    steps: List[ThinkingStep] = Field(default_factory=list)
    conclusion: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    total_confidence: Optional[float] = None

class ThinkingEngine:
    """Engine for sequential reasoning and step-by-step problem solving."""
    
    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY", "")
        )
        self.chains: Dict[str, ThinkingChain] = {}
        self.model = os.getenv("THINKING_MODEL", "claude-3-sonnet-20240229")
    
    async def start_thinking_chain(self, problem: str, chain_id: Optional[str] = None) -> str:
        """Start a new thinking chain for a given problem."""
        if not chain_id:
            chain_id = f"chain_{datetime.now().timestamp():.6f}"
        
        chain = ThinkingChain(
            id=chain_id,
            problem=problem
        )
        
        self.chains[chain_id] = chain
        logger.info(f"Started thinking chain {chain_id} for problem: {problem[:100]}...")
        
        return chain_id
    
    async def add_thinking_step(
        self, 
        chain_id: str, 
        title: str, 
        description: str,
        auto_reason: bool = True
    ) -> ThinkingStep:
        """Add a step to the thinking chain."""
        if chain_id not in self.chains:
            raise ValueError(f"Chain {chain_id} not found")
        
        chain = self.chains[chain_id]
        step_number = len(chain.steps) + 1
        
        # Auto-generate reasoning if requested
        reasoning = ""
        if auto_reason and self.client.api_key:
            reasoning = await self._generate_reasoning(chain.problem, title, description, chain.steps)
        
        step = ThinkingStep(
            step_number=step_number,
            title=title,
            description=description,
            reasoning=reasoning
        )
        
        chain.steps.append(step)
        logger.info(f"Added step {step_number} to chain {chain_id}: {title}")
        
        return step
    
    async def complete_thinking_chain(self, chain_id: str, auto_conclude: bool = True) -> ThinkingChain:
        """Complete a thinking chain with a conclusion."""
        if chain_id not in self.chains:
            raise ValueError(f"Chain {chain_id} not found")
        
        chain = self.chains[chain_id]
        
        if auto_conclude and self.client.api_key:
            chain.conclusion = await self._generate_conclusion(chain)
        
        chain.completed_at = datetime.now()
        chain.total_confidence = sum(step.confidence for step in chain.steps) / len(chain.steps) if chain.steps else 0
        
        logger.info(f"Completed thinking chain {chain_id}")
        return chain
    
    async def get_thinking_chain(self, chain_id: str) -> Optional[ThinkingChain]:
        """Get a thinking chain by ID."""
        return self.chains.get(chain_id)
    
    async def list_thinking_chains(self) -> List[str]:
        """List all thinking chain IDs."""
        return list(self.chains.keys())
    
    async def analyze_problem(self, problem: str, max_steps: int = 5) -> ThinkingChain:
        """Automatically analyze a problem with sequential thinking."""
        chain_id = await self.start_thinking_chain(problem)
        
        if not self.client.api_key:
            # Manual mode - create placeholder steps
            await self.add_thinking_step(
                chain_id, 
                "Analysis Required", 
                "Manual analysis needed - no API key provided",
                auto_reason=False
            )
            return await self.complete_thinking_chain(chain_id, auto_conclude=False)
        
        # Auto-generate thinking steps
        steps_prompt = f"""
        Break down this problem into {max_steps} sequential thinking steps:
        Problem: {problem}
        
        For each step, provide:
        1. Title (brief, descriptive)
        2. Description (what needs to be analyzed/considered)
        
        Return as JSON array: [{{\"title\": \"...\", \"description\": \"...\"}}, ...]
        """
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                messages=[{"role": "user", "content": steps_prompt}]
            )
            
            # Parse the response to extract steps
            content = response.content[0].text if response.content else ""
            
            # Try to extract JSON from the response
            import re
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                steps_data = json.loads(json_match.group())
                
                for step_data in steps_data[:max_steps]:
                    await self.add_thinking_step(
                        chain_id,
                        step_data.get("title", "Thinking Step"),
                        step_data.get("description", "Analysis step"),
                        auto_reason=True
                    )
            else:
                # Fallback if JSON parsing fails
                await self.add_thinking_step(
                    chain_id,
                    "Problem Analysis",
                    "Initial analysis of the problem",
                    auto_reason=True
                )
        
        except Exception as e:
            logger.error(f"Error in auto-analysis: {e}")
            await self.add_thinking_step(
                chain_id,
                "Analysis Error",
                f"Error in automatic analysis: {str(e)}",
                auto_reason=False
            )
        
        return await self.complete_thinking_chain(chain_id, auto_conclude=True)
    
    async def _generate_reasoning(
        self, 
        problem: str, 
        step_title: str, 
        step_description: str, 
        previous_steps: List[ThinkingStep]
    ) -> str:
        """Generate reasoning for a thinking step using Claude."""
        context = ""
        if previous_steps:
            context = "\n\nPrevious steps:\n" + "\n".join([
                f"{i+1}. {step.title}: {step.reasoning[:200]}..."
                for i, step in enumerate(previous_steps)
            ])
        
        prompt = f"""
        Problem: {problem}
        Current Step: {step_title}
        Step Description: {step_description}
        {context}
        
        Provide detailed reasoning for this step. Focus on:
        1. What needs to be considered
        2. Key insights or observations
        3. How this connects to the overall problem
        4. What conclusions can be drawn
        
        Be concise but thorough (2-3 paragraphs max).
        """
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response.content[0].text if response.content else "No reasoning generated"
        
        except Exception as e:
            logger.error(f"Error generating reasoning: {e}")
            return f"Error generating reasoning: {str(e)}"
    
    async def _generate_conclusion(self, chain: ThinkingChain) -> str:
        """Generate a conclusion for the thinking chain."""
        steps_summary = "\n".join([
            f"Step {step.step_number}: {step.title}\n{step.reasoning}\n"
            for step in chain.steps
        ])
        
        prompt = f"""
        Problem: {chain.problem}
        
        Thinking Steps:
        {steps_summary}
        
        Based on the sequential analysis above, provide a clear, actionable conclusion that:
        1. Summarizes the key insights
        2. Provides a direct answer or recommendation
        3. Identifies any remaining uncertainties
        4. Suggests next steps if applicable
        
        Be concise but comprehensive.
        """
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response.content[0].text if response.content else "No conclusion generated"
        
        except Exception as e:
            logger.error(f"Error generating conclusion: {e}")
            return f"Error generating conclusion: {str(e)}"

# Global thinking engine
thinking_engine = ThinkingEngine()

# Create server instance
server = Server("sequential-thinking-mcp")

@server.list_tools()
async def handle_list_tools() -> List[Tool]:
    """List available sequential thinking tools."""
    return [
        Tool(
            name="start_thinking_chain",
            description="Start a new sequential thinking chain for a problem",
            inputSchema={
                "type": "object",
                "properties": {
                    "problem": {
                        "type": "string",
                        "description": "The problem to analyze"
                    },
                    "chain_id": {
                        "type": "string",
                        "description": "Optional custom chain ID"
                    }
                },
                "required": ["problem"]
            }
        ),
        Tool(
            name="add_thinking_step",
            description="Add a step to an existing thinking chain",
            inputSchema={
                "type": "object",
                "properties": {
                    "chain_id": {
                        "type": "string",
                        "description": "ID of the thinking chain"
                    },
                    "title": {
                        "type": "string",
                        "description": "Title of the thinking step"
                    },
                    "description": {
                        "type": "string",
                        "description": "Description of what to analyze in this step"
                    },
                    "auto_reason": {
                        "type": "boolean",
                        "default": True,
                        "description": "Whether to auto-generate reasoning"
                    }
                },
                "required": ["chain_id", "title", "description"]
            }
        ),
        Tool(
            name="complete_thinking_chain",
            description="Complete a thinking chain with a conclusion",
            inputSchema={
                "type": "object",
                "properties": {
                    "chain_id": {
                        "type": "string",
                        "description": "ID of the thinking chain"
                    },
                    "auto_conclude": {
                        "type": "boolean",
                        "default": True,
                        "description": "Whether to auto-generate conclusion"
                    }
                },
                "required": ["chain_id"]
            }
        ),
        Tool(
            name="get_thinking_chain",
            description="Get details of a thinking chain",
            inputSchema={
                "type": "object",
                "properties": {
                    "chain_id": {
                        "type": "string",
                        "description": "ID of the thinking chain"
                    }
                },
                "required": ["chain_id"]
            }
        ),
        Tool(
            name="analyze_problem",
            description="Automatically analyze a problem with sequential thinking",
            inputSchema={
                "type": "object",
                "properties": {
                    "problem": {
                        "type": "string",
                        "description": "The problem to analyze"
                    },
                    "max_steps": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 10,
                        "default": 5,
                        "description": "Maximum number of thinking steps"
                    }
                },
                "required": ["problem"]
            }
        ),
        Tool(
            name="list_thinking_chains",
            description="List all thinking chain IDs",
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
        if name == "start_thinking_chain":
            problem = arguments["problem"]
            chain_id = arguments.get("chain_id")
            
            result_id = await thinking_engine.start_thinking_chain(problem, chain_id)
            
            return [TextContent(
                type="text",
                text=f"Started thinking chain: {result_id}\nProblem: {problem}"
            )]
        
        elif name == "add_thinking_step":
            chain_id = arguments["chain_id"]
            title = arguments["title"]
            description = arguments["description"]
            auto_reason = arguments.get("auto_reason", True)
            
            step = await thinking_engine.add_thinking_step(chain_id, title, description, auto_reason)
            
            return [TextContent(
                type="text",
                text=f"Added Step {step.step_number}: {step.title}\n\nDescription: {step.description}\n\nReasoning: {step.reasoning}"
            )]
        
        elif name == "complete_thinking_chain":
            chain_id = arguments["chain_id"]
            auto_conclude = arguments.get("auto_conclude", True)
            
            chain = await thinking_engine.complete_thinking_chain(chain_id, auto_conclude)
            
            steps_text = "\n\n".join([
                f"Step {step.step_number}: {step.title}\n{step.reasoning}"
                for step in chain.steps
            ])
            
            return [TextContent(
                type="text",
                text=f"Completed Thinking Chain: {chain_id}\n\nProblem: {chain.problem}\n\n{steps_text}\n\nConclusion:\n{chain.conclusion or 'No conclusion generated'}\n\nTotal Confidence: {chain.total_confidence:.2f}"
            )]
        
        elif name == "get_thinking_chain":
            chain_id = arguments["chain_id"]
            
            chain = await thinking_engine.get_thinking_chain(chain_id)
            if not chain:
                return [TextContent(
                    type="text",
                    text=f"Thinking chain {chain_id} not found"
                )]
            
            return [TextContent(
                type="text",
                text=json.dumps(chain.dict(), indent=2, default=str)
            )]
        
        elif name == "analyze_problem":
            problem = arguments["problem"]
            max_steps = arguments.get("max_steps", 5)
            
            chain = await thinking_engine.analyze_problem(problem, max_steps)
            
            steps_text = "\n\n".join([
                f"Step {step.step_number}: {step.title}\n{step.reasoning}"
                for step in chain.steps
            ])
            
            return [TextContent(
                type="text",
                text=f"Sequential Analysis Complete\n\nProblem: {problem}\n\n{steps_text}\n\nConclusion:\n{chain.conclusion or 'Analysis completed without conclusion'}"
            )]
        
        elif name == "list_thinking_chains":
            chains = await thinking_engine.list_thinking_chains()
            
            return [TextContent(
                type="text",
                text=f"Active thinking chains: {', '.join(chains) if chains else 'None'}"
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
                server_name="sequential-thinking-mcp",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={}
                )
            )
        )