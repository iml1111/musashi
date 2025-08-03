#!/usr/bin/env python3
"""
Test script for SuperClaude Framework integration with Musashi.
"""

import json
import os
import sys
from pathlib import Path

def test_superclaude_installation():
    """Test SuperClaude Framework installation."""
    print("Testing SuperClaude Framework installation...")
    
    try:
        import SuperClaude
        print("✓ SuperClaude module imported successfully")
        return True
    except ImportError as e:
        print(f"✗ Failed to import SuperClaude: {e}")
        return False

def test_global_configuration():
    """Test global SuperClaude configuration."""
    print("\nTesting global configuration...")
    
    claude_dir = Path.home() / ".claude"
    settings_file = claude_dir / "settings.json"
    superclaude_dir = claude_dir / "superclaude"
    
    # Check .claude directory
    if not claude_dir.exists():
        print("✗ ~/.claude directory not found")
        return False
    print("✓ ~/.claude directory exists")
    
    # Check settings.json
    if not settings_file.exists():
        print("✗ ~/.claude/settings.json not found")
        return False
    
    try:
        with open(settings_file) as f:
            settings = json.load(f)
        
        if "superclaude" in settings:
            print("✓ SuperClaude configuration found in settings.json")
            print(f"  - Version: {settings['superclaude'].get('version', 'unknown')}")
            print(f"  - Enabled: {settings['superclaude'].get('enabled', False)}")
        else:
            print("✗ SuperClaude configuration not found in settings.json")
            return False
    except Exception as e:
        print(f"✗ Error reading settings.json: {e}")
        return False
    
    # Check SuperClaude directory structure
    if not superclaude_dir.exists():
        print("✗ ~/.claude/superclaude directory not found")
        return False
    print("✓ SuperClaude directory structure exists")
    
    required_files = [
        "superclaude_config.json",
        "commands/core_commands.md",
        "behaviors/developer_persona.md",
        "profiles/musashi_profile.md"
    ]
    
    for file_path in required_files:
        full_path = superclaude_dir / file_path
        if full_path.exists():
            print(f"✓ {file_path} exists")
        else:
            print(f"✗ {file_path} missing")
    
    return True

def test_musashi_integration():
    """Test Musashi project-specific integration."""
    print("\nTesting Musashi project integration...")
    
    project_dir = Path(__file__).parent.parent
    claude_dir = project_dir / ".claude"
    
    if not claude_dir.exists():
        print("✗ Project .claude directory not found")
        return False
    print("✓ Project .claude directory exists")
    
    required_files = [
        "musashi_commands.md",
        "musashi_settings.json"
    ]
    
    for file_name in required_files:
        file_path = claude_dir / file_name
        if file_path.exists():
            print(f"✓ {file_name} exists")
            
            # Validate JSON files
            if file_name.endswith('.json'):
                try:
                    with open(file_path) as f:
                        json.load(f)
                    print(f"  - {file_name} is valid JSON")
                except Exception as e:
                    print(f"  ✗ {file_name} JSON validation failed: {e}")
        else:
            print(f"✗ {file_name} missing")
    
    return True

def test_mcp_integration():
    """Test MCP server integration configuration."""
    print("\nTesting MCP integration configuration...")
    
    project_dir = Path(__file__).parent.parent
    mcp_dir = project_dir / "mcp"
    
    if not mcp_dir.exists():
        print("✗ MCP directory not found")
        return False
    print("✓ MCP directory exists")
    
    # Check MCP servers
    servers = ["playwright", "context7", "sequential-thinking"]
    for server in servers:
        server_dir = mcp_dir / "servers" / server
        if server_dir.exists():
            print(f"✓ {server} MCP server directory exists")
        else:
            print(f"✗ {server} MCP server directory missing")
    
    # Check MCP configuration
    mcp_config = mcp_dir / "config" / "mcp.json"
    if mcp_config.exists():
        print("✓ MCP configuration file exists")
        try:
            with open(mcp_config) as f:
                config = json.load(f)
            print(f"  - Configured servers: {list(config.get('mcpServers', {}).keys())}")
        except Exception as e:
            print(f"  ✗ MCP config validation failed: {e}")
    else:
        print("✗ MCP configuration file missing")
    
    return True

def test_commands():
    """Test SuperClaude command availability."""
    print("\nTesting command availability...")
    
    # Test module access
    try:
        import SuperClaude
        print("✓ SuperClaude commands should be available")
        
        # Check for command module
        if hasattr(SuperClaude, '__file__'):
            print(f"  - SuperClaude location: {SuperClaude.__file__}")
        
    except Exception as e:
        print(f"✗ Command testing failed: {e}")
        return False
    
    return True

def main():
    """Run all tests."""
    print("SuperClaude Framework Integration Test")
    print("=" * 50)
    
    tests = [
        test_superclaude_installation,
        test_global_configuration,
        test_musashi_integration,
        test_mcp_integration,
        test_commands
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"✗ Test {test.__name__} failed with error: {e}")
            results.append(False)
    
    print("\n" + "=" * 50)
    print("Test Summary:")
    print(f"Passed: {sum(results)}/{len(results)}")
    
    if all(results):
        print("✓ All tests passed! SuperClaude is ready to use.")
        return 0
    else:
        print("✗ Some tests failed. Check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())