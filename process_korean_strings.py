#!/usr/bin/env python3
"""
Script to process Korean strings JSON and group them by file for translation.
"""
import json
import os
from collections import defaultdict

def load_korean_strings():
    """Load Korean strings from the JSON file."""
    with open('artifacts/korean_strings.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def group_by_file(rows):
    """Group Korean strings by file path."""
    files_dict = defaultdict(list)
    
    for row in rows:
        file_path = row['path']
        # Convert to relative path from repository root
        if file_path.startswith('/Users/imiml/Documents/GitHub/musashi/'):
            file_path = file_path.replace('/Users/imiml/Documents/GitHub/musashi/', '')
        
        files_dict[file_path].append({
            'line': row['line'],
            'text': row['text']
        })
    
    return dict(files_dict)

def main():
    print("Loading Korean strings...")
    data = load_korean_strings()
    print(f"Total Korean strings found: {data['count']}")
    
    print("Grouping by file...")
    files_dict = group_by_file(data['rows'])
    
    print(f"Files containing Korean text: {len(files_dict)}")
    
    # Save grouped data for easier processing
    with open('artifacts/korean_strings_by_file.json', 'w', encoding='utf-8') as f:
        json.dump(files_dict, f, ensure_ascii=False, indent=2)
    
    # Print summary
    print("\nFiles with Korean strings:")
    for file_path, strings in files_dict.items():
        print(f"  {file_path}: {len(strings)} strings")

if __name__ == '__main__':
    main()