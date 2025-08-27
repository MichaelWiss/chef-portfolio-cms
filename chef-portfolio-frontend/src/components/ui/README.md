# Chef Portfolio Design System

A sophisticated UI component library inspired by fine dining aesthetics, built with React, Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Overview

This design system captures the elegance and refinement of world-class culinary establishments. Each component is crafted with meticulous attention to detail, reflecting the same precision and artistry that goes into exceptional cuisine.

## Components

### 🎨 ImageCard

Sophisticated image cards for showcasing culinary creations with multiple variants and interactive features.

**Features:**
- Multiple variants: `default`, `featured`, `compact`, `hero`
- Chef attribution with profile images
- Difficulty badges with color coding
- Rating systems with stars
- Interactive hover effects and animations
- Loading states with skeleton UI
- Like functionality
- Responsive design

**Usage:**
```tsx
import { ImageCard } from '@/components/ui';

<ImageCard
  src="/images/dish.jpg"
  alt="Seared Scallops"
  title="Seared Scallops with Cauliflower Purée"
  description="Pan-seared diver scallops with silky cauliflower purée"
  chef={{ name: "Chef Marcus", image: "/chef.jpg" }}
  difficulty="Hard"
  rating={5}
  variant="featured"
  onImageClick={() => openLightbox()}
  onLike={() => toggleLike()}
/>
```

### 🖼️ GalleryGrid

Dynamic gallery grid with advanced filtering, search, and sorting capabilities.

**Features:**
- Responsive masonry layout
- Real-time search functionality
- Category and tag filtering
- Multiple sorting options (date, rating, title, difficulty)
- Smooth animations with Framer Motion
- Customizable grid columns
- Loading states
- Empty states

**Usage:**
```tsx
import { GalleryGrid } from '@/components/ui';

<GalleryGrid
  images={dishImages}
  onImageClick={handleImageClick}
  onLike={handleLike}
  showFilters={true}
  showSearch={true}
  showSort={true}
  columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
  gap="large"
/>
```

### 🎭 HeroSection

Elegant hero sections with parallax effects and multiple layout variants.

**Features:**
- Multiple variants: `minimal`, `chef`, `dish`, `full`
- Parallax background effects
- Overlay options: `dark`, `light`, `gradient`, `none`
- Height variants: `screen`, `large`, `medium`, `small`
- Chef-focused layouts with image and bio
- Scroll indicators with smooth scrolling
- Animated content with staggered reveals
- Call-to-action buttons

**Usage:**
```tsx
import { HeroSection } from '@/components/ui';

<HeroSection
  title="Culinary Excellence"
  subtitle="A Journey Through Fine Dining"
  description="Experience exceptional cuisine..."
  backgroundImage={{ src: "/hero.jpg", alt: "Kitchen" }}
  chef={{ name: "Chef Marcus", title: "Executive Chef" }}
  ctaButton={{ text: "Explore Menu", href: "/menu" }}
  variant="chef"
  height="large"
  overlay="dark"
/>
```

### 🧭 Navigation

Responsive navigation with scroll effects and smooth animations.

**Features:**
- Multiple variants: `transparent`, `solid`, `blur`, `minimal`
- Scroll effects with background changes
- Hide on scroll option
- Mobile menu with slide animations
- Active page indicators
- Logo support (text or image)
- Smooth hover effects
- Keyboard navigation

**Usage:**
```tsx
import { Navigation } from '@/components/ui';

<Navigation
  logo={{ text: "Chef Studio", href: "/" }}
  links={[
    { label: "Home", href: "/", isActive: true },
    { label: "Menu", href: "/menu" },
    { label: "About", href: "/about" }
  ]}
  variant="blur"
  scrollEffect={true}
  hideOnScroll={false}
/>
```

### 🔍 Lightbox

Advanced lightbox with zoom capabilities and metadata panels.

**Features:**
- Zoom functionality with click or keyboard
- Comprehensive metadata display
- Social sharing capabilities
- Keyboard navigation (arrows, escape, space)
- Smooth transitions between images
- Rating and like interactions
- Chef information and cooking details
- Tag system
- Mobile-friendly gestures

**Usage:**
```tsx
import { Lightbox } from '@/components/ui';

<Lightbox
  images={lightboxImages}
  currentIndex={currentIndex}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onNext={handleNext}
  onPrevious={handlePrevious}
  onLike={handleLike}
  onShare={handleShare}
  showMetadata={true}
  enableZoom={true}
  enableKeyboard={true}
/>
```

## Design Philosophy

### Color Palette

Our design system uses a sophisticated color palette inspired by natural cooking ingredients and fine dining environments:

- **Stone**: `50-950` - Primary neutral palette for backgrounds and text
- **Sage**: `50-950` - Herb-inspired accent color for interactive elements
- **Cream**: `50-950` - Warm accent for highlighting and comfort
- **Charcoal**: `50-950` - Deep contrast for premium feel
- **Copper**: `50-950` - Warm metallic accents for luxury touches

### Typography

- **Display Font**: Playfair Display - Elegant serif for headings and titles
- **Body Font**: Inter - Clean, readable sans-serif for content
- **Monospace**: SF Mono - Code and technical content

### Spacing & Layout

- Consistent 4px base unit system
- Golden ratio proportions for visual harmony
- Generous whitespace for elegance
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`

### Animation Principles

All animations follow these principles:
- **Subtle and Refined**: Never distracting from content
- **Purposeful**: Each animation serves a functional purpose
- **Smooth**: 60fps performance with hardware acceleration
- **Respectful**: Honors user preferences for reduced motion

## Technology Stack

- **React 18** - Component library foundation
- **Next.js 15** - Framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling with custom configuration
- **Framer Motion** - Smooth animations and gestures
- **Heroicons** - Consistent iconography

## Getting Started

1. Install dependencies:
```bash
npm install framer-motion @heroicons/react
```

2. Import components:
```tsx
import { ImageCard, GalleryGrid, HeroSection, Navigation, Lightbox } from '@/components/ui';
```

3. Customize the Tailwind config to include our design tokens (see `tailwind.config.ts`)

## Development Guidelines

### Component Structure
- Each component includes comprehensive TypeScript interfaces
- Props are well-documented with JSDoc comments
- Variants are implemented using discriminated unions
- Accessibility is built-in with ARIA labels and keyboard navigation

### Performance
- Images use Next.js optimized `Image` component
- Animations are optimized for 60fps
- Components use React best practices (memo, callbacks, etc.)
- Bundle size is minimized with tree-shaking

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast requirements met

## Customization

Each component accepts a `className` prop for custom styling. The design system is built to be extensible while maintaining consistency.

### Custom Variants

Add new variants by extending the component interfaces:

```tsx
// Custom ImageCard variant
<ImageCard
  variant="custom"
  className="your-custom-styles"
  // ... other props
/>
```

### Theming

The color palette can be customized in `tailwind.config.ts`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        stone: {
          // Custom stone palette
        },
        sage: {
          // Custom sage palette
        }
      }
    }
  }
}
```

## Contributing

When adding new components or modifying existing ones:

1. Follow the established patterns and naming conventions
2. Include comprehensive TypeScript types
3. Add proper accessibility features
4. Test across different screen sizes
5. Document new props and variants
6. Include animation considerations

## License

This design system is part of the Chef Portfolio project. See the main project README for licensing information.
