import React, { useState } from 'react';
import { theme } from '../../utils/theme';
import Button from './Button';
import Typography from './Typography';
import Badge from './Badge';

interface NavbarProps {
  variant?: 'default' | 'transparent' | 'solid';
  fixed?: boolean;
  showLogo?: boolean;
  showSearch?: boolean;
  showAuth?: boolean;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  variant = 'default',
  fixed = false,
  showLogo = true,
  showSearch = true,
  showAuth = true,
  className = '',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const variantStyles = {
    default: {
      backgroundColor: theme.theme.colorPage,
      borderBottom: `1px solid ${theme.theme.colorBorder}`,
      backdropFilter: 'none',
    },
    transparent: {
      backgroundColor: theme.palette.alphaWhite[200],
      borderBottom: 'none',
      backdropFilter: 'blur(10px)',
    },
    solid: {
      backgroundColor: theme.theme.colorPrimary,
      borderBottom: 'none',
      backdropFilter: 'none',
    },
  };

  const textColor = variant === 'solid' ? theme.theme.colorPage : theme.theme.colorText;
  const linkColor = variant === 'solid' ? theme.palette.alphaWhite[800] : theme.theme.colorTextMedium;

  const baseClasses = `
    w-full z-50 transition-all duration-300
    ${fixed ? 'fixed top-0 left-0' : 'relative'}
    ${className}
  `.trim();

  const navItems = [
    { label: 'Home', href: '/', active: true },
    { label: 'Workflows', href: '/workflows', badge: 'New' },
    { label: 'Components', href: '/components' },
    { label: 'Docs', href: '/docs' },
    { label: 'About', href: '/about' },
  ];

  return (
    <nav
      className={baseClasses}
      style={variantStyles[variant]}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {showLogo && (
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ 
                    backgroundColor: variant === 'solid' ? theme.palette.alphaWhite[200] : theme.theme.colorPrimary 
                  }}
                >
                  <Typography 
                    variant="body" 
                    weight="bold" 
                    style={{ color: variant === 'solid' ? theme.theme.colorPrimary : theme.theme.colorPage }}
                  >
                    M
                  </Typography>
                </div>
                <Typography variant="h4" weight="bold" style={{ color: textColor }}>
                  Musashi
                </Typography>
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <div key={index} className="relative flex items-center space-x-2">
                <a
                  href={item.href}
                  className="transition-colors duration-200 hover:opacity-80"
                  style={{ 
                    color: item.active ? textColor : linkColor,
                    fontWeight: item.active ? theme.typography.fontWeights.medium : theme.typography.fontWeights.regular
                  }}
                >
                  {item.label}
                </a>
                {item.badge && (
                  <Badge variant="primary" size="small">
                    {item.badge}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Search & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {showSearch && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-64 px-4 py-2 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: variant === 'solid' 
                      ? theme.palette.alphaWhite[200] 
                      : theme.palette.gray[100],
                    borderColor: theme.theme.colorBorder,
                    color: variant === 'solid' ? theme.theme.colorText : theme.theme.colorText,
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    style={{ color: linkColor }}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            )}

            {showAuth && (
              <div className="flex items-center space-x-3">
                <Button 
                  variant={variant === 'solid' ? 'tertiary' : 'secondary'} 
                  size="small"
                >
                  Sign In
                </Button>
                <Button 
                  variant={variant === 'solid' ? 'secondary' : 'primary'} 
                  size="small"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md transition-colors duration-200"
              style={{ color: textColor }}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <a
                    href={item.href}
                    className="block px-3 py-2 rounded-md transition-colors duration-200"
                    style={{ 
                      color: item.active ? textColor : linkColor,
                      fontWeight: item.active ? theme.typography.fontWeights.medium : theme.typography.fontWeights.regular
                    }}
                  >
                    {item.label}
                  </a>
                  {item.badge && (
                    <Badge variant="primary" size="small">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              ))}
              
              {showSearch && (
                <div className="pt-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border"
                    style={{
                      backgroundColor: variant === 'solid' 
                        ? theme.palette.alphaWhite[200] 
                        : theme.palette.gray[100],
                      borderColor: theme.theme.colorBorder,
                      color: theme.theme.colorText,
                    }}
                  />
                </div>
              )}
              
              {showAuth && (
                <div className="pt-4 space-y-2">
                  <Button 
                    variant={variant === 'solid' ? 'tertiary' : 'secondary'} 
                    size="small" 
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant={variant === 'solid' ? 'secondary' : 'primary'} 
                    size="small" 
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;