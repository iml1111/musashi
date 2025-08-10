import React from 'react';
import { FontFamily, FontWeight, theme } from '../../utils/theme';

type TypographyVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' 
  | 'body' | 'small' | 'tiny';

type TextColor = 'dark' | 'medium' | 'light' | 'primary';

interface TypographyProps {
  variant?: TypographyVariant;
  color?: TextColor;
  weight?: FontWeight;
  fontFamily?: FontFamily;
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'dark',
  weight,
  fontFamily = 'sans',
  className = '',
  children,
  as,
  style: customStyle,
  ...props
}) => {
  const variantStyles = {
    h1: {
      fontSize: theme.typography.fontSizes[800],
      lineHeight: theme.typography.lineHeights[800],
      fontWeight: theme.typography.fontWeights.bold,
      element: 'h1' as const,
    },
    h2: {
      fontSize: theme.typography.fontSizes[600],
      lineHeight: theme.typography.lineHeights[600],
      fontWeight: theme.typography.fontWeights.semibold,
      element: 'h2' as const,
    },
    h3: {
      fontSize: theme.typography.fontSizes[500],
      lineHeight: theme.typography.lineHeights[500],
      fontWeight: theme.typography.fontWeights.semibold,
      element: 'h3' as const,
    },
    h4: {
      fontSize: theme.typography.fontSizes[400],
      lineHeight: theme.typography.lineHeights[400],
      fontWeight: theme.typography.fontWeights.medium,
      element: 'h4' as const,
    },
    body: {
      fontSize: theme.typography.fontSizes[200],
      lineHeight: theme.typography.lineHeights[200],
      fontWeight: theme.typography.fontWeights.regular,
      element: 'p' as const,
    },
    small: {
      fontSize: theme.typography.fontSizes[100],
      lineHeight: theme.typography.lineHeights[100],
      fontWeight: theme.typography.fontWeights.regular,
      element: 'span' as const,
    },
    tiny: {
      fontSize: theme.typography.fontSizes[50],
      lineHeight: theme.typography.lineHeights[50],
      fontWeight: theme.typography.fontWeights.regular,
      element: 'span' as const,
    },
  };

  const colorStyles = {
    dark: theme.theme.colorTextDark,
    medium: theme.theme.colorTextMedium,
    light: theme.theme.colorTextLight,
    primary: theme.theme.colorPrimary,
  };

  const variantConfig = variantStyles[variant];
  const Element = as || variantConfig.element;

  const styles: React.CSSProperties = {
    fontSize: variantConfig.fontSize,
    lineHeight: variantConfig.lineHeight,
    fontWeight: weight ? theme.typography.fontWeights[weight] : variantConfig.fontWeight,
    fontFamily: theme.typography.fontFamilies[fontFamily],
    color: colorStyles[color],
    margin: 0,
    ...customStyle,
  };

  return (
    <Element
      className={className}
      style={styles}
      {...props}
    >
      {children}
    </Element>
  );
};

export default Typography;