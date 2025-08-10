/**
 * Musashi Component Validator
 * 개발 중 컴포넌트 사용 규칙 준수를 돕는 유틸리티
 */

export const COMPONENT_RULES = {
  // 금지된 HTML 태그들 (컴포넌트로 대체해야 함)
  FORBIDDEN_TAGS: {
    'h1': 'Typography variant="h1"',
    'h2': 'Typography variant="h2"', 
    'h3': 'Typography variant="h3"',
    'h4': 'Typography variant="h4"',
    'p': 'Typography variant="body"',
    'span': 'Typography variant="small"',
    'button': 'Button',
    'input': 'Input',
    'textarea': 'Input (with multiline)',
  },

  // 권장 컴포넌트 매핑
  RECOMMENDED_COMPONENTS: {
    text: 'Typography',
    button: 'Button', 
    form: 'Input, Button',
    card: 'Card',
    navigation: 'Navbar',
    footer: 'Footer',
    hero: 'Hero',
    carousel: 'Carousel',
    badge: 'Badge',
  },

  // 금지된 인라인 스타일 속성들
  FORBIDDEN_STYLES: [
    'color',
    'backgroundColor', 
    'fontSize',
    'fontWeight',
    'padding',
    'margin',
    'border',
    'borderRadius',
  ],
} as const;

/**
 * 컴포넌트 사용 가이드를 콘솔에 출력
 */
export const showComponentGuide = (element: string) => {
  if (process.env.NODE_ENV === 'development') {
    const recommendation = COMPONENT_RULES.FORBIDDEN_TAGS[element as keyof typeof COMPONENT_RULES.FORBIDDEN_TAGS];
    
    if (recommendation) {
      console.warn(`
🎨 Musashi Component Guide
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ 지양: <${element}>
✅ 권장: <${recommendation}>

📚 자세한 가이드: /COMPONENT_GUIDELINES.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    }
  }
};

/**
 * 개발 환경에서 스타일 사용 경고
 */
export const warnInlineStyle = (styles: Record<string, any>) => {
  if (process.env.NODE_ENV === 'development') {
    const forbiddenProps = Object.keys(styles).filter(prop => 
      COMPONENT_RULES.FORBIDDEN_STYLES.includes(prop as any)
    );

    if (forbiddenProps.length > 0) {
      console.warn(`
🎨 Musashi Style Guide
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ 인라인 스타일 사용: ${forbiddenProps.join(', ')}
✅ 권장: 
  - 색상: theme.ts 또는 Typography color prop
  - 간격: theme.spacing 또는 Tailwind 클래스
  - 타이포그래피: Typography 컴포넌트

📚 자세한 가이드: /COMPONENT_GUIDELINES.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    }
  }
};

/**
 * 컴포넌트 import 체커
 */
export const checkComponentImports = (fileContent: string) => {
  const lines = fileContent.split('\n');
  const imports = lines.filter(line => line.includes('import') && line.includes('from'));
  
  const hasComponentImport = imports.some(line => 
    line.includes('../components/common') || 
    line.includes('@/components/common')
  );

  const hasHtmlElements = [
    /<h[1-6]/, /<p>/, /<button/, /<input/, /<span/
  ].some(pattern => fileContent.match(pattern));

  if (hasHtmlElements && !hasComponentImport) {
    return {
      warning: true,
      message: 'HTML 태그를 사용하고 있지만 Musashi 컴포넌트를 import하지 않았습니다.',
      suggestion: "import { Typography, Button, Input } from '../components/common';"
    };
  }

  return { warning: false };
};

/**
 * 자동 수정 제안 생성
 */
export const generateFixSuggestions = (code: string) => {
  const suggestions: Array<{from: string, to: string, reason: string}> = [];

  // HTML 태그 → 컴포넌트 변환 제안
  Object.entries(COMPONENT_RULES.FORBIDDEN_TAGS).forEach(([tag, component]) => {
    const regex = new RegExp(`<${tag}([^>]*)>([^<]*)</${tag}>`, 'g');
    const matches = code.match(regex);
    
    if (matches) {
      matches.forEach(match => {
        suggestions.push({
          from: match,
          to: `<${component}>${match.replace(new RegExp(`</?${tag}[^>]*>`, 'g'), '')}</${component.split(' ')[0]}>`,
          reason: `HTML ${tag} 태그를 ${component} 컴포넌트로 변경`
        });
      });
    }
  });

  return suggestions;
};

/**
 * 개발 도구 - 컴포넌트 사용 현황 분석
 */
export const analyzeComponentUsage = (_projectPath: string) => {
  // 실제 구현은 빌드 도구나 별도 스크립트에서 사용
  return {
    totalFiles: 0,
    componentUsage: {},
    violations: [],
    recommendations: []
  };
};

// 개발 환경에서만 전역 헬퍼 함수 제공
if (process.env.NODE_ENV === 'development') {
  (window as any).musashiGuide = {
    showGuide: showComponentGuide,
    checkImports: checkComponentImports,
    fixSuggestions: generateFixSuggestions,
    rules: COMPONENT_RULES
  };
}