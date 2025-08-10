// ESLint 규칙: Musashi 컴포넌트 사용 강제
module.exports = {
  rules: {
    // HTML 태그 직접 사용 금지
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXElement[openingElement.name.name=/^(h[1-6]|p|button|input|span|div)$/]:not([openingElement.attributes.0.name.name="className"]):not([openingElement.attributes.0.name.name="style"])',
        message: 'HTML 태그 대신 Musashi 컴포넌트를 사용하세요. h1-h6,p → Typography, button → Button, input → Input'
      }
    ],
    
    // 인라인 스타일 금지
    'react/forbid-dom-props': [
      'error',
      {
        forbid: [
          {
            propName: 'style',
            message: '인라인 스타일 대신 테마 시스템이나 컴포넌트 props를 사용하세요'
          }
        ]
      }
    ],
    
    // 특정 className 패턴 금지
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXAttribute[name.name="className"][value.value=/text-(red|blue|green|yellow|purple|gray|black|white)-\\d+/]',
        message: 'Tailwind 색상 클래스 대신 Typography 컴포넌트의 color prop을 사용하세요'
      },
      {
        selector: 'JSXAttribute[name.name="className"][value.value=/bg-(red|blue|green|yellow|purple|gray|black|white)-\\d+/]',
        message: '배경색 클래스 대신 적절한 컴포넌트나 테마 시스템을 사용하세요'
      }
    ]
  }
};

// 사용법: .eslintrc.js에 추가
// module.exports = {
//   extends: [
//     // ... 기존 설정
//     './.eslintrc.component-rules.js'
//   ]
// };