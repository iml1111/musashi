#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Korean pattern
KOREAN_PATTERN = re.compile(r'[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]+')

# Translation mappings
translations = {
    # Common UI terms
    "워크플로우": "workflow",
    "노드": "node",
    "엣지": "edge",
    "저장": "save",
    "내보내기": "export",
    "가져오기": "import",
    "삭제": "delete",
    "실행": "execute",
    "취소": "cancel",
    "확인": "confirm",
    "설정": "settings",
    "도움말": "help",
    
    # Messages
    "워크플로우 Save": "Save workflow",
    "워크플로우 Export": "Export workflow",
    "매 1Minute마다 Auto Save": "Auto-save every minute",
    "Select된 노드 Delete": "Delete selected node",
    "Redo (대체)": "Redo (alternative)",
    "Ctrl Key는 Windows/Linux에서, Cmd Key는 macOS에서 사용됩니다": "Use Ctrl key on Windows/Linux and Cmd key on macOS",
    
    # Docker and deployment
    "도커 컴포즈 오버라이드 파일": "Docker Compose Override file",
    "이 파일은 로컬 개발자별 커스터마이징을 위한 것입니다": "This file is for local developer customization",
    "사용법": "Usage",
    "개발자별 포트 설정": "Developer-specific port configuration",
    "로컬 개발시 디버그 모드 활성화": "Enable debug mode for local development",
    "개발용 볼륨 마운트": "Development volume mount",
    "백엔드 소스 코드 마운트": "Backend source code mount",
    "프론트엔드 빌드 파일 마운트": "Frontend build file mount",
    
    # Script messages
    "시작": "Starting",
    "완료": "Complete",
    "실패": "Failed",
    "성공": "Success",
    "오류": "Error",
    "경고": "Warning",
    "정보": "Info",
    
    # File/folder descriptions
    "스크립트": "scripts",
    "문서": "documentation",
    "테스트": "tests",
    "설정 파일": "configuration file",
    "예제": "example",
    
    # Development terms
    "개발": "development",
    "배포": "deployment",
    "빌드": "build",
    "컴파일": "compile",
    "디버그": "debug",
    "로그": "log",
    "캐시": "cache",
    "데이터베이스": "database",
}

def translate_text(text: str) -> str:
    """Translate Korean text to English."""
    result = text
    
    # Apply direct translations first
    for korean, english in translations.items():
        result = result.replace(korean, english)
    
    # Check if there are still Korean characters
    if KOREAN_PATTERN.search(result):
        # For remaining Korean text, we'll need to handle it case by case
        # This is a simplified version - in production you'd use a translation API
        pass
    
    return result

def process_file(filepath: Path) -> Tuple[bool, List[str]]:
    """Process a single file and translate Korean content."""
    try:
        content = filepath.read_text(encoding='utf-8')
        original = content
        
        # Check if file has Korean text
        if not KOREAN_PATTERN.search(content):
            return False, []
        
        # Get file extension
        ext = filepath.suffix.lower()
        
        changes = []
        
        if ext in ['.md', '.txt']:
            # For documentation files, translate everything
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if KOREAN_PATTERN.search(line):
                    new_line = translate_text(line)
                    if new_line != line:
                        lines[i] = new_line
                        changes.append(f"Line {i+1}: {line} -> {new_line}")
            content = '\n'.join(lines)
            
        elif ext in ['.tsx', '.ts', '.js', '.jsx']:
            # For code files, only translate strings and comments
            # Translate single-line comments
            content = re.sub(r'//(.*)$', lambda m: '//' + translate_text(m.group(1)), content, flags=re.MULTILINE)
            
            # Translate multi-line comments
            content = re.sub(r'/\*(.*?)\*/', lambda m: '/*' + translate_text(m.group(1)) + '*/', content, flags=re.DOTALL)
            
            # Translate string literals (both single and double quotes)
            content = re.sub(r"'([^']*)'", lambda m: "'" + translate_text(m.group(1)) + "'", content)
            content = re.sub(r'"([^"]*)"', lambda m: '"' + translate_text(m.group(1)) + '"', content)
            
        elif ext in ['.yml', '.yaml', '.env']:
            # For config files, only translate comments
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if '#' in line:
                    comment_idx = line.index('#')
                    comment = line[comment_idx:]
                    if KOREAN_PATTERN.search(comment):
                        new_comment = translate_text(comment)
                        lines[i] = line[:comment_idx] + new_comment
                        changes.append(f"Line {i+1}: {comment} -> {new_comment}")
            content = '\n'.join(lines)
            
        elif ext in ['.sh']:
            # For shell scripts, translate comments and echo messages
            lines = content.split('\n')
            for i, line in enumerate(lines):
                # Translate comments
                if '#' in line:
                    comment_idx = line.index('#')
                    comment = line[comment_idx:]
                    if KOREAN_PATTERN.search(comment):
                        new_comment = translate_text(comment)
                        lines[i] = line[:comment_idx] + new_comment
                        changes.append(f"Line {i+1}: {comment} -> {new_comment}")
                # Translate echo messages
                elif 'echo' in line:
                    if KOREAN_PATTERN.search(line):
                        new_line = translate_text(line)
                        lines[i] = new_line
                        changes.append(f"Line {i+1}: {line} -> {new_line}")
            content = '\n'.join(lines)
        
        # Write back if changed
        if content != original:
            filepath.write_text(content, encoding='utf-8')
            return True, changes
        
        return False, []
        
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False, []

def main():
    # Load Korean strings
    with open('artifacts/korean_strings.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Group by file
    files_to_process = {}
    for row in data['rows']:
        path = row['path']
        if path not in files_to_process:
            files_to_process[path] = []
        files_to_process[path].append(row)
    
    # Process each file
    translation_map = {}
    files_updated = 0
    
    for filepath_str in files_to_process:
        filepath = Path(filepath_str)
        if filepath.exists():
            updated, changes = process_file(filepath)
            if updated:
                files_updated += 1
                print(f"✓ Updated: {filepath}")
                for change in changes[:3]:  # Show first 3 changes
                    print(f"  {change}")
                if len(changes) > 3:
                    print(f"  ... and {len(changes) - 3} more changes")
    
    # Save translation map
    os.makedirs('artifacts', exist_ok=True)
    with open('artifacts/translation-map.json', 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Translation complete: {files_updated} files updated")
    
    # Create summary
    with open('plan/diff-summary.md', 'w', encoding='utf-8') as f:
        f.write(f"# Translation Summary\n\n")
        f.write(f"## Statistics\n")
        f.write(f"- Total Korean strings found: {len(data['rows'])}\n")
        f.write(f"- Files updated: {files_updated}\n")
        f.write(f"- Translation mappings used: {len(translations)}\n\n")
        f.write(f"## Files Updated\n")
        for filepath_str in files_to_process:
            if Path(filepath_str).exists():
                f.write(f"- {filepath_str}\n")

if __name__ == '__main__':
    main()