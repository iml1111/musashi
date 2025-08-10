import React from 'react';
import { theme } from '../../utils/theme';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  image?: string;
  imageAlt?: string;
  imageHeight?: string;
  hover?: boolean;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'medium',
  image,
  imageAlt = '',
  imageHeight = '200px',
  hover = false,
  className = '',
  children,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const variantStyles = {
    default: {
      backgroundColor: theme.theme.colorPage,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      border: 'none',
    },
    outlined: {
      backgroundColor: theme.theme.colorPage,
      boxShadow: 'none',
      border: `1px solid ${theme.theme.colorBorder}`,
    },
    elevated: {
      backgroundColor: theme.theme.colorPage,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: 'none',
    },
  };

  const baseClasses = `
    rounded-lg
    transition-all duration-200 ease-in-out
    ${image ? 'overflow-hidden' : ''}
    ${image ? '' : paddingClasses[padding]}
    ${hover ? 'hover:shadow-lg cursor-pointer transform hover:-translate-y-1' : ''}
    ${className}
  `.trim();

  const styles: React.CSSProperties = {
    ...variantStyles[variant],
    borderRadius: theme.borderRadius[500],
  };

  return (
    <div
      className={baseClasses}
      style={styles}
      {...props}
    >
      {image && (
        <div className="relative">
          <img
            src={image}
            alt={imageAlt}
            className="w-full object-cover"
            style={{ height: imageHeight }}
          />
        </div>
      )}
      {image ? (
        <div className={paddingClasses[padding]}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default Card;