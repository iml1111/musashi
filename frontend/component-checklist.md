# 🎯 Musashi 컴포넌트 사용 체크리스트

새로운 UI를 구현하기 전 반드시 확인해야 할 항목들입니다.

## ✅ 기본 체크리스트

### 텍스트 관련
- [ ] `<h1>`, `<h2>`, `<h3>`, `<h4>` 대신 → `<Typography variant="h1|h2|h3|h4">`
- [ ] `<p>` 대신 → `<Typography variant="body">`
- [ ] `<span>` 대신 → `<Typography variant="small">`
- [ ] 텍스트 색상: `text-gray-500` 대신 → `<Typography color="light">`

### 버튼 관련
- [ ] `<button>` 대신 → `<Button variant="primary|secondary|tertiary">`
- [ ] 버튼 크기: `<Button size="small|medium|large">`
- [ ] 로딩 상태: `<Button loading>`
- [ ] 비활성화: `<Button disabled>`

### 입력 관련
- [ ] `<input>` 대신 → `<Input>`
- [ ] 라벨 필요: `<Input label="라벨명">`
- [ ] 에러 상태: `<Input error="에러 메시지">`
- [ ] 도움말: `<Input helpText="도움말">`

### 카드/컨테이너 관련
- [ ] 콘텐츠 그룹핑 시 → `<Card>`
- [ ] 이미지가 있는 카드 → `<Card image="..." imageAlt="...">`
- [ ] 호버 효과 필요 시 → `<Card hover>`
- [ ] 그림자 변형: `<Card variant="default|outlined|elevated">`

### 상태 표시 관련
- [ ] 상태 라벨 → `<Badge variant="success|warning|danger">`
- [ ] 새로운 기능 표시 → `<Badge variant="primary">New</Badge>`

### 이미지 슬라이더 관련
- [ ] 이미지 갤러리/슬라이더 → `<Carousel>`
- [ ] 자동 재생 필요 시 → `<Carousel autoPlay>`
- [ ] 다중 아이템 표시 → `<Carousel itemsPerView={3}>`

### 페이지 레이아웃 관련
- [ ] 네비게이션 바 → `<Navbar>`
- [ ] 메인 히어로 섹션 → `<Hero>`
- [ ] 페이지 하단 → `<Footer>`

## 🚫 피해야 할 패턴

### ❌ 잘못된 사용
```tsx
// HTML 태그 직접 사용
<h1 className="text-4xl font-bold">제목</h1>
<button className="bg-blue-500 text-white px-4 py-2 rounded">버튼</button>
<input type="text" className="border rounded px-3 py-2" />

// 인라인 스타일 사용
<div style={{color: '#ff0000', fontSize: '16px'}}>텍스트</div>

// Tailwind 색상 클래스 직접 사용
<p className="text-gray-500">회색 텍스트</p>
<div className="bg-blue-100 p-4">파란 배경</div>
```

### ✅ 올바른 사용
```tsx
// Musashi 컴포넌트 사용
<Typography variant="h1">제목</Typography>
<Button variant="primary">버튼</Button>
<Input placeholder="입력하세요" />

// 테마 시스템 사용
import { theme } from '../utils/theme';
<div style={{color: theme.theme.colorTextLight}}>텍스트</div>

// 컴포넌트 props 사용
<Typography variant="body" color="light">회색 텍스트</Typography>
<Card variant="default">파란 배경</Card>
```

## 📋 구현 전 질문 리스트

1. **텍스트 표시가 필요한가?**
   → Typography 컴포넌트 사용

2. **사용자 액션(클릭)이 필요한가?**
   → Button 컴포넌트 사용

3. **사용자 입력이 필요한가?**
   → Input 컴포넌트 사용

4. **콘텐츠를 그룹화해야 하는가?**
   → Card 컴포넌트 사용

5. **상태나 라벨을 표시해야 하는가?**
   → Badge 컴포넌트 사용

6. **여러 이미지나 콘텐츠를 순서대로 보여줘야 하는가?**
   → Carousel 컴포넌트 사용

7. **페이지 레이아웃(헤더/푸터/히어로)이 필요한가?**
   → Navbar, Footer, Hero 컴포넌트 사용

## 🔧 개발 도구

### VS Code 스니펫 사용
```json
// .vscode/musashi.code-snippets
{
  "Musashi Typography": {
    "prefix": "mtypo",
    "body": [
      "<Typography variant=\"$1\">$2</Typography>"
    ]
  },
  "Musashi Button": {
    "prefix": "mbtn", 
    "body": [
      "<Button variant=\"$1\" onClick={$2}>$3</Button>"
    ]
  },
  "Musashi Card": {
    "prefix": "mcard",
    "body": [
      "<Card variant=\"$1\">",
      "  <Typography variant=\"h4\">$2</Typography>",
      "  <Typography variant=\"body\" color=\"light\">$3</Typography>",
      "</Card>"
    ]
  }
}
```

### 개발 환경 체커
```tsx
// 개발 중 브라우저 콘솔에서 사용 가능
window.musashiGuide.showGuide('h1'); // 가이드 표시
window.musashiGuide.rules; // 규칙 확인
```

## 📚 빠른 참조

### 자주 사용하는 패턴
```tsx
// 페이지 제목
<Typography variant="h1" className="mb-6">페이지 제목</Typography>

// 섹션 제목  
<Typography variant="h2" className="mb-4">섹션 제목</Typography>

// 설명 텍스트
<Typography variant="body" color="light" className="mb-4">
  설명 내용
</Typography>

// 주요 액션 버튼
<Button variant="primary" size="large" onClick={handleAction}>
  주요 액션
</Button>

// 기본 카드
<Card hover>
  <Typography variant="h4" className="mb-2">카드 제목</Typography>
  <Typography variant="body" color="light">카드 내용</Typography>
</Card>

// 상태 표시
<Badge variant="success">완료</Badge>
<Badge variant="warning">진행중</Badge>
<Badge variant="danger">오류</Badge>
```

---

💡 **팁**: 이 체크리스트를 즐겨찾기에 추가하여 개발 시 항상 참고하세요!