# 🎯 Musashi Component Usage Checklist

Items that must be verified before implementing new UI.

## ✅ Basic Checklist

### Text Related
- [ ] Instead of `<h1>`, `<h2>`, `<h3>`, `<h4>` → `<Typography variant="h1|h2|h3|h4">`
- [ ] Instead of `<p>` → `<Typography variant="body">`
- [ ] Instead of `<span>` → `<Typography variant="small">`
- [ ] Text color: Instead of `text-gray-500` → `<Typography color="light">`

### Button Related
- [ ] Instead of `<button>` → `<Button variant="primary|secondary|tertiary">`
- [ ] Button size: `<Button size="small|medium|large">`
- [ ] Loading state: `<Button loading>`
- [ ] Disabled: `<Button disabled>`

### Input Related
- [ ] Instead of `<input>` → `<Input>`
- [ ] Label required: `<Input label="Label name">`
- [ ] Error status: `<Input error="Error message">`
- [ ] Help text: `<Input helpText="Help text">`

### Card/Container Related
- [ ] For content grouping → `<Card>`
- [ ] Card with image → `<Card image="..." imageAlt="...">`
- [ ] When hover effect needed → `<Card hover>`
- [ ] Shadow variants: `<Card variant="default|outlined|elevated">`

### Status Display Related
- [ ] Status labels → `<Badge variant="success|warning|danger">`
- [ ] New feature indication → `<Badge variant="primary">New</Badge>`

### Image Slider Related
- [ ] Image gallery/slider → `<Carousel>`
- [ ] When auto play needed → `<Carousel autoPlay>`
- [ ] Multiple item display → `<Carousel itemsPerView={3}>`

### Page Layout Related
- [ ] Navigation bar → `<Navbar>`
- [ ] Main hero section → `<Hero>`
- [ ] Page footer → `<Footer>`

# # 🚫 피해야 할 Pattern

# # # ❌ 잘못된 사용
```tsx
// HTML Tag 직접 사용
<h1 className="text-4xl font-bold">Title</h1>
<button className="bg-blue-500 text-white px-4 py-2 rounded">버튼</button>
<input type="text" className="border rounded px-3 py-2" />

// 인라인 스타Day 사용
<div style={{color: '#ff0000', fontSize: '16px'}}>텍스트</div>

// Tailwind 색상 클래스 직접 사용
<p className="text-gray-500">회색 텍스트</p>
<div className="bg-blue-100 p-4">파란 배경</div>
```

# # # ✅ 올바른 사용
```tsx
// Musashi Component 사용
<Typography variant="h1">Title</Typography>
<Button variant="primary">버튼</Button>
<Input placeholder="Input하세요" />

// 테마 Hour스템 사용
import { theme } from '../utils/theme';
<div style={{color: theme.theme.colorTextLight}}>텍스트</div>

// Component props 사용
<Typography variant="body" color="light">회색 텍스트</Typography>
<Card variant="default">파란 배경</Card>
```

# # 📋 구현 전 질문 리스트

1. **텍스트 표Hour가 필요한가?**
   → Typography Component 사용

2. **User 액션(클릭)이 필요한가?**
   → Button Component 사용

3. **User Input이 필요한가?**
   → Input Component 사용

4. **콘텐츠를 Group화해야 하는가?**
   → Card Component 사용

5. **Status나 라벨을 표Hour해야 하는가?**
   → Badge Component 사용

6. **여러 Image나 콘텐츠를 순서대로 보여줘야 하는가?**
   → Carousel Component 사용

7. **페이지 레이아웃(헤더/푸터/히어로)이 필요한가?**
   → Navbar, Footer, Hero Component 사용

# # 🔧 Development Tool

# # # VS Code 스니펫 사용
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

# # # Development Environment 체커
```tsx
// Development 중 브라우저 콘솔에서 사용 가능
window.musashiGuide.showGuide('h1'); // Guide 표Hour
window.musashiGuide.rules; // Rules Confirm
```

## 📚 Quick Reference

### Commonly Used Patterns
```tsx
// Page title
<Typography variant="h1" className="mb-6">Page Title</Typography>

// Section title  
<Typography variant="h2" className="mb-4">Section Title</Typography>

// Description text
<Typography variant="body" color="light" className="mb-4">
  Description content
</Typography>

// Primary action button
<Button variant="primary" size="large" onClick={handleAction}>
  Primary Action
</Button>

// Basic card
<Card hover>
  <Typography variant="h4" className="mb-2">Card Title</Typography>
  <Typography variant="body" color="light">Card content</Typography>
</Card>

// Status display
<Badge variant="success">Complete</Badge>
<Badge variant="warning">In Progress</Badge>
<Badge variant="danger">Error</Badge>
```

---

💡 **Tip**: Bookmark this checklist to always reference it during development!