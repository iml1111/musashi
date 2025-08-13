#!/usr/bin/env python3
"""
Replace brand phrase with new version, preserving case and format.
Old: "Flow Sharp, Ship Fast."
New: "Flow sharp, Ship fast."
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

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
    
    return False

def detect_case_style(text: str) -> str:
    """Detect the case style of the input text."""
    if text.isupper():
        return 'UPPER'
    elif text[0].isupper() and not text[1:].isupper():
        return 'Title'
    else:
        return 'lower'

def apply_case_style(text: str, style: str) -> str:
    """Apply the detected case style to the new text."""
    if style == 'UPPER':
        return text.upper()
    elif style == 'Title':
        # Capitalize first letter of each word
        return ' '.join(word.capitalize() for word in text.split())
    else:
        return text.lower()

def create_replacement_patterns():
    """Create all replacement patterns."""
    patterns = []
    
    # Main pattern variations
    # Pattern 1: "Flow Sharp, Ship Fast."
    patterns.append((
        re.compile(r'Cut the code\.\s*Shape the flow\.', re.IGNORECASE),
        'Flow sharp, Ship fast.'
    ))
    
    # Pattern 2: "Flow Sharp, Ship Fast"
    patterns.append((
        re.compile(r'Cut the code,\s*Shape the flow', re.IGNORECASE),
        'Flow sharp, Ship fast'
    ))
    
    # Pattern 3: "Flow Sharp, Ship Fast"
    patterns.append((
        re.compile(r'Cut the code\s*[-–—]\s*Shape the flow', re.IGNORECASE),
        'Flow sharp, Ship fast'
    ))
    
    # Pattern 4: "Flow Sharp, Ship Fast" (no punctuation)
    patterns.append((
        re.compile(r'Cut the code\s+Shape the flow', re.IGNORECASE),
        'Flow sharp, Ship fast'
    ))
    
    # Pattern 5: With "Sharp" typo
    patterns.append((
        re.compile(r'Cut the code\.\s*Sharp the flow\.', re.IGNORECASE),
        'Flow sharp, Ship fast.'
    ))
    
    return patterns

def replace_in_file(file_path: Path, patterns: List[Tuple[re.Pattern, str]], dry_run: bool = False) -> List[Dict]:
    """Replace patterns in a single file."""
    changes = []
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            original_content = f.read()
        
        modified_content = original_content
        
        for pattern, replacement in patterns:
            matches = list(pattern.finditer(modified_content))
            
            # Process matches in reverse order to maintain positions
            for match in reversed(matches):
                original_text = match.group()
                
                # Detect case style from original
                first_word = original_text.split()[0] if original_text.split() else original_text
                case_style = detect_case_style(first_word)
                
                # Apply case style to replacement
                new_text = apply_case_style(replacement, case_style)
                
                # Preserve ending punctuation if needed
                if original_text.rstrip()[-1:] in '.!?' and new_text[-1:] not in '.!?':
                    new_text += original_text.rstrip()[-1]
                
                # Record the change
                start = match.start()
                line_num = original_content[:start].count('\n') + 1
                
                changes.append({
                    'file': str(file_path),
                    'line': line_num,
                    'original': original_text,
                    'replacement': new_text
                })
                
                # Apply the replacement
                modified_content = modified_content[:match.start()] + new_text + modified_content[match.end():]
        
        # Write changes if not dry run and there are changes
        if changes and not dry_run:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
    
    return changes

def main():
    """Main execution."""
    dry_run = '--dry-run' in sys.argv
    
    print(f"{'DRY RUN: ' if dry_run else ''}Replacing brand phrase...")
    print(f"Old: 'Flow Sharp, Ship Fast.'")
    print(f"New: 'Flow sharp, Ship fast.'")
    print()
    
    # Create artifacts directory
    artifacts_dir = Path('artifacts')
    artifacts_dir.mkdir(exist_ok=True)
    
    # Get all patterns
    patterns = create_replacement_patterns()
    
    # Process all files
    root = Path('.').resolve()
    all_changes = []
    
    for file_path in root.rglob('*'):
        if file_path.is_file() and not should_skip_file(file_path):
            relative_path = file_path.relative_to(root)
            changes = replace_in_file(file_path, patterns, dry_run)
            
            if changes:
                for change in changes:
                    change['file'] = str(relative_path)
                    all_changes.append(change)
    
    # Save mapping
    mapping_file = artifacts_dir / 'brand_map.json'
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump({
            'dry_run': dry_run,
            'total_changes': len(all_changes),
            'changes': all_changes
        }, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print(f"{'Would replace' if dry_run else 'Replaced'} {len(all_changes)} occurrences")
    
    if all_changes:
        # Group by file
        files_affected = {}
        for change in all_changes:
            if change['file'] not in files_affected:
                files_affected[change['file']] = []
            files_affected[change['file']].append(change)
        
        print(f"\nFiles affected: {len(files_affected)}")
        for file_path, file_changes in sorted(files_affected.items()):
            print(f"  {file_path}: {len(file_changes)} change(s)")
            if dry_run and len(file_changes) <= 3:
                for change in file_changes:
                    print(f"    Line {change['line']}: '{change['original']}' → '{change['replacement']}'")
    
    print(f"\nMapping saved to {mapping_file}")
    
    return 0 if not all_changes else (1 if dry_run else 0)

if __name__ == '__main__':
    exit(main())