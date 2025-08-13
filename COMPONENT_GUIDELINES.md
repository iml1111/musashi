# Musashi Component Guidelines

Component Usage Guidelines for project consistency and maintainability.

## 🎯 Core Principles

### 1. **Component First (Prioritize Existing Components)**
- When new UI is needed, **always** review existing components first
- Utilize existing component props instead of custom styling
- Use design system components instead of HTML tags or inline styles

### 2. **Design System Compliance**
- Use values defined in `theme.ts` for all colors, spacing, and typography
- Utilize component variants for consistent user experience
- Maintain brand identity

### 3. **Scalability Considerations**
- Create new components only when existing components cannot resolve the issue
- Design new components for reusability
- Support flexible customization through props

## 📚 Available Components

## Base Components (`/src/components/common/`)

```typescript
import { 
  Button, Typography, Card, Input, Badge, 
  Carousel, Navbar, Footer, Hero 
} from '../components/common';
```

### **Typography Component**
```tsx
// ✅ Correct Usage
<Typography variant="h1">Title</Typography>
<Typography variant="body" color="light">Description text</Typography>

// ❌ Incorrect Usage
<h1 style={{fontSize: '32px'}}>Title</h1>
<p className="text-gray-500">Description text</p>
```

### **Button Component**
```tsx
// ✅ Correct Usage
<Button variant="primary" size="large">Primary Action</Button>
<Button variant="secondary" disabled>Disabled Button</Button>

// ❌ Incorrect Usage
<button className="bg-blue-500 text-white px-4 py-2">Button</button>
```

### **Card Component**
```tsx
// ✅ Correct Usage
<Card variant="elevated" hover>
  <Typography variant="h4">Card Title</Typography>
  <Typography variant="body" color="light">Content</Typography>
</Card>

// ✅ Card with Image
<Card 
  image="/path/to/image.jpg" 
  imageAlt="Description"
  hover
>
  <Typography variant="h4">Image Card</Typography>
</Card>

// ❌ Incorrect Usage
<div className="bg-white shadow rounded p-4">Content</div>
```

### **Input Component**
```tsx
// ✅ Correct Usage
<Input 
  label="Email" 
  placeholder="Enter your email"
  error={emailError}
  variant="outlined"
/>

// ❌ Incorrect Usage
<input type="text" className="border rounded px-3 py-2" />
```

### **Badge Component**
```tsx
// ✅ Correct Usage
<Badge variant="success">Complete</Badge>
<Badge variant="warning" size="small">Warning</Badge>

// ❌ Incorrect Usage
<span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Complete</span>
```

### **Carousel Component**
```tsx
// ✅ Correct Usage
<Carousel 
  items={carouselItems}
  autoPlay
  itemsPerView={3}
  showDots
/>

// ❌ Incorrect Usage (direct slider implementation)
<div className="flex overflow-x-auto">...</div>
```

### Layout Components

### **Navbar Component**
```tsx
// ✅ Correct Usage
<Navbar variant="transparent" fixed />
<Navbar showSearch={false} showAuth={false} />

// ❌ Incorrect Usage
<header className="bg-white border-b">
  <nav>...</nav>
</header>
```

### **Footer Component**
```tsx
// ✅ Correct Usage
<Footer variant="detailed" showNewsletter />
<Footer variant="minimal" />

// ❌ Incorrect Usage
<footer className="bg-gray-900 text-white">...</footer>
```

### **Hero Component**
```tsx
// ✅ Correct Usage
<Hero 
  variant="split"
  title="Main Title"
  description="Description text"
  primaryAction={{
    text: "Get Started",
    onClick: handleStart
  }}
  features={["Feature1", "Feature2", "Feature3"]}
/>

// ❌ Incorrect Usage
<div className="bg-gradient-to-r from-blue-500 to-purple-600 py-20">
  <h1 className="text-4xl font-bold text-white">Title</h1>
</div>
```

## 🎨 Theme System Usage

### **Color Usage**
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

### **Spacing Usage**
```tsx
// ✅ 올바른 사용
<div style={{ padding: theme.spacing[24], margin: theme.spacing.blockM }}>

// ❌ 잘못된 사용
<div style={{ padding: '24px', margin: '1.5rem' }}>
```

### **Typography Usage**
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

## 🔧 New Component Creation Guide

### **When to Create New Components?**

1. **기존 Component 조합으로 Resolve 불가능**
2. **재사용 Frequency가 3회 이상 예상**
3. **복잡한 로직이나 Status Management 필요**
4. **Accessibility(a11y) Requirement이 특수한 경우**

### **New Component Creation Process**

1. **Requirement Analysis**
   ```
   - 어떤 기존 Component와 유사한가?
   - 어떤 props가 필요한가?
   - 어떤 Variants(variant)이 필요한가?
   ```

2. **Component 설계**
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
   - `/src/components/common/NewComponent.tsx` Create
   - 테마 Hour스템 사용
   - TypeScript Type 정의
   - Accessibility 고려

4. **Registration**
   - `/src/components/common/index.ts`에 export Add
   - Components 페이지에 데모 Add

5. **Documentation화**
   - 이 Documentation에 Usage Add
   - Props 인터페이스 Description

## 📋 Checklist

### **Pre-Component Usage Checklist**
- [ ] 기존 Component로 구현 가능한지 Confirm
- [ ] Typography Component로 텍스트 Process
- [ ] Button Component로 버튼 Process  
- [ ] Card Component로 콘텐츠 Group핑
- [ ] 테마 Hour스템의 색상/Interval 사용
- [ ] 인라인 스타Day 대신 Component props 활용

### **New Component Creation Checklist**
- [ ] Reusability 고려한 props 설계
- [ ] 테마 Hour스템 Integration
- [ ] TypeScript Type 정의
- [ ] Accessibility(a11y) 고려
- [ ] 반응형 디자인 Support
- [ ] index.ts에 export Add
- [ ] Components 페이지에 데모 Add

## 🚫 Prohibited Practices

1. **직접 스타Day링 금지**
   ```tsx
   // ❌ 금지
   <div style={{color: '#red', fontSize: '16px'}}>
   <div className="text-red-500 text-base">
   ```

2. **HTML Tag 직접 사용 금지**
   ```tsx
   // ❌ 금지
   <h1>Title</h1>
   <button>버튼</button>
   <input type="text" />
   
   // ✅ 권장
   <Typography variant="h1">Title</Typography>
   <Button>버튼</Button>
   <Input />
   ```

3. **하드코딩된 Value 사용 금지**
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

## 📖 Example: Proper Page Configuration

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
        title="Welcome"
        description="Design workflows with Musashi"
        primaryAction={{
          text: "Get Started",
          onClick: () => console.log("Start!")
        }}
      />
      
      <main className="max-w-6xl mx-auto p-8">
        <Typography variant="h2" className="mb-8">
          Key Features
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover>
            <Badge variant="primary" className="mb-4">New</Badge>
            <Typography variant="h4" className="mb-2">
              Visual Design
            </Typography>
            <Typography variant="body" color="light" className="mb-4">
              Create workflows easily with drag and drop
            </Typography>
            <Button variant="secondary" size="small">
              Learn More
            </Button>
          </Card>
          
          {/* More cards... */}
        </div>
      </main>
      
      <Footer variant="default" />
    </div>
  );
};

export default ExamplePage;
```

## 🔄 Continuous Improvement

These guidelines are continuously updated as the project grows:

1. **When adding new components** → Add usage to this documentation
2. **When improving components** → Document changed APIs
3. **When discovering best practices** → Update example code

---

**Last Updated**: 2024-08-03  
**Maintained by**: Musashi Development Team