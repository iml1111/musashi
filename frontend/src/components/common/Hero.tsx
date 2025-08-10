import React from 'react';
import { theme } from '../../utils/theme';
import Button from './Button';
import Typography from './Typography';
import Badge from './Badge';

interface HeroProps {
  variant?: 'default' | 'centered' | 'split' | 'minimal';
  backgroundImage?: string;
  overlay?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    text: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    text: string;
    onClick?: () => void;
    href?: string;
  };
  features?: string[];
  stats?: {
    value: string;
    label: string;
  }[];
  className?: string;
}

const Hero: React.FC<HeroProps> = ({
  variant = 'default',
  backgroundImage,
  overlay = true,
  showBadge = false,
  badgeText = 'New',
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  features = [],
  stats = [],
  className = '',
}) => {
  const renderActionButton = (action: { text: string; onClick?: () => void; href?: string }, isPrimary = true) => {
    const ButtonComponent = (
      <Button
        variant={isPrimary ? 'primary' : 'secondary'}
        size="large"
        onClick={action.onClick}
      >
        {action.text}
      </Button>
    );

    return action.href ? (
      <a href={action.href}>
        {ButtonComponent}
      </a>
    ) : (
      ButtonComponent
    );
  };

  const baseClasses = `relative overflow-hidden ${className}`;

  if (variant === 'minimal') {
    return (
      <section className={baseClasses}>
        <div 
          className="py-20"
          style={{ backgroundColor: theme.palette.gray[50] }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {showBadge && (
              <div className="mb-6">
                <Badge variant="primary">{badgeText}</Badge>
              </div>
            )}
            <Typography variant="h1" className="mb-6">
              {title}
            </Typography>
            {description && (
              <Typography variant="body" color="light" className="mb-8 max-w-2xl mx-auto">
                {description}
              </Typography>
            )}
            {(primaryAction || secondaryAction) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {primaryAction && renderActionButton(primaryAction, true)}
                {secondaryAction && renderActionButton(secondaryAction, false)}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'split') {
    return (
      <section className={baseClasses}>
        <div className="min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="space-y-8">
                {showBadge && (
                  <Badge variant="primary">{badgeText}</Badge>
                )}
                <div>
                  {subtitle && (
                    <Typography variant="body" color="primary" weight="medium" className="mb-4">
                      {subtitle}
                    </Typography>
                  )}
                  <Typography variant="h1" className="mb-6">
                    {title}
                  </Typography>
                  {description && (
                    <Typography variant="body" color="light" className="mb-8">
                      {description}
                    </Typography>
                  )}
                </div>

                {features.length > 0 && (
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: theme.palette.green[100] }}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            style={{ color: theme.palette.green[600] }}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <Typography variant="body">
                          {feature}
                        </Typography>
                      </div>
                    ))}
                  </div>
                )}

                {(primaryAction || secondaryAction) && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {primaryAction && renderActionButton(primaryAction, true)}
                    {secondaryAction && renderActionButton(secondaryAction, false)}
                  </div>
                )}

                {stats.length > 0 && (
                  <div className="grid grid-cols-3 gap-8 pt-8 border-t" style={{ borderColor: theme.theme.colorBorder }}>
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center sm:text-left">
                        <Typography variant="h3" color="primary" className="mb-1">
                          {stat.value}
                        </Typography>
                        <Typography variant="small" color="light">
                          {stat.label}
                        </Typography>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visual */}
              <div className="relative">
                <div 
                  className="aspect-square rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.palette.blue[100]} 0%, ${theme.palette.purple[100]} 100%)`,
                  }}
                >
                  {backgroundImage ? (
                    <img
                      src={backgroundImage}
                      alt="Hero visual"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div 
                          className="w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                          style={{ backgroundColor: theme.theme.colorPrimary }}
                        >
                          <Typography variant="h2" style={{ color: theme.theme.colorPage }}>
                            M
                          </Typography>
                        </div>
                        <Typography variant="h4" color="primary">
                          Musashi
                        </Typography>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'centered') {
    return (
      <section 
        className={baseClasses}
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {overlay && backgroundImage && (
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: theme.palette.alphaBlack[500] }}
          />
        )}
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {showBadge && (
              <div className="mb-6">
                <Badge variant="primary">{badgeText}</Badge>
              </div>
            )}
            {subtitle && (
              <Typography 
                variant="body" 
                color={backgroundImage ? 'light' : 'primary'} 
                weight="medium" 
                className="mb-4"
                style={backgroundImage ? { color: theme.palette.gray[300] } : {}}
              >
                {subtitle}
              </Typography>
            )}
            <Typography 
              variant="h1" 
              className="mb-6"
              style={backgroundImage ? { color: theme.theme.colorPage } : {}}
            >
              {title}
            </Typography>
            {description && (
              <Typography 
                variant="body" 
                className="mb-8 max-w-3xl mx-auto"
                style={backgroundImage ? { color: theme.palette.gray[300] } : { color: theme.theme.colorTextLight }}
              >
                {description}
              </Typography>
            )}
            {(primaryAction || secondaryAction) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                {primaryAction && renderActionButton(primaryAction, true)}
                {secondaryAction && renderActionButton(secondaryAction, false)}
              </div>
            )}
            {stats.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <Typography 
                      variant="h2" 
                      className="mb-2"
                      style={backgroundImage ? { color: theme.theme.colorPage } : { color: theme.theme.colorPrimary }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body"
                      style={backgroundImage ? { color: theme.palette.gray[300] } : { color: theme.theme.colorTextLight }}
                    >
                      {stat.label}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section 
      className={baseClasses}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : `linear-gradient(135deg, ${theme.palette.blue[50]} 0%, ${theme.palette.purple[50]} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {overlay && backgroundImage && (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: theme.palette.alphaBlack[400] }}
        />
      )}
      <div className="relative py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {showBadge && (
              <div className="mb-6">
                <Badge variant="primary">{badgeText}</Badge>
              </div>
            )}
            {subtitle && (
              <Typography 
                variant="body" 
                color={backgroundImage ? 'light' : 'primary'} 
                weight="medium" 
                className="mb-4"
                style={backgroundImage ? { color: theme.palette.gray[300] } : {}}
              >
                {subtitle}
              </Typography>
            )}
            <Typography 
              variant="h1" 
              className="mb-6 max-w-4xl mx-auto"
              style={backgroundImage ? { color: theme.theme.colorPage } : {}}
            >
              {title}
            </Typography>
            {description && (
              <Typography 
                variant="body" 
                className="mb-10 max-w-3xl mx-auto"
                style={backgroundImage ? { color: theme.palette.gray[300] } : { color: theme.theme.colorTextLight }}
              >
                {description}
              </Typography>
            )}
            {(primaryAction || secondaryAction) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                {primaryAction && renderActionButton(primaryAction, true)}
                {secondaryAction && renderActionButton(secondaryAction, false)}
              </div>
            )}
            {features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-center space-x-3">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.palette.green[100] }}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        style={{ color: theme.palette.green[600] }}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <Typography 
                      variant="body"
                      style={backgroundImage ? { color: theme.palette.gray[300] } : {}}
                    >
                      {feature}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;