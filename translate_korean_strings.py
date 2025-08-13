#!/usr/bin/env python3
"""
Script to translate Korean strings to English in all files.
"""
import json
import os
import re
from typing import Dict, List, Tuple

class KoreanTranslator:
    def __init__(self):
        self.translation_map = {}
        self.files_updated = 0
        
        # Load grouped Korean strings
        with open('artifacts/korean_strings_by_file.json', 'r', encoding='utf-8') as f:
            self.korean_strings_by_file = json.load(f)
    
    def get_translation_map(self) -> Dict[str, str]:
        """Get comprehensive Korean to English translation map."""
        return {
            # Docker and Infrastructure
            "Docker Compose Override 파일": "Docker Compose Override File",
            "이 파일은 로컬 개발자별 커스터마이징을 위한 것입니다": "This file is for local developer customization",
            "docker-compose.yml과 자동으로 병합되어 실행됩니다": "Automatically merged with docker-compose.yml when executed",
            "사용법:": "Usage:",
            "이 파일을 복사하여 개인 설정에 맞게 수정": "Copy this file and modify for personal settings",
            "docker-compose up 실행시 자동으로 적용됨": "Automatically applied when running docker-compose up",
            "Git에 커밋하지 마세요 (개인 설정용)": "Do not commit to Git (for personal settings)",
            "Musashi 애플리케이션 오버라이드 설정": "Musashi application override settings",
            "개발자별 포트 설정 (예: 충돌 방지)": "Per-developer port settings (e.g., conflict prevention)",
            "필요시 다른 포트로 변경 (예: \"8081:8080\")": "Change to different port if needed (e.g., \"8081:8080\")",
            "개발자별 환경 변수 추가": "Add per-developer environment variables",
            "로컬 개발시 디버그 모드 활성화": "Enable debug mode for local development",
            "로컬 API 개발용 CORS 설정": "CORS settings for local API development",
            "개발자별 데이터베이스 설정": "Per-developer database settings",
            "사용자별 DB 분리": "Separate DB per user",
            "개발용 볼륨 마운트 (소스 코드 동기화)": "Development volume mounts (source code sync)",
            "백엔드 소스 코드 마운트 (변경 사항 실시간 반영)": "Backend source code mount (real-time change reflection)",
            "프론트엔드 빌드 파일 마운트": "Frontend build file mount",
            "로그 파일 로컬 저장": "Local log file storage",
            "개발용 리소스 제한 완화": "Relaxed resource limits for development",
            "메모리 제한 증가": "Increased memory limit",
            "CPU 제한 증가": "Increased CPU limit",
            "MongoDB 오버라이드 설정": "MongoDB override settings",
            "개발자별 포트 설정": "Per-developer port settings",
            "필요시 다른 포트로 변경": "Change to different port if needed",
            "개발용 환경 변수": "Development environment variables",
            "개발자별 데이터베이스": "Per-developer database",
            "개발용 인증 설정 (선택사항)": "Development authentication settings (optional)",
            "로컬 데이터 저장 경로 커스터마이징": "Local data storage path customization",
            "개발자별 데이터 분리": "Separate data per developer",
            "로컬 백업 디렉토리 마운트": "Local backup directory mount",
            "커스텀 MongoDB 설정 파일": "Custom MongoDB configuration file",
            "개발자별 볼륨 정의": "Per-developer volume definitions",
            "사용자별 MongoDB 데이터 볼륨": "Per-user MongoDB data volume",
            "로그 볼륨 (로컬 저장)": "Log volume (local storage)",
            "개발용 네트워크 설정": "Development network settings",
            "개발용 서브넷 커스터마이징 (충돌 방지)": "Development subnet customization (conflict prevention)",
            "기본과 다른 서브넷 사용": "Use different subnet from default",
            "선택사항: 추가 개발 도구들": "Optional: Additional development tools",
            
            # Environment and Configuration
            "애플리케이션 설정": "Application Settings",
            "JWT 토큰 암호화 키": "JWT token encryption key",
            "프로덕션에서는 반드시 변경하세요": "Must be changed in production",
            "백엔드 CORS 설정": "Backend CORS Settings",
            "허용된 오리진 (프론트엔드 URL)": "Allowed origins (frontend URL)",
            "로컬 개발용": "For local development",
            "프로덕션 배포시 실제 도메인으로 변경": "Change to actual domain for production deployment",
            "데이터베이스 설정": "Database Settings",
            "MongoDB 연결 URL": "MongoDB connection URL",
            "로컬 MongoDB 인스턴스": "Local MongoDB instance",
            "프로덕션에서는 실제 MongoDB Atlas 또는 서버 URL 사용": "Use actual MongoDB Atlas or server URL in production",
            "디버그 설정": "Debug Settings",
            "개발 모드": "Development mode",
            "로깅 설정": "Logging Settings",
            "로그 레벨": "Log level",
            "로그 파일 저장 경로": "Log file storage path",
            "파일 업로드 설정": "File Upload Settings",
            "업로드 디렉토리": "Upload directory",
            "최대 파일 크기": "Maximum file size",
            "허용된 파일 확장자": "Allowed file extensions",
            "보안 설정": "Security Settings",
            "세션 만료 시간": "Session expiration time",
            "비밀번호 최소 길이": "Minimum password length",
            "API 요청 제한": "API rate limiting",
            
            # Script Messages
            "Musashi 단일 컨테이너 실행 스크립트": "Musashi Single Container Execution Script",
            "이미 실행 중인 컨테이너 중지": "Stopping already running container",
            "이미지가 없습니다. 먼저 빌드하세요": "Image not found. Please build first",
            "컨테이너 실행 중": "Running container",
            "Musashi가 시작되었습니다": "Musashi has started",
            "프론트엔드": "Frontend",
            "백엔드 API": "Backend API",
            "컨테이너 중지": "Stop container",
            "컨테이너 재시작": "Restart container",
            "로그 확인": "Check logs",
            
            # Component Guidelines
            "컴포넌트 사용 가이드라인": "Component Usage Guidelines",
            "Musashi 프로젝트의 컴포넌트 시스템 완전 가이드": "Complete Guide to Musashi Project Component System",
            "핵심 원칙": "Core Principles",
            "일관성": "Consistency",
            "모든 UI 요소는 동일한 컴포넌트를 사용하여 구현": "All UI elements implemented using same components",
            "재사용성": "Reusability",
            "컴포넌트는 여러 컨텍스트에서 재사용 가능하도록 설계": "Components designed to be reusable across multiple contexts",
            "타입 안전성": "Type Safety",
            "모든 컴포넌트는 TypeScript로 완전한 타입 정의": "All components fully typed with TypeScript",
            "테마 일관성": "Theme Consistency",
            "색상과 스타일은 중앙 테마 시스템에서 관리": "Colors and styles managed by central theme system",
            "접근성": "Accessibility",
            "모든 컴포넌트는 웹 접근성 표준 준수": "All components comply with web accessibility standards",
            
            # UI Components
            "기본 사용법": "Basic Usage",
            "변형": "Variants",
            "속성": "Properties",
            "예시": "Examples",
            "필수": "Required",
            "선택": "Optional",
            "텍스트 내용": "Text content",
            "헤딩 레벨": "Heading level",
            "텍스트 색상": "Text color",
            "추가 CSS 클래스": "Additional CSS classes",
            "클릭 이벤트 핸들러": "Click event handler",
            "비활성화 상태": "Disabled state",
            "로딩 상태": "Loading state",
            "버튼 크기": "Button size",
            "아이콘": "Icon",
            "입력 레이블": "Input label",
            "입력값": "Input value",
            "플레이스홀더": "Placeholder",
            "오류 메시지": "Error message",
            "도움말 텍스트": "Helper text",
            "카드 내용": "Card content",
            "호버 효과": "Hover effect",
            "그림자": "Shadow",
            "상태 텍스트": "Status text",
            "배지 크기": "Badge size",
            "슬라이드 항목": "Slide items",
            "자동 재생": "Auto play",
            "네비게이션 버튼": "Navigation buttons",
            "인디케이터": "Indicators",
            
            # Workflow Editor
            "워크플로우 에디터": "Workflow Editor",
            "노드 사이드바": "Node Sidebar",
            "입력 항목": "Input Item",
            "출력 뷰어": "Output Viewer",
            "키보드 단축키": "Keyboard Shortcuts",
            "워크플로우 생성": "Create Workflow",
            "노드 추가": "Add Node",
            "연결": "Connect",
            "삭제": "Delete",
            "복사": "Copy",
            "붙여넣기": "Paste",
            "실행 취소": "Undo",
            "다시 실행": "Redo",
            "저장": "Save",
            "불러오기": "Load",
            "내보내기": "Export",
            "가져오기": "Import",
            
            # Validation and Testing
            "유효성 검사": "Validation",
            "테스트": "Testing",
            "컴포넌트 검증기": "Component Validator",
            "규칙": "Rules",
            "경고": "Warning",
            "오류": "Error",
            "성공": "Success",
            "실패": "Failed",
            "통과": "Passed",
            "건너뜀": "Skipped",
            
            # Documentation
            "문서": "Documentation",
            "가이드": "Guide",
            "예제": "Example",
            "참조": "Reference",
            "설명": "Description",
            "주의사항": "Notes",
            "중요": "Important",
            "경고": "Warning",
            "팁": "Tip",
            "정보": "Info",
            
            # Development and Build
            "개발": "Development",
            "빌드": "Build",
            "배포": "Deployment",
            "최적화": "Optimization",
            "성능": "Performance",
            "보안": "Security",
            "테스트": "Testing",
            "디버그": "Debug",
            "로그": "Log",
            "모니터링": "Monitoring",
            
            # Git and Version Control
            "Git 무시 파일": "Git ignore file",
            "Node.js 의존성": "Node.js dependencies",
            "빌드 출력물": "Build outputs",
            "환경 설정 파일": "Environment configuration files",
            "로그 파일": "Log files",
            "임시 파일": "Temporary files",
            "IDE 설정": "IDE settings",
            "OS 생성 파일": "OS generated files",
            "캐시": "Cache",
            "커버리지 리포트": "Coverage reports",
            "테스트 결과": "Test results",
            
            # Error Messages and Status
            "연결 실패": "Connection failed",
            "인증 실패": "Authentication failed",
            "권한 없음": "No permission",
            "파일을 찾을 수 없음": "File not found",
            "서버 오류": "Server error",
            "잘못된 요청": "Invalid request",
            "시간 초과": "Timeout",
            "네트워크 오류": "Network error",
            "데이터베이스 오류": "Database error",
            
            # Common Actions
            "생성": "Create",
            "수정": "Modify", 
            "업데이트": "Update",
            "제거": "Remove",
            "삭제": "Delete",
            "추가": "Add",
            "편집": "Edit",
            "보기": "View",
            "닫기": "Close",
            "열기": "Open",
            "시작": "Start",
            "중지": "Stop",
            "재시작": "Restart",
            "새로고침": "Refresh",
            "검색": "Search",
            "필터": "Filter",
            "정렬": "Sort",
            "그룹": "Group",
            "선택": "Select",
            "취소": "Cancel",
            "확인": "Confirm",
            "적용": "Apply",
            "재설정": "Reset",
        }
    
    def translate_text(self, text: str) -> str:
        """Translate Korean text to English."""
        translation_map = self.get_translation_map()
        
        # Try exact match first
        if text in translation_map:
            translated = translation_map[text]
            self.translation_map[text] = translated
            return translated
        
        # Try partial matches and context-aware translations
        translated_text = text
        
        # Handle comments with Korean text
        if text.startswith('#'):
            comment_content = text[1:].strip()
            if comment_content in translation_map:
                translated = f"# {translation_map[comment_content]}"
                self.translation_map[text] = translated
                return translated
        
        # Handle mixed Korean-English text
        for korean, english in translation_map.items():
            if korean in text:
                translated_text = translated_text.replace(korean, english)
        
        if translated_text != text:
            self.translation_map[text] = translated_text
            return translated_text
        
        # Fallback: manual translations for common patterns
        patterns = [
            (r'(\d+)\.\s*(.*)', lambda m: f"{m.group(1)}. {self.translate_simple(m.group(2))}"),
            (r'-\s*"([^"]+)"\s*#\s*(.*)', lambda m: f'- "{m.group(1)}" # {self.translate_simple(m.group(2))}'),
            (r'#\s*(.*)', lambda m: f"# {self.translate_simple(m.group(1))}"),
        ]
        
        for pattern, replacement in patterns:
            match = re.match(pattern, text)
            if match:
                try:
                    translated = replacement(match)
                    self.translation_map[text] = translated
                    return translated
                except:
                    pass
        
        # If no translation found, mark for manual review
        self.translation_map[text] = text  # Keep original for now
        return text
    
    def translate_simple(self, text: str) -> str:
        """Simple translation for common Korean phrases."""
        simple_map = {
            "사용법": "Usage",
            "예시": "Example", 
            "설정": "Settings",
            "환경 변수": "Environment Variables",
            "데이터베이스": "Database",
            "서버": "Server",
            "클라이언트": "Client",
            "개발": "Development",
            "프로덕션": "Production",
            "테스트": "Test",
            "빌드": "Build",
            "배포": "Deploy",
        }
        
        for korean, english in simple_map.items():
            if korean in text:
                text = text.replace(korean, english)
        
        return text
    
    def process_file(self, file_path: str, korean_strings: List[Dict]) -> bool:
        """Process a single file and replace Korean strings with English."""
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Sort by line number in descending order to avoid line number shifts
            korean_strings.sort(key=lambda x: x['line'], reverse=True)
            
            lines = content.split('\n')
            
            for string_info in korean_strings:
                line_num = string_info['line'] - 1  # Convert to 0-based index
                korean_text = string_info['text']
                
                if line_num < len(lines) and korean_text in lines[line_num]:
                    # Translate the text
                    english_text = self.translate_text(korean_text)
                    
                    # Replace in the line
                    lines[line_num] = lines[line_num].replace(korean_text, english_text)
            
            # Write back the file if changed
            new_content = '\n'.join(lines)
            if new_content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                return True
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            return False
        
        return False
    
    def process_all_files(self):
        """Process all files with Korean strings."""
        print("Starting translation process...")
        
        for file_path, korean_strings in self.korean_strings_by_file.items():
            print(f"Processing {file_path} ({len(korean_strings)} strings)...")
            
            # Skip certain files that might not exist or shouldn't be modified
            skip_files = [
                'backend/logs/',
                'frontend/coverage/',
                '.changes/',
            ]
            
            if any(skip in file_path for skip in skip_files):
                print(f"  Skipping {file_path} (log/coverage/change file)")
                continue
            
            if not os.path.exists(file_path):
                print(f"  Skipping {file_path} (file not found)")
                continue
            
            if self.process_file(file_path, korean_strings):
                self.files_updated += 1
                print(f"  ✅ Updated {file_path}")
            else:
                print(f"  ⏭️  No changes needed for {file_path}")
        
        print(f"\nTranslation complete! Updated {self.files_updated} files.")
    
    def save_translation_map(self):
        """Save the translation mapping to a file."""
        with open('artifacts/translation-map.json', 'w', encoding='utf-8') as f:
            json.dump(self.translation_map, f, ensure_ascii=False, indent=2)
        
        print(f"Translation map saved with {len(self.translation_map)} entries.")

def main():
    translator = KoreanTranslator()
    translator.process_all_files()
    translator.save_translation_map()

if __name__ == '__main__':
    main()