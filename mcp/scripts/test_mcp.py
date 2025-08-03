#!/usr/bin/env python3
"""
Test script for MCP servers.
"""

import asyncio
import json
import subprocess
import sys
from pathlib import Path


async def test_context7():
    """Test Context7 MCP server."""
    print("Testing Context7 MCP server...")
    
    # Start the server process
    proc = subprocess.Popen(
        [sys.executable, "-m", "context7_mcp"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=Path(__file__).parent.parent / "servers" / "context7"
    )
    
    try:
        # Send initialization request
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test-client", "version": "1.0.0"}
            }
        }
        
        proc.stdin.write(json.dumps(init_request) + "\n")
        proc.stdin.flush()
        
        # Read response
        response = proc.stdout.readline()
        print(f"Context7 initialization response: {response.strip()}")
        
        # Test adding context
        add_context_request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {
                "name": "add_context",
                "arguments": {
                    "content": "This is a test context entry",
                    "priority": 8,
                    "metadata": {"source": "test"}
                }
            }
        }
        
        proc.stdin.write(json.dumps(add_context_request) + "\n")
        proc.stdin.flush()
        
        response = proc.stdout.readline()
        print(f"Context7 add_context response: {response.strip()}")
        
    except Exception as e:
        print(f"Error testing Context7: {e}")
    finally:
        proc.terminate()
        proc.wait()


async def test_sequential_thinking():
    """Test Sequential Thinking MCP server."""
    print("Testing Sequential Thinking MCP server...")
    
    # Start the server process
    proc = subprocess.Popen(
        [sys.executable, "-m", "sequential_thinking_mcp"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=Path(__file__).parent.parent / "servers" / "sequential-thinking"
    )
    
    try:
        # Send initialization request
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test-client", "version": "1.0.0"}
            }
        }
        
        proc.stdin.write(json.dumps(init_request) + "\n")
        proc.stdin.flush()
        
        # Read response
        response = proc.stdout.readline()
        print(f"Sequential Thinking initialization response: {response.strip()}")
        
        # Test starting thinking chain
        start_chain_request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {
                "name": "start_thinking_chain",
                "arguments": {
                    "problem": "How to optimize a web application for performance?"
                }
            }
        }
        
        proc.stdin.write(json.dumps(start_chain_request) + "\n")
        proc.stdin.flush()
        
        response = proc.stdout.readline()
        print(f"Sequential Thinking start_chain response: {response.strip()}")
        
    except Exception as e:
        print(f"Error testing Sequential Thinking: {e}")
    finally:
        proc.terminate()
        proc.wait()


def test_playwright():
    """Test Playwright MCP server."""
    print("Testing Playwright MCP server...")
    
    playwright_dir = Path(__file__).parent.parent / "servers" / "playwright"
    
    # Check if build exists
    if not (playwright_dir / "build" / "index.js").exists():
        print("Building Playwright MCP server...")
        result = subprocess.run(
            ["npm", "run", "build"],
            cwd=playwright_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"Build failed: {result.stderr}")
            return
    
    # Start the server process
    proc = subprocess.Popen(
        ["node", "build/index.js"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=playwright_dir
    )
    
    try:
        # Send initialization request
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test-client", "version": "1.0.0"}
            }
        }
        
        proc.stdin.write(json.dumps(init_request) + "\n")
        proc.stdin.flush()
        
        # Read response with timeout
        import select
        import time
        
        timeout = 5
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if select.select([proc.stdout], [], [], 0.1)[0]:
                response = proc.stdout.readline()
                if response:
                    print(f"Playwright initialization response: {response.strip()}")
                    break
            
            if proc.poll() is not None:
                print("Playwright server exited early")
                break
        
    except Exception as e:
        print(f"Error testing Playwright: {e}")
    finally:
        proc.terminate()
        proc.wait()


async def main():
    """Run all MCP server tests."""
    print("Starting MCP server tests...\n")
    
    # Test Context7
    await test_context7()
    print()
    
    # Test Sequential Thinking
    await test_sequential_thinking()
    print()
    
    # Test Playwright
    test_playwright()
    print()
    
    print("MCP server tests completed!")


if __name__ == "__main__":
    asyncio.run(main())