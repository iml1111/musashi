import React from 'react';
import { theme } from '../../utils/theme';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'medium',
  className = '',
  children,
}) => {
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base'
  };

  const variantStyles = {
    default: {
      backgroundColor: theme.palette.gray[200],
      color: theme.palette.gray[800],
    },
    primary: {
      backgroundColor: theme.palette.blue[100],
      color: theme.palette.blue[800],
    },
    secondary: {
      backgroundColor: theme.palette.gray[100],
      color: theme.palette.gray[700],
    },
    success: {
      backgroundColor: theme.palette.green[100],
      color: theme.palette.green[800],
    },
    warning: {
      backgroundColor: theme.palette.yellow[100],
      color: theme.palette.yellow[800],
    },
    danger: {
      backgroundColor: theme.palette.red[100],
      color: theme.palette.red[800],
    },
  };

  const baseClasses = `
    inline-flex items-center
    font-medium rounded-full
    ${sizeClasses[size]}
    ${className}
  `.trim();

  const styles: React.CSSProperties = {
    ...variantStyles[variant],
    borderRadius: theme.borderRadius.round,
    fontFamily: theme.typography.fontFamilies.sans,
  };

  return (
    <span className={baseClasses} style={styles}>
      {children}
    </span>
  );
};

export default Badge;