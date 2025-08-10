import React, { forwardRef } from 'react';
import { theme } from '../../utils/theme';
import Typography from './Typography';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  variant?: 'default' | 'outlined';
  size?: 'small' | 'medium' | 'large';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  variant = 'outlined',
  size = 'medium',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2.5 text-base',
    large: 'px-4 py-3 text-lg'
  };

  const variantStyles = {
    default: {
      backgroundColor: theme.palette.gray[100],
      border: 'none',
      focusBorder: theme.theme.colorPrimary,
    },
    outlined: {
      backgroundColor: theme.theme.colorPage,
      border: `1px solid ${theme.theme.colorBorder}`,
      focusBorder: theme.theme.colorPrimary,
    }
  };

  const inputStyle = variantStyles[variant];

  const baseClasses = `
    w-full
    rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'focus:ring-blue-200'}
    ${className}
  `.trim();

  const styles: React.CSSProperties = {
    backgroundColor: inputStyle.backgroundColor,
    border: inputStyle.border,
    borderRadius: theme.borderRadius[500],
    color: theme.theme.colorText,
    fontFamily: theme.typography.fontFamilies.sans,
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-2">
          <Typography variant="small" weight="medium" color="dark">
            {label}
          </Typography>
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={baseClasses}
        style={styles}
        {...props}
      />
      {error && (
        <div className="mt-1">
          <Typography variant="small" color="light" className="text-red-500">
            {error}
          </Typography>
        </div>
      )}
      {helpText && !error && (
        <div className="mt-1">
          <Typography variant="small" color="light">
            {helpText}
          </Typography>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;