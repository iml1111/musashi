/**
 * Musashi Component Validator
 * Development 중 Component 사용 Rules 준수를 돕는 유틸리티
 */

export const COMPONENT_RULES = {
  // 금지된 HTML Tag들 (Component로 대체해야 함)
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

  // 권장 Component Mapping
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

  // 금지된 인라인 스타Day Properties들
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
 * Component 사용 Guide를 콘솔에 Output
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

📚 자세한 Guide: /COMPONENT_GUIDELINES.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    }
  }
};

/**
 * Development Environment에서 스타Day 사용 Warning
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
❌ 인라인 스타Day 사용: ${forbiddenProps.join(', ')}
✅ 권장: 
  - 색상: theme.ts 또는 Typography color prop
  - Interval: theme.spacing 또는 Tailwind 클래스
  - 타이포그래피: Typography Component

📚 자세한 Guide: /COMPONENT_GUIDELINES.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    }
  }
};

/**
 * Component import 체커
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
      message: 'HTML Tag를 사용하고 있지만 Musashi Component를 import하지 않았습니다.',
      suggestion: "import { Typography, Button, Input } from '../components/common';"
    };
  }

  return { warning: false };
};

/**
 * Auto Modify 제안 Create
 */
export const generateFixSuggestions = (code: string) => {
  const suggestions: Array<{from: string, to: string, reason: string}> = [];

  // HTML Tag → Component Conversion 제안
  Object.entries(COMPONENT_RULES.FORBIDDEN_TAGS).forEach(([tag, component]) => {
    const regex = new RegExp(`<${tag}([^>]*)>([^<]*)</${tag}>`, 'g');
    const matches = code.match(regex);
    
    if (matches) {
      matches.forEach(match => {
        suggestions.push({
          from: match,
          to: `<${component}>${match.replace(new RegExp(`</?${tag}[^>]*>`, 'g'), '')}</${component.split(' ')[0]}>`,
          reason: `HTML ${tag} Tag를 ${component} Component로 Change`
        });
      });
    }
  });

  return suggestions;
};

/**
 * Development Tool - Component 사용 현황 Analysis
 */
export const analyzeComponentUsage = (_projectPath: string) => {
  // 실제 구현은 Build Tool나 별도 Script에서 사용
  return {
    totalFiles: 0,
    componentUsage: {},
    violations: [],
    recommendations: []
  };
};

// Development Environment에서만 전역 헬퍼 함수 제공
if (process.env.NODE_ENV === 'development') {
  (window as any).musashiGuide = {
    showGuide: showComponentGuide,
    checkImports: checkComponentImports,
    fixSuggestions: generateFixSuggestions,
    rules: COMPONENT_RULES
  };
}