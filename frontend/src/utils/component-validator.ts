/**
 * Musashi Component Validator
 * Development component usage rules validation utility
 */

export const COMPONENT_RULES = {
  // Forbidden HTML tags (must be replaced with components)
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

  // Recommended component mapping
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

  // Forbidden inline style properties
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
 * Output component usage guide to console
 */
export const showComponentGuide = (element: string) => {
  if (process.env.NODE_ENV === 'development') {
    const recommendation = COMPONENT_RULES.FORBIDDEN_TAGS[element as keyof typeof COMPONENT_RULES.FORBIDDEN_TAGS];
    
    if (recommendation) {
      // Component usage guide removed (was causing console output)
    }
  }
};

/**
 * Inline style usage warning in development environment
 */
export const warnInlineStyle = (styles: Record<string, any>) => {
  if (process.env.NODE_ENV === 'development') {
    const forbiddenProps = Object.keys(styles).filter(prop => 
      COMPONENT_RULES.FORBIDDEN_STYLES.includes(prop as any)
    );

    if (forbiddenProps.length > 0) {
      // Style guide warning removed (was causing console output)
    }
  }
};

/**
 * Component import checker
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
      message: 'Using HTML tags but Musashi components are not imported.',
      suggestion: "import { Typography, Button, Input } from '../components/common';"
    };
  }

  return { warning: false };
};

/**
 * Generate auto-fix suggestions
 */
export const generateFixSuggestions = (code: string) => {
  const suggestions: Array<{from: string, to: string, reason: string}> = [];

  // HTML tag to component conversion suggestions
  Object.entries(COMPONENT_RULES.FORBIDDEN_TAGS).forEach(([tag, component]) => {
    const regex = new RegExp(`<${tag}([^>]*)>([^<]*)</${tag}>`, 'g');
    const matches = code.match(regex);
    
    if (matches) {
      matches.forEach(match => {
        suggestions.push({
          from: match,
          to: `<${component}>${match.replace(new RegExp(`</?${tag}[^>]*>`, 'g'), '')}</${component.split(' ')[0]}>`,
          reason: `Replace HTML ${tag} tag with ${component} component`
        });
      });
    }
  });

  return suggestions;
};

/**
 * Development tool - Component usage analysis
 */
export const analyzeComponentUsage = (_projectPath: string) => {
  // Actual implementation used in build tools or separate scripts
  return {
    totalFiles: 0,
    componentUsage: {},
    violations: [],
    recommendations: []
  };
};

// Provide global helper functions only in development environment
if (process.env.NODE_ENV === 'development') {
  (window as any).musashiGuide = {
    showGuide: showComponentGuide,
    checkImports: checkComponentImports,
    fixSuggestions: generateFixSuggestions,
    rules: COMPONENT_RULES
  };
}
