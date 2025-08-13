#!/usr/bin/env python3
"""
Enhanced Korean to English translation script with comprehensive coverage.
"""
import json
import os
import re
from collections import defaultdict

class EnhancedKoreanTranslator:
    def __init__(self):
        self.translation_map = {}
        self.files_updated = 0
        
        # Load grouped Korean strings
        with open('artifacts/korean_strings_by_file.json', 'r', encoding='utf-8') as f:
            self.korean_strings_by_file = json.load(f)
    
    def get_comprehensive_translation_map(self) -> dict:
        """Get comprehensive Korean to English translation map."""
        return {
            # File/Application descriptions
            "애플리케이션 포트": "Application port",
            "실행 환경": "Runtime environment", 
            "Debug 모드": "Debug mode",
            "Log level": "Log level",
            "JWT 토큰용 비밀키": "JWT token secret key",
            "MongoDB connection URL": "MongoDB connection URL",
            "프로덕션에서는 반드시 false": "Must be false in production",
            "실제 환경에서는 안전한 값으로 변경": "Change to secure value in production",
            "Required - 실제 환경에서는 안전한 값으로 변경": "Required - Change to secure value in production",
            ".env.example을 .env로 Copy한 후 실제 값으로 Modify하세요": "Copy .env.example to .env and modify with actual values",
            
            # Korean words and phrases commonly used
            "설정": "Settings",
            "환경": "Environment", 
            "변수": "Variables",
            "데이터베이스": "Database",
            "연결": "Connection",
            "포트": "Port",
            "기본": "Default",
            "필수": "Required",
            "선택사항": "Optional",
            "사용법": "Usage",
            "예시": "Example",
            "참고": "Reference",
            "주의사항": "Notes",
            "중요": "Important",
            "경고": "Warning",
            "정보": "Info",
            "안전": "Security",
            "변경": "Change",
            "수정": "Modify",
            "복사": "Copy",
            "생성": "Create",
            "삭제": "Delete",
            "업데이트": "Update",
            "개발": "Development",
            "개발자": "Developer",
            "개발팀": "Development Team",
            "프로덕션": "Production",
            "테스트": "Test",
            "테스팅": "Testing",
            "빌드": "Build",
            "배포": "Deployment",
            "실행": "Execute",
            "시작": "Start",
            "중지": "Stop",
            "재시작": "Restart",
            "컨테이너": "Container",
            "서비스": "Service",
            "네트워크": "Network",
            "볼륨": "Volume",
            "이미지": "Image",
            "로그": "Log",
            "파일": "File",
            "폴더": "Folder",
            "디렉토리": "Directory",
            "경로": "Path",
            "저장": "Save",
            "백업": "Backup",
            "캐시": "Cache",
            "캐싱": "Caching",
            "모니터링": "Monitoring",
            "메트릭": "Metric",
            "자동화": "Automation",
            "자동": "Auto",
            "수동": "Manual",
            "관리": "Management",
            "관리자": "Administrator",
            "사용자": "User",
            "클라이언트": "Client",
            "서버": "Server",
            "API": "API",
            "웹": "Web",
            "프론트엔드": "Frontend",
            "백엔드": "Backend",
            "데이터": "Data",
            "구성": "Configuration",
            "옵션": "Option",
            "기능": "Feature",
            "도구": "Tool",
            "스크립트": "Script",
            "명령어": "Command",
            "실시간": "Real-time",
            "동기화": "Sync", 
            "분리": "Separate",
            "통합": "Integration",
            "인증": "Authentication",
            "권한": "Permission",
            "접근": "Access",
            "보안": "Security",
            "암호화": "Encryption",
            "토큰": "Token",
            "세션": "Session",
            "로그인": "Login",
            "로그아웃": "Logout",
            "가입": "Register",
            "등록": "Registration",
            "검증": "Validation",
            "확인": "Verify",
            "승인": "Approval",
            "허용": "Allow",
            "거부": "Deny",
            "차단": "Block",
            "제한": "Limit",
            "최대": "Maximum",
            "최소": "Minimum",
            "크기": "Size",
            "용량": "Capacity",
            "메모리": "Memory",
            "CPU": "CPU",
            "성능": "Performance",
            "속도": "Speed",
            "지연": "Delay",
            "시간": "Time",
            "타임아웃": "Timeout",
            "대기": "Wait",
            "처리": "Process",
            "응답": "Response",
            "요청": "Request",
            "전송": "Send",
            "수신": "Receive",
            "업로드": "Upload",
            "다운로드": "Download",
            "가져오기": "Import",
            "내보내기": "Export",
            "출력": "Output",
            "입력": "Input",
            "결과": "Result",
            "상태": "Status",
            "상황": "Situation",
            "조건": "Condition",
            "규칙": "Rule",
            "정책": "Policy",
            "표준": "Standard",
            "규격": "Specification",
            "문서": "Document",
            "문서화": "Documentation",
            "가이드": "Guide",
            "매뉴얼": "Manual",
            "지침": "Guideline",
            "설명": "Description",
            "소개": "Introduction",
            "개요": "Overview",
            "요약": "Summary",
            "분석": "Analysis",
            "검토": "Review",
            "평가": "Evaluation",
            "측정": "Measurement",
            "계산": "Calculation",
            "비교": "Comparison",
            "선택": "Selection",
            "옵션": "Option",
            "항목": "Item",
            "목록": "List",
            "배열": "Array",
            "집합": "Set",
            "그룹": "Group",
            "카테고리": "Category",
            "분류": "Classification",
            "타입": "Type",
            "종류": "Kind",
            "형식": "Format",
            "패턴": "Pattern",
            "템플릿": "Template",
            "모델": "Model",
            "스키마": "Schema",
            "구조": "Structure",
            "계층": "Hierarchy",
            "단계": "Step",
            "레벨": "Level",
            "등급": "Grade",
            "버전": "Version",
            "릴리스": "Release",
            "업그레이드": "Upgrade",
            "다운그레이드": "Downgrade",
            "마이그레이션": "Migration",
            "변환": "Conversion",
            "번역": "Translation",
            "언어": "Language",
            "지역": "Region",
            "국가": "Country",
            "시간대": "Timezone",
            "날짜": "Date",
            "시간": "Time",
            "년": "Year",
            "월": "Month",
            "일": "Day",
            "시": "Hour",
            "분": "Minute",
            "초": "Second",
            "밀리초": "Millisecond",
            "주기": "Period",
            "간격": "Interval",
            "빈도": "Frequency",
            "횟수": "Count",
            "번호": "Number",
            "코드": "Code",
            "아이디": "ID",
            "이름": "Name",
            "제목": "Title",
            "레이블": "Label",
            "태그": "Tag",
            "키": "Key",
            "값": "Value",
            "쌍": "Pair",
            "맵": "Map",
            "매핑": "Mapping",
            "연결": "Connection",
            "링크": "Link",
            "참조": "Reference",
            "관계": "Relationship",
            "의존성": "Dependency",
            "종속성": "Dependency",
            "요구사항": "Requirement",
            "조건": "Condition",
            "제약": "Constraint",
            "한계": "Limitation",
            "경계": "Boundary",
            "범위": "Range",
            "영역": "Area",
            "구역": "Zone",
            "섹션": "Section",
            "부분": "Part",
            "요소": "Element",
            "컴포넌트": "Component",
            "모듈": "Module",
            "패키지": "Package",
            "라이브러리": "Library",
            "프레임워크": "Framework",
            "플랫폼": "Platform",
            "시스템": "System",
            "아키텍처": "Architecture",
            "인프라": "Infrastructure",
            "리소스": "Resource",
            "자원": "Resource",
            "할당": "Allocation",
            "배분": "Distribution",
            "관리": "Management",
            "제어": "Control",
            "조작": "Operation",
            "작업": "Task",
            "업무": "Work",
            "프로젝트": "Project",
            "계획": "Plan",
            "일정": "Schedule",
            "목표": "Goal",
            "목적": "Purpose",
            "이유": "Reason",
            "원인": "Cause",
            "효과": "Effect",
            "영향": "Impact",
            "결과": "Result",
            "성과": "Performance",
            "효율": "Efficiency",
            "생산성": "Productivity",
            "품질": "Quality",
            "신뢰성": "Reliability",
            "안정성": "Stability",
            "가용성": "Availability",
            "확장성": "Scalability",
            "유연성": "Flexibility",
            "호환성": "Compatibility",
            "이식성": "Portability",
            "유지보수": "Maintenance",
            "지원": "Support",
            "도움": "Help",
            "도움말": "Help",
            "FAQ": "FAQ",
            "문제": "Problem",
            "이슈": "Issue",
            "버그": "Bug",
            "오류": "Error",
            "예외": "Exception",
            "실패": "Failure",
            "성공": "Success",
            "완료": "Complete",
            "진행": "Progress",
            "상태": "Status",
            "확인": "Check",
            "검사": "Inspection",
            "점검": "Check",
            "감사": "Audit",
            "모니터링": "Monitoring",
            "추적": "Tracking",
            "로그": "Log",
            "기록": "Record",
            "이력": "History",
            "변경": "Change",
            "수정": "Modify",
            "편집": "Edit",
            "갱신": "Update",
            "새로고침": "Refresh",
            "재로드": "Reload",
            "리로드": "Reload",
            
            # Git specific
            "무시": "Ignore",
            "커밋": "Commit",
            "푸시": "Push",
            "풀": "Pull",
            "브랜치": "Branch",
            "병합": "Merge",
            "충돌": "Conflict",
            "해결": "Resolve",
            
            # Development specific terms
            "의존성": "Dependencies",
            "종속성": "Dependencies",
            "빌드 출력물": "Build outputs",
            "환경 설정": "Environment configuration",
            "임시 파일": "Temporary files",
            "IDE 설정": "IDE settings",
            "OS 생성 파일": "OS generated files",
            "커버리지 리포트": "Coverage reports",
            "테스트 결과": "Test results",
            
            # Specific phrases that need context
            "더 많은 스크립트가 Add될 예정입니다": "More scripts will be added",
            "유용한 자동화 스크립트 모음": "Collection of useful automation scripts",
            "의존성 Update PR들을 자동으로 승인하고 머지하는 스크립트입니다": "Script to automatically approve and merge dependency update PRs",
            "Dependabot 또는 Renovate bot이 Create한 PR 자동 감지": "Automatically detect PRs created by Dependabot or Renovate bot",
            "각 PR을 자동으로 승인(approve)": "Automatically approve each PR",
            "머지 가능한 PR을 자동으로 머지": "Automatically merge mergeable PRs",
            "브랜치 자동 Delete": "Automatically delete branches",
            "컬러풀한 진행 상황 표시": "Colorful progress display",
            "상세한 결과 요약": "Detailed result summary",
            "GitHub CLI (`gh`) 설치 및 인증": "Install and authenticate GitHub CLI (`gh`)",
            "Save소에 대한 쓰기 권한": "Write permission to repository",
            "정기적으로 실행하려면 GitHub Actions workflow를 Add하세요": "To run regularly, add a GitHub Actions workflow",
            "수동 실행도 가능": "Manual execution also available",
            "CI 환경을 로컬에서 재현하는 스크립트입니다": "Script to reproduce CI environment locally",
            "Python 3.12 환경 검증": "Python 3.12 environment verification",
            "Node.js 20 환경 검증": "Node.js 20 environment verification",
            "MongoDB 컨테이너 자동 Start": "Automatically start MongoDB container",
            "Backend/Frontend Testing 실행": "Execute Backend/Frontend testing",
            "Docker Build Testing": "Docker Build Testing",
            "CI와 동일한 옵션으로 실행": "Execute with same options as CI",
            "상세한 Log Save": "Detailed log saving",
            
            # MongoDB specific
            "MongoDB 웹 관리 도구": "MongoDB web administration tool",
            "아래 서비스들을 주석 해제하여 사용할 수 있습니다": "You can uncomment the services below to use them",
            
            # Common mixed phrases
            "생성일": "Created Date",
            "담당": "Responsible",
            "Create한": "Created",
            "Update": "Update",
            "Add": "Add", 
            "Delete": "Delete",
            "Start": "Start",
            "Save": "Save",
            "Testing": "Testing",
            "Copy": "Copy",
            "Modify": "Modify",
            "Development": "Development",
            "Deployment": "Deployment",
            
        }
    
    def translate_text_enhanced(self, text: str) -> str:
        """Enhanced translation with better pattern matching."""
        if not text or not any(ord(char) > 127 for char in text if ord(char) >= 0x1100 and ord(char) <= 0x11FF or ord(char) >= 0x3130 and ord(char) <= 0x318F or ord(char) >= 0xAC00 and ord(char) <= 0xD7AF):
            return text  # No Korean characters found
        
        translation_map = self.get_comprehensive_translation_map()
        translated_text = text
        
        # Direct mapping first
        if text in translation_map:
            self.translation_map[text] = translation_map[text]
            return translation_map[text]
        
        # Word by word translation for mixed content
        for korean, english in translation_map.items():
            if korean in translated_text:
                translated_text = translated_text.replace(korean, english)
        
        # Handle specific patterns
        patterns = [
            # Comments
            (r'^#\s*(.+)$', lambda m: f"# {self.translate_text_enhanced(m.group(1))}"),
            # Numbered lists
            (r'^(\d+)\.\s*(.+)$', lambda m: f"{m.group(1)}. {self.translate_text_enhanced(m.group(2))}"),
            # Docker port mapping with comments
            (r'^-\s*"([^"]+)"\s*#\s*(.+)$', lambda m: f'- "{m.group(1)}" # {self.translate_text_enhanced(m.group(2))}'),
            # Environment variables with comments
            (r'^-\s*([A-Z_]+=.+)\s*#\s*(.+)$', lambda m: f"- {m.group(1)} # {self.translate_text_enhanced(m.group(2))}"),
            # YAML keys with Korean values
            (r'^(\s*)([a-zA-Z_]+):\s*(.+)$', lambda m: f"{m.group(1)}{m.group(2)}: {self.translate_text_enhanced(m.group(3))}"),
        ]
        
        for pattern, replacement in patterns:
            match = re.match(pattern, translated_text)
            if match:
                try:
                    new_translated = replacement(match)
                    if new_translated != translated_text:
                        self.translation_map[text] = new_translated
                        return new_translated
                except Exception as e:
                    pass  # Continue with other patterns
        
        # Record the translation if it changed
        if translated_text != text:
            self.translation_map[text] = translated_text
            return translated_text
        
        # If no translation was found, keep original
        self.translation_map[text] = text
        return text
    
    def process_file_enhanced(self, file_path: str, korean_strings: list) -> bool:
        """Enhanced file processing with better Korean detection and replacement."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            lines = content.split('\n')
            
            # Sort by line number in descending order
            korean_strings.sort(key=lambda x: x['line'], reverse=True)
            
            for string_info in korean_strings:
                line_num = string_info['line'] - 1
                korean_text = string_info['text']
                
                if line_num < len(lines):
                    original_line = lines[line_num]
                    
                    # Find the Korean text in the line and translate it
                    if korean_text in original_line:
                        english_text = self.translate_text_enhanced(korean_text)
                        lines[line_num] = original_line.replace(korean_text, english_text)
                    else:
                        # Try to find and translate any Korean text in the line
                        translated_line = self.translate_text_enhanced(original_line)
                        if translated_line != original_line:
                            lines[line_num] = translated_line
            
            new_content = '\n'.join(lines)
            if new_content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                return True
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            return False
        
        return False
    
    def process_all_files_enhanced(self):
        """Process all files with enhanced translation."""
        print("Starting enhanced translation process...")
        
        for file_path, korean_strings in self.korean_strings_by_file.items():
            print(f"Processing {file_path} ({len(korean_strings)} strings)...")
            
            # Skip certain files
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
            
            if self.process_file_enhanced(file_path, korean_strings):
                self.files_updated += 1
                print(f"  ✅ Updated {file_path}")
            else:
                print(f"  ⏭️  No changes needed for {file_path}")
        
        print(f"\nEnhanced translation complete! Updated {self.files_updated} files.")
    
    def save_translation_map(self):
        """Save the complete translation mapping."""
        with open('artifacts/enhanced-translation-map.json', 'w', encoding='utf-8') as f:
            json.dump(self.translation_map, f, ensure_ascii=False, indent=2)
        
        print(f"Enhanced translation map saved with {len(self.translation_map)} entries.")

def main():
    translator = EnhancedKoreanTranslator()
    translator.process_all_files_enhanced()
    translator.save_translation_map()

if __name__ == '__main__':
    main()