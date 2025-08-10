# Musashi Component Guidelines

프로젝트의 일관성과 유지보수성을 위한 컴포넌트 사용 가이드라인입니다.

## 🎯 핵심 원칙

### 1. **기존 컴포넌트 우선 사용 (Component First)**
- 새로운 UI가 필요할 때는 **반드시** 기존 컴포넌트를 먼저 검토
- 커스텀 스타일링 대신 기존 컴포넌트의 props 활용
- HTML 태그나 인라인 스타일 대신 디자인 시스템 컴포넌트 사용

### 2. **디자인 시스템 준수**
- 모든 색상, 간격, 타이포그래피는 `theme.ts`에서 정의된 값 사용
- 일관된 사용자 경험을 위해 컴포넌트 변형(variant) 활용
- 브랜드 아이덴티티 유지

### 3. **확장성 고려**
- 기존 컴포넌트로 해결되지 않는 경우에만 새 컴포넌트 생성
- 새 컴포넌트는 재사용 가능하도록 설계
- props를 통한 유연한 커스터마이징 지원

## 📚 사용 가능한 컴포넌트

### 기본 컴포넌트 (`/src/components/common/`)

```typescript
import { 
  Button, Typography, Card, Input, Badge, 
  Carousel, Navbar, Footer, Hero 
} from '../components/common';
```

#### **Typography 컴포넌트**
```tsx
// ✅ 올바른 사용
<Typography variant="h1">제목</Typography>
<Typography variant="body" color="light">설명 텍스트</Typography>

// ❌ 잘못된 사용
<h1 style={{fontSize: '32px'}}>제목</h1>
<p className="text-gray-500">설명 텍스트</p>
```

#### **Button 컴포넌트**
```tsx
// ✅ 올바른 사용
<Button variant="primary" size="large">주요 액션</Button>
<Button variant="secondary" disabled>비활성 버튼</Button>

// ❌ 잘못된 사용
<button className="bg-blue-500 text-white px-4 py-2">버튼</button>
```

#### **Card 컴포넌트**
```tsx
// ✅ 올바른 사용
<Card variant="elevated" hover>
  <Typography variant="h4">카드 제목</Typography>
  <Typography variant="body" color="light">내용</Typography>
</Card>

// ✅ 이미지가 있는 카드
<Card 
  image="/path/to/image.jpg" 
  imageAlt="설명"
  hover
>
  <Typography variant="h4">이미지 카드</Typography>
</Card>

// ❌ 잘못된 사용
<div className="bg-white shadow rounded p-4">내용</div>
```

#### **Input 컴포넌트**
```tsx
// ✅ 올바른 사용
<Input 
  label="이메일" 
  placeholder="이메일을 입력하세요"
  error={emailError}
  variant="outlined"
/>

// ❌ 잘못된 사용
<input type="text" className="border rounded px-3 py-2" />
```

#### **Badge 컴포넌트**
```tsx
// ✅ 올바른 사용
<Badge variant="success">완료</Badge>
<Badge variant="warning" size="small">경고</Badge>

// ❌ 잘못된 사용
<span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">완료</span>
```

#### **Carousel 컴포넌트**
```tsx
// ✅ 올바른 사용
<Carousel 
  items={carouselItems}
  autoPlay
  itemsPerView={3}
  showDots
/>

// ❌ 잘못된 사용 (직접 슬라이더 구현)
<div className="flex overflow-x-auto">...</div>
```

### 레이아웃 컴포넌트

#### **Navbar 컴포넌트**
```tsx
// ✅ 올바른 사용
<Navbar variant="transparent" fixed />
<Navbar showSearch={false} showAuth={false} />

// ❌ 잘못된 사용
<header className="bg-white border-b">
  <nav>...</nav>
</header>
```

#### **Footer 컴포넌트**
```tsx
// ✅ 올바른 사용
<Footer variant="detailed" showNewsletter />
<Footer variant="minimal" />

// ❌ 잘못된 사용
<footer className="bg-gray-900 text-white">...</footer>
```

#### **Hero 컴포넌트**
```tsx
// ✅ 올바른 사용
<Hero 
  variant="split"
  title="메인 제목"
  description="설명 텍스트"
  primaryAction={{
    text: "시작하기",
    onClick: handleStart
  }}
  features={["기능1", "기능2", "기능3"]}
/>

// ❌ 잘못된 사용
<div className="bg-gradient-to-r from-blue-500 to-purple-600 py-20">
  <h1 className="text-4xl font-bold text-white">제목</h1>
</div>
```

## 🎨 테마 시스템 사용

### **색상 사용**
```tsx
// ✅ 올바른 사용
import { theme } from '../utils/theme';

const styles = {
  backgroundColor: theme.theme.colorPrimary,
  color: theme.palette.gray[500],
  borderColor: theme.theme.colorBorder
};

// ❌ 잘못된 사용
const styles = {
  backgroundColor: '#0075de',
  color: '#6b7280',
  borderColor: '#e5e7eb'
};
```

