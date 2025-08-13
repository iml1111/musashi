// ESLint Rules: Musashi Component 사용 강제
module.exports = {
  rules: {
    // HTML Tag 직접 사용 금지
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXElement[openingElement.name.name=/^(h[1-6]|p|button|input|span|div)$/]:not([openingElement.attributes.0.name.name="className"]):not([openingElement.attributes.0.name.name="style"])',
        message: 'HTML Tag 대신 Musashi Component를 사용하세요. h1-h6,p → Typography, button → Button, input → Input'
      }
    ],
    
    // 인라인 스타Day 금지
    'react/forbid-dom-props': [
      'error',
      {
        forbid: [
          {
            propName: 'style',
            message: '인라인 스타Day 대신 테마 Hour스템이나 Component props를 사용하세요'
          }
        ]
      }
    ],
    
    // 특정 className Pattern 금지
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXAttribute[name.name="className"][value.value=/text-(red|blue|green|yellow|purple|gray|black|white)-\\d+/]',
        message: 'Tailwind 색상 클래스 대신 Typography Component의 color prop을 사용하세요'
      },
      {
        selector: 'JSXAttribute[name.name="className"][value.value=/bg-(red|blue|green|yellow|purple|gray|black|white)-\\d+/]',
        message: '배경색 클래스 대신 적절한 Component나 테마 Hour스템을 사용하세요'
      }
    ]
  }
};

// Usage: .eslintrc.js에 Add
// module.exports = {
//   extends: [
//     // ... 기존 Settings
//     './.eslintrc.component-rules.js'
//   ]
// };