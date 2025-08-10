import React from 'react';
import { theme } from '../../utils/theme';
import Typography from './Typography';
import Button from './Button';

interface FooterProps {
  variant?: 'default' | 'minimal' | 'detailed';
  showNewsletter?: boolean;
  showSocial?: boolean;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({
  variant = 'default',
  showNewsletter = true,
  showSocial = true,
  className = '',
}) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'Workflows', href: '/workflows' },
      { label: 'Components', href: '/components' },
      { label: 'Pricing', href: '/pricing' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Help Center', href: '/help' },
      { label: 'Community', href: '/community' },
      { label: 'API Reference', href: '/api' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Security', href: '/security' },
    ],
  };

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      name: 'Discord',
      href: 'https://discord.com',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ),
    },
  ];

  if (variant === 'minimal') {
    return (
      <footer 
        className={`py-8 ${className}`}
        style={{ 
          backgroundColor: theme.palette.gray[100],
          borderTop: `1px solid ${theme.theme.colorBorder}`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div 
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: theme.theme.colorPrimary }}
              >
                <Typography variant="small" weight="bold" style={{ color: theme.theme.colorPage }}>
                  M
                </Typography>
              </div>
              <Typography variant="body" weight="medium">
                Musashi
              </Typography>
            </div>
            <Typography variant="small" color="light">
              © {currentYear} Musashi. All rights reserved.
            </Typography>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer 
      className={`${className}`}
      style={{ backgroundColor: theme.palette.gray[900] }}
    >
      {/* Newsletter Section */}
      {showNewsletter && variant === 'detailed' && (
        <div 
          className="py-12"
          style={{ backgroundColor: theme.palette.gray[800] }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Typography variant="h3" className="mb-4" style={{ color: theme.theme.colorPage }}>
                Stay up to date
              </Typography>
              <Typography variant="body" className="mb-8" style={{ color: theme.palette.gray[300] }}>
                Get the latest news, updates, and tips delivered straight to your inbox.
              </Typography>
              <div className="max-w-md mx-auto flex space-x-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: theme.theme.colorPage,
                    borderColor: theme.palette.gray[600],
                    color: theme.theme.colorText,
                  }}
                />
                <Button variant="primary">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Logo & Description */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.theme.colorPrimary }}
                >
                  <Typography variant="body" weight="bold" style={{ color: theme.theme.colorPage }}>
                    M
                  </Typography>
                </div>
                <Typography variant="h4" weight="bold" style={{ color: theme.theme.colorPage }}>
                  Musashi
                </Typography>
              </div>
              <Typography variant="body" className="mb-6" style={{ color: theme.palette.gray[400] }}>
                AI Agent Workflow Design Tool that focuses on visual workflow creation. 
                Cut the code. Shape the flow.
              </Typography>
              {showSocial && (
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-800"
                      style={{ color: theme.palette.gray[400] }}
                      title={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Links Sections */}
            {variant === 'detailed' ? (
              <>
                <div>
                  <Typography variant="body" weight="semibold" className="mb-4" style={{ color: theme.theme.colorPage }}>
                    Product
                  </Typography>
                  <ul className="space-y-3">
                    {footerLinks.product.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="transition-colors duration-200 hover:opacity-80"
                          style={{ color: theme.palette.gray[400] }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Typography variant="body" weight="semibold" className="mb-4" style={{ color: theme.theme.colorPage }}>
                    Company
                  </Typography>
                  <ul className="space-y-3">
                    {footerLinks.company.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="transition-colors duration-200 hover:opacity-80"
                          style={{ color: theme.palette.gray[400] }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Typography variant="body" weight="semibold" className="mb-4" style={{ color: theme.theme.colorPage }}>
                    Resources
                  </Typography>
                  <ul className="space-y-3">
                    {footerLinks.resources.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="transition-colors duration-200 hover:opacity-80"
                          style={{ color: theme.palette.gray[400] }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Typography variant="body" weight="semibold" className="mb-4" style={{ color: theme.theme.colorPage }}>
                    Legal
                  </Typography>
                  <ul className="space-y-3">
                    {footerLinks.legal.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="transition-colors duration-200 hover:opacity-80"
                          style={{ color: theme.palette.gray[400] }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="lg:col-span-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <Typography variant="body" weight="semibold" className="mb-4" style={{ color: theme.theme.colorPage }}>
                      Product
                    </Typography>
                    <ul className="space-y-2">
                      {footerLinks.product.slice(0, 3).map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            className="text-sm transition-colors duration-200 hover:opacity-80"
                            style={{ color: theme.palette.gray[400] }}
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Typography variant="body" weight="semibold" className="mb-4" style={{ color: theme.theme.colorPage }}>
                      Company
                    </Typography>
                    <ul className="space-y-2">
                      {footerLinks.company.slice(0, 3).map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            className="text-sm transition-colors duration-200 hover:opacity-80"
                            style={{ color: theme.palette.gray[400] }}
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Typography variant="body" weight="semibold" className="mb-4" style={{ color: theme.theme.colorPage }}>
                      Resources
                    </Typography>
                    <ul className="space-y-2">
                      {footerLinks.resources.slice(0, 3).map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            className="text-sm transition-colors duration-200 hover:opacity-80"
                            style={{ color: theme.palette.gray[400] }}
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Typography variant="body" weight="semibold" className="mb-4" style={{ color: theme.theme.colorPage }}>
                      Legal
                    </Typography>
                    <ul className="space-y-2">
                      {footerLinks.legal.slice(0, 3).map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            className="text-sm transition-colors duration-200 hover:opacity-80"
                            style={{ color: theme.palette.gray[400] }}
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div 
        className="py-6"
        style={{ 
          borderTop: `1px solid ${theme.palette.gray[800]}` 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Typography variant="small" style={{ color: theme.palette.gray[500] }}>
              © {currentYear} Musashi. All rights reserved.
            </Typography>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Typography variant="small" style={{ color: theme.palette.gray[500] }}>
                Made with ❤️ by the Musashi Team
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;