### **간격 사용**
```tsx
// ✅ 올바른 사용
<div style={{ padding: theme.spacing[24], margin: theme.spacing.blockM }}>

// ❌ 잘못된 사용
<div style={{ padding: '24px', margin: '1.5rem' }}>
```

### **타이포그래피 사용**
```tsx
// ✅ 올바른 사용
<Typography 
  variant="h2" 
  fontFamily="serif" 
  weight="semibold"
>

// ❌ 잘못된 사용
<h2 style={{ 
  fontSize: '32px', 
  fontFamily: 'serif', 
  fontWeight: 600 
}}>
```

## 🔧 새 컴포넌트 생성 가이드

### **언제 새 컴포넌트를 만들 것인가?**

1. **기존 컴포넌트 조합으로 해결 불가능**
2. **재사용 빈도가 3회 이상 예상**
3. **복잡한 로직이나 상태 관리 필요**
4. **접근성(a11y) 요구사항이 특수한 경우**

### **새 컴포넌트 생성 절차**

1. **요구사항 분석**
   ```
   - 어떤 기존 컴포넌트와 유사한가?
   - 어떤 props가 필요한가?
   - 어떤 변형(variant)이 필요한가?
   ```

2. **컴포넌트 설계**
   ```tsx
   interface NewComponentProps {
     variant?: 'default' | 'custom';
     size?: 'small' | 'medium' | 'large';
     disabled?: boolean;
     className?: string;
     children: React.ReactNode;
   }
   ```

3. **구현**
   - `/src/components/common/NewComponent.tsx` 생성
   - 테마 시스템 사용
   - TypeScript 타입 정의
   - 접근성 고려

4. **등록**
   - `/src/components/common/index.ts`에 export 추가
   - Components 페이지에 데모 추가

5. **문서화**
   - 이 문서에 사용법 추가
   - Props 인터페이스 설명

## 📋 체크리스트

### **컴포넌트 사용 전 체크리스트**
- [ ] 기존 컴포넌트로 구현 가능한지 확인
- [ ] Typography 컴포넌트로 텍스트 처리
- [ ] Button 컴포넌트로 버튼 처리  
- [ ] Card 컴포넌트로 콘텐츠 그룹핑
- [ ] 테마 시스템의 색상/간격 사용
- [ ] 인라인 스타일 대신 컴포넌트 props 활용

### **새 컴포넌트 생성 시 체크리스트**
- [ ] 재사용성 고려한 props 설계
- [ ] 테마 시스템 통합
- [ ] TypeScript 타입 정의
- [ ] 접근성(a11y) 고려
- [ ] 반응형 디자인 지원
- [ ] index.ts에 export 추가
- [ ] Components 페이지에 데모 추가

## 🚫 금지사항

1. **직접 스타일링 금지**
   ```tsx
   // ❌ 금지
   <div style={{color: '#red', fontSize: '16px'}}>
   <div className="text-red-500 text-base">
   ```

2. **HTML 태그 직접 사용 금지**
   ```tsx
   // ❌ 금지
   <h1>제목</h1>
   <button>버튼</button>
   <input type="text" />
   
   // ✅ 권장
   <Typography variant="h1">제목</Typography>
   <Button>버튼</Button>
   <Input />
   ```

3. **하드코딩된 값 사용 금지**
   ```tsx
   // ❌ 금지
   padding: '24px'
   color: '#0075de'
   fontSize: '16px'
   
   // ✅ 권장
   padding: theme.spacing[24]
   color: theme.theme.colorPrimary
   fontSize: theme.typography.fontSizes[200]
   ```

## 📖 예제: 올바른 페이지 구성

```tsx
import React from 'react';
import { 
  Navbar, Hero, Card, Typography, Button, Badge, Footer 
} from '../components/common';

const ExamplePage: React.FC = () => {
  return (
    <div>
      <Navbar variant="default" />
      
      <Hero
        variant="centered"
        title="환영합니다"
        description="Musashi와 함께 워크플로우를 디자인하세요"
        primaryAction={{
          text: "시작하기",
          onClick: () => console.log("시작!")
        }}
      />
      
      <main className="max-w-6xl mx-auto p-8">
        <Typography variant="h2" className="mb-8">
          주요 기능
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover>
            <Badge variant="primary" className="mb-4">새로운</Badge>
            <Typography variant="h4" className="mb-2">
              시각적 디자인
            </Typography>
            <Typography variant="body" color="light" className="mb-4">
              드래그 앤 드롭으로 쉽게 워크플로우를 만드세요
            </Typography>
            <Button variant="secondary" size="small">
              자세히 보기
            </Button>
          </Card>
          
          {/* 더 많은 카드들... */}
        </div>
      </main>
      
      <Footer variant="default" />
    </div>
  );
};

export default ExamplePage;
```

## 🔄 지속적인 개선

이 가이드라인은 프로젝트가 성장함에 따라 지속적으로 업데이트됩니다:

1. **새 컴포넌트 추가 시** → 이 문서에 사용법 추가
2. **컴포넌트 개선 시** → 변경된 API 문서화
3. **베스트 프랙티스 발견 시** → 예제 코드 업데이트

---

**마지막 업데이트**: 2024-08-03  
**관리자**: Musashi Development Team