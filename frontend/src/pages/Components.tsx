import React, { useState } from 'react';
import Button from '../components/common/Button';
import Typography from '../components/common/Typography';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Carousel from '../components/common/Carousel';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Hero from '../components/common/Hero';
import { theme } from '../utils/theme';

const Components: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length < 3) {
      setInputError('Please enter at least 3 characters.');
    } else {
      setInputError('');
    }
  };

  // Sample image URLs (using placeholder service)
  const sampleImages = [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=2',
    'https://picsum.photos/400/300?random=3',
    'https://picsum.photos/400/300?random=4',
    'https://picsum.photos/400/300?random=5',
  ];

  // Carousel items
  const carouselItems = [
    {
      id: 1,
      content: (
        <Card
          image={sampleImages[0]}
          imageAlt="Sample Image 1"
          hover
        >
          <Typography variant="h4" className="mb-2">First Slide</Typography>
          <Typography variant="body" color="light">
            The first card with beautiful images.
          </Typography>
        </Card>
      )
    },
    {
      id: 2,
      content: (
        <Card
          image={sampleImages[1]}
          imageAlt="Sample Image 2"
          hover
        >
          <Typography variant="h4" className="mb-2">Second Slide</Typography>
          <Typography variant="body" color="light">
            The second card with attractive content.
          </Typography>
        </Card>
      )
    },
    {
      id: 3,
      content: (
        <Card
          image={sampleImages[2]}
          imageAlt="Sample Image 3"
          hover
        >
          <Typography variant="h4" className="mb-2">Third Slide</Typography>
          <Typography variant="body" color="light">
            The third card with interesting content.
          </Typography>
        </Card>
      )
    },
    {
      id: 4,
      content: (
        <Card
          image={sampleImages[3]}
          imageAlt="Sample Image 4"
          hover
        >
          <Typography variant="h4" className="mb-2">Fourth Slide</Typography>
          <Typography variant="body" color="light">
            The fourth card with various information.
          </Typography>
        </Card>
      )
    },
  ];

  const multipleCarouselItems = Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    content: (
      <Card variant="outlined" className="h-32 flex items-center justify-center">
        <Typography variant="h4" color="primary">
          {index + 1}
        </Typography>
      </Card>
    )
  }));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-12">
          <Typography variant="h1" className="mb-4">Component Library</Typography>
          <Typography variant="body" color="light">
            View and test Musashi's design system components.
          </Typography>
        </div>

        {/* Color Palette */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Color Palette</Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(theme.palette).map(([colorName, colorValue]) => {
              if (typeof colorValue === 'string') {
                return (
                  <div key={colorName} className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg border shadow-sm"
                      style={{ backgroundColor: colorValue }}
                    />
                    <div>
                      <Typography variant="body" weight="medium">{colorName}</Typography>
                      <Typography variant="small" color="light">{colorValue}</Typography>
                    </div>
                  </div>
                );
              }
              
              if (typeof colorValue === 'object') {
                return (
                  <div key={colorName} className="space-y-2">
                    <Typography variant="body" weight="medium" className="capitalize">
                      {colorName}
                    </Typography>
                    <div className="grid grid-cols-5 gap-1">
                      {Object.entries(colorValue).map(([shade, hex]) => (
                        <div key={shade} className="text-center">
                          <div 
                            className="w-8 h-8 rounded border shadow-sm mb-1"
                            style={{ backgroundColor: hex }}
                            title={`${colorName}-${shade}: ${hex}`}
                          />
                          <Typography variant="tiny" color="light">{shade}</Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              
              return null;
            })}
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Buttons</Typography>
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Typography variant="h3" className="mb-4">Button Variants</Typography>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="tertiary">Tertiary Button</Button>
                </div>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-4">Button Sizes</Typography>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary" size="small">Small</Button>
                  <Button variant="primary" size="medium">Medium</Button>
                  <Button variant="primary" size="large">Large</Button>
                </div>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-4">Button States</Typography>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Normal</Button>
                  <Button variant="primary" disabled>Disabled</Button>
                  <Button variant="primary" loading>Loading</Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Typography</Typography>
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Typography variant="h3" className="mb-4">Headings</Typography>
                <div className="space-y-4">
                  <Typography variant="h1">Heading 1</Typography>
                  <Typography variant="h2">Heading 2</Typography>
                  <Typography variant="h3">Heading 3</Typography>
                  <Typography variant="h4">Heading 4</Typography>
                </div>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-4">Body Text</Typography>
                <div className="space-y-2">
                  <Typography variant="body">
                    This is regular body text. It's readable and comfortable for longer content.
                  </Typography>
                  <Typography variant="body" weight="medium">
                    This is medium weight body text.
                  </Typography>
                  <Typography variant="body" weight="semibold">
                    This is semibold body text.
                  </Typography>
                </div>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-4">Text Colors</Typography>
                <div className="space-y-2">
                  <Typography variant="body" color="dark">Dark text color</Typography>
                  <Typography variant="body" color="medium">Medium text color</Typography>
                  <Typography variant="body" color="light">Light text color</Typography>
                  <Typography variant="body" color="primary">Primary text color</Typography>
                </div>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-4">Font Families</Typography>
                <div className="space-y-2">
                  <Typography variant="body" fontFamily="sans">Sans Serif Font</Typography>
                  <Typography variant="body" fontFamily="serif">Serif Font</Typography>
                  <Typography variant="body" fontFamily="mono">Monospace Font</Typography>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Cards */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Cards</Typography>
          <div className="space-y-8">
            <div>
              <Typography variant="h3" className="mb-4">Basic Cards</Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <Typography variant="h4" className="mb-2">Default Card</Typography>
                  <Typography variant="body" color="light">
                    This is a default card with standard padding and styling.
                  </Typography>
                </Card>
                
                <Card variant="outlined">
                  <Typography variant="h4" className="mb-2">Outlined Card</Typography>
                  <Typography variant="body" color="light">
                    This card has a border outline instead of shadow.
                  </Typography>
                </Card>
                
                <Card variant="elevated">
                  <Typography variant="h4" className="mb-2">Elevated Card</Typography>
                  <Typography variant="body" color="light">
                    This card has more prominent shadow for elevation.
                  </Typography>
                </Card>
              </div>
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Image Cards</Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card
                  image={sampleImages[0]}
                  imageAlt="Beautiful landscape"
                  hover
                >
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="h4">Image Card</Typography>
                    <Badge variant="success">New</Badge>
                  </div>
                  <Typography variant="body" color="light" className="mb-3">
                    A card with an image. Hover effect is applied.
                  </Typography>
                  <Button variant="primary" size="small">Learn More</Button>
                </Card>

                <Card
                  image={sampleImages[1]}
                  imageAlt="Urban architecture"
                  variant="outlined"
                  hover
                  imageHeight="160px"
                >
                  <Typography variant="h4" className="mb-2">Outlined Image Card</Typography>
                  <Typography variant="body" color="light" className="mb-3">
                    An image card with a border. Image height can be customized.
                  </Typography>
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="small">View</Button>
                    <Button variant="tertiary" size="small">Share</Button>
                  </div>
                </Card>

                <Card
                  image={sampleImages[2]}
                  imageAlt="Nature scene"
                  variant="elevated"
                  hover
                >
                  <div className="flex items-start justify-between mb-2">
                    <Typography variant="h4">Premium Card</Typography>
                    <Badge variant="warning">Hot</Badge>
                  </div>
                  <Typography variant="body" color="light" className="mb-3">
                    A premium card with elegant shadow effects applied.
                  </Typography>
                  <div className="flex items-center justify-between">
                    <Typography variant="small" color="primary" weight="semibold">
                      $29.99
                    </Typography>
                    <Button variant="primary" size="small">Buy Now</Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Spacing System</Typography>
          <Card className="p-6">
            <div className="space-y-4">
              <Typography variant="h3" className="mb-4">Spacing Scale</Typography>
              {Object.entries(theme.spacing).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-4">
                  <div className="w-16">
                    <Typography variant="small" color="medium">{key}</Typography>
                  </div>
                  <div 
                    className="bg-blue-200 h-4"
                    style={{ width: value }}
                  />
                  <Typography variant="small" color="light">{value}</Typography>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Inputs */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Input Fields</Typography>
          <Card className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="h3" className="mb-4">Input Variants</Typography>
                  <div className="space-y-4">
                    <Input
                      label="Default Input"
                      placeholder="Enter your name"
                      variant="default"
                    />
                    <Input
                      label="Outlined Input"
                      placeholder="Enter your email"
                      variant="outlined"
                    />
                  </div>
                </div>
                
                <div>
                  <Typography variant="h3" className="mb-4">Input Sizes</Typography>
                  <div className="space-y-4">
                    <Input
                      label="Small Input"
                      placeholder="Small size"
                      size="small"
                    />
                    <Input
                      label="Medium Input"
                      placeholder="Medium size"
                      size="medium"
                    />
                    <Input
                      label="Large Input"
                      placeholder="Large size"
                      size="large"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-4">Input States</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Interactive Input"
                    placeholder="Type something..."
                    value={inputValue}
                    onChange={handleInputChange}
                    error={inputError}
                    helpText="This input validates as you type"
                  />
                  <Input
                    label="Disabled Input"
                    placeholder="Disabled state"
                    disabled
                    value="Cannot edit this"
                  />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Carousel */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Carousel</Typography>
          <div className="space-y-8">
            <div>
              <Typography variant="h3" className="mb-4">Single Item Carousel</Typography>
              <Carousel
                items={carouselItems}
                autoPlay
                autoPlayInterval={4000}
                showDots
                showArrows
              />
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Multiple Items Carousel</Typography>
              <Carousel
                items={multipleCarouselItems}
                itemsPerView={3}
                gap={20}
                showDots
                showArrows
              />
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Minimal Carousel</Typography>
              <Carousel
                items={carouselItems.slice(0, 3)}
                showDots={false}
                showArrows
                autoPlay
                autoPlayInterval={2000}
              />
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Badges</Typography>
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <Typography variant="h3" className="mb-4">Badge Variants</Typography>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                </div>
              </div>
              
              <div>
                <Typography variant="h3" className="mb-4">Badge Sizes</Typography>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="primary" size="small">Small</Badge>
                  <Badge variant="primary" size="medium">Medium</Badge>
                  <Badge variant="primary" size="large">Large</Badge>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Navbar */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Navigation Bar</Typography>
          <div className="space-y-8">
            <div>
              <Typography variant="h3" className="mb-4">Default Navbar</Typography>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: theme.theme.colorBorder }}>
                <Navbar />
              </div>
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Transparent Navbar</Typography>
              <div 
                className="relative rounded-lg overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${theme.palette.blue[100]} 0%, ${theme.palette.purple[100]} 100%)`,
                  minHeight: '200px'
                }}
              >
                <Navbar variant="transparent" />
                <div className="flex items-center justify-center h-40">
                  <Typography variant="body" color="medium">
                    Background content visible through transparent navbar
                  </Typography>
                </div>
              </div>
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Solid Navbar</Typography>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: theme.theme.colorBorder }}>
                <Navbar variant="solid" />
              </div>
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Minimal Navbar</Typography>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: theme.theme.colorBorder }}>
                <Navbar showSearch={false} showAuth={false} />
              </div>
            </div>
          </div>
        </section>

        {/* Hero Sections */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Hero Sections</Typography>
          <div className="space-y-8">
            <div>
              <Typography variant="h3" className="mb-4">Default Hero</Typography>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: theme.theme.colorBorder }}>
                <Hero
                  showBadge
                  badgeText="v2.0"
                  subtitle="AI-Powered Workflow Design"
                  title="Build Intelligent Agent Workflows Visually"
                  description="Create, design, and manage complex AI agent workflows without writing code. Drag, drop, and connect components to build powerful automation systems."
                  primaryAction={{
                    text: "Get Started",
                    onClick: () => alert("Primary action clicked!")
                  }}
                  secondaryAction={{
                    text: "View Demo",
                    onClick: () => alert("Secondary action clicked!")
                  }}
                  features={[
                    "Visual workflow builder",
                    "No-code automation",
                    "Team collaboration"
                  ]}
                />
              </div>
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Centered Hero</Typography>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: theme.theme.colorBorder }}>
                <Hero
                  variant="centered"
                  showBadge
                  badgeText="New Feature"
                  subtitle="Musashi v2.0"
                  title="The Future of Workflow Design"
                  description="Experience the next generation of visual workflow creation with enhanced AI capabilities and seamless team collaboration."
                  primaryAction={{
                    text: "Explore Features",
                    onClick: () => alert("Explore features!")
                  }}
                  secondaryAction={{
                    text: "Watch Video",
                    onClick: () => alert("Watch video!")
                  }}
                  stats={[
                    { value: "10K+", label: "Active Users" },
                    { value: "50K+", label: "Workflows Created" },
                    { value: "99.9%", label: "Uptime" }
                  ]}
                />
              </div>
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Split Hero</Typography>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: theme.theme.colorBorder }}>
                <Hero
                  variant="split"
                  showBadge
                  badgeText="Beta"
                  subtitle="Workflow Design Tool"
                  title="Cut the Code. Shape the Flow."
                  description="Musashi empowers teams to create sophisticated AI agent workflows through intuitive visual design. No programming required."
                  primaryAction={{
                    text: "Start Building",
                    onClick: () => alert("Start building!")
                  }}
                  secondaryAction={{
                    text: "Learn More",
                    onClick: () => alert("Learn more!")
                  }}
                  features={[
                    "Drag & drop interface",
                    "Real-time collaboration",
                    "Version control integration",
                    "Enterprise security"
                  ]}
                  stats={[
                    { value: "5min", label: "Setup Time" },
                    { value: "300%", label: "Faster Deployment" },
                    { value: "24/7", label: "Support" }
                  ]}
                />
              </div>
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Minimal Hero</Typography>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: theme.theme.colorBorder }}>
                <Hero
                  variant="minimal"
                  showBadge
                  badgeText="Simple"
                  title="Simple. Powerful. Beautiful."
                  description="Sometimes less is more. Create beautiful workflows with our minimal design approach."
                  primaryAction={{
                    text: "Get Started",
                    onClick: () => alert("Get started!")
                  }}
                  secondaryAction={{
                    text: "Learn More",
                    onClick: () => alert("Learn more!")
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Footer</Typography>
          <div className="space-y-8">
            <div>
              <Typography variant="h3" className="mb-4">Default Footer</Typography>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: theme.theme.colorBorder }}>
                <Footer />
              </div>
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Detailed Footer</Typography>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: theme.theme.colorBorder }}>
                <Footer variant="detailed" />
              </div>
            </div>

            <div>
              <Typography variant="h3" className="mb-4">Minimal Footer</Typography>
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: theme.theme.colorBorder }}>
                <Footer variant="minimal" />
              </div>
            </div>
          </div>
        </section>

        {/* Border Radius */}
        <section className="mb-12">
          <Typography variant="h2" className="mb-6">Border Radius</Typography>
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(theme.borderRadius).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div 
                    className="w-16 h-16 bg-blue-100 border border-blue-200 mx-auto mb-2"
                    style={{ borderRadius: value }}
                  />
                  <Typography variant="small" weight="medium">{key}</Typography>
                  <Typography variant="tiny" color="light">{value}</Typography>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Components;