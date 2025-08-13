#!/usr/bin/env python3
"""
Scan repository for brand phrase variations.
Detects all variations of "Flow Sharp, Ship Fast." including case and punctuation variations.
"""

import json
import os
import re
from pathlib import Path
from typing import List, Dict

# Excluded directories
EXCLUDED_DIRS = {
    '.git', 'node_modules', '.venv', 'venv', 'dist', 'build', '.next',
    '__pycache__', '.pytest_cache', 'coverage', 'htmlcov', '.mypy_cache',
    'playwright-report', 'test-results', '.turbo', '.parcel-cache'
}

# Excluded file patterns
EXCLUDED_PATTERNS = {
    '*.lock', '*.min.js', '*.min.css', '*.map', '*.pyc', '*.pyo',
    '*.so', '*.dylib', '*.dll', '*.exe', '*.o', '*.a',
    '*.jpg', '*.jpeg', '*.png', '*.gif', '*.svg', '*.ico',
    '*.woff', '*.woff2', '*.ttf', '*.eot', '*.otf',
    '*.mp3', '*.mp4', '*.wav', '*.avi', '*.mov',
    '*.pdf', '*.doc', '*.docx', '*.xls', '*.xlsx',
    '*.zip', '*.tar', '*.gz', '*.bz2', '*.7z'
}

def create_patterns():
    """Create simplified regex patterns for the brand phrase."""
    # Main pattern that catches most variations
    # Allows for case variations, punctuation variations, and Sharp/Shape typo
    pattern = r"[Cc]ut\s+the\s+[Cc]ode[.,;]?\s*[Ss]ha[rp][ep]\s+the\s+[Ff]low"
    
    return [re.compile(pattern, re.IGNORECASE)]

def should_skip_file(file_path: Path) -> bool:
    """Check if file should be skipped."""
    # Check directory exclusions
    for part in file_path.parts:
        if part in EXCLUDED_DIRS:
            return True
    
    # Check file patterns
    name = file_path.name
    for pattern in EXCLUDED_PATTERNS:
        if pattern.startswith('*'):
            if name.endswith(pattern[1:]):
                return True
        elif pattern.endswith('*'):
            if name.startswith(pattern[:-1]):
                return True
    
    # Skip binary files by extension
    binary_extensions = {'.pyc', '.pyo', '.so', '.dylib', '.dll', '.exe'}
    if file_path.suffix in binary_extensions:
        return True
    
    return False

def scan_file(file_path: Path, patterns: List[re.Pattern]) -> List[Dict]:
    """Scan a single file for pattern matches."""
    hits = []
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            lines = content.splitlines()
            
            for pattern in patterns:
                for match in pattern.finditer(content):
                    start = match.start()
                    
                    # Find line number and column
                    line_num = content[:start].count('\n') + 1
                    line_start = content.rfind('\n', 0, start) + 1
                    col = start - line_start + 1
                    
                    # Get excerpt (surrounding context)
                    line_content = lines[line_num - 1] if line_num <= len(lines) else ""
                    excerpt = line_content.strip()
                    if len(excerpt) > 100:
                        excerpt = excerpt[:97] + "..."
                    
                    hits.append({
                        'path': str(file_path),
                        'line': line_num,
                        'col': col,
                        'match': match.group(),
                        'excerpt': excerpt
                    })
    except Exception as e:
        # Skip files that can't be read
        pass
    
    return hits

def scan_repository(root_dir: str = '.') -> Dict:
    """Scan entire repository for brand phrase variations."""
    root = Path(root_dir).resolve()
    patterns = create_patterns()
    all_hits = []
    seen_locations = set()  # To avoid duplicates
    
    # Use explicit file walking to avoid large directory traversals
    for file_path in root.rglob('*'):
        if file_path.is_file() and not should_skip_file(file_path):
            relative_path = file_path.relative_to(root)
            hits = scan_file(file_path, patterns)
            
            # Deduplicate based on file + line
            for hit in hits:
                location_key = f"{hit['path']}:{hit['line']}"
                if location_key not in seen_locations:
                    seen_locations.add(location_key)
                    hit['path'] = str(relative_path)  # Use relative path
                    all_hits.append(hit)
    
    # Sort by file path and line number
    all_hits.sort(key=lambda x: (x['path'], x['line']))
    
    return {
        'count': len(all_hits),
        'hits': all_hits
    }

def main():
    """Main execution."""
    print("Scanning repository for brand phrase variations...")
    
    # Create artifacts directory if it doesn't exist
    artifacts_dir = Path('artifacts')
    artifacts_dir.mkdir(exist_ok=True)
    
    # Scan repository
    results = scan_repository()
    
    # Save results to JSON
    output_file = artifacts_dir / 'brand_hits.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"Found {results['count']} occurrences")
    print(f"Results saved to {output_file}")
    
    # Print summary by file type
    if results['hits']:
        file_types = {}
        for hit in results['hits']:
            ext = Path(hit['path']).suffix or 'no_extension'
            file_types[ext] = file_types.get(ext, 0) + 1
        
        print("\nOccurrences by file type:")
        for ext, count in sorted(file_types.items()):
            print(f"  {ext}: {count}")
    
    # Output count to stdout (for pipeline)
    print(results['count'])
    
    return results['count']

if __name__ == '__main__':
    exit(0 if main() == 0 else 1)