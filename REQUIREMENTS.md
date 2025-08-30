# Chef's Visual Portfolio CMS Requirements

> **Project Status (January 2025)**: Currently in initialization phase. Backend dependencies installed, missing files restored, documentation updated. Next: complete frontend setup and verify project functionality.

## Project Overview

**Project Name**: Chef's Visual Portfolio
**Tech Stack**: Strapi (Headless CMS) + SQLite + Next.js (Frontend)
**Hosting**: Free tier solutions (Vercel/Netlify + Railway/Render)
**Target User**: Professional chef showcasing culinary artistry and brand
**Primary Purpose**: Visual storytelling through food photography and culinary narrative

## Functional Requirements

### Core CMS Features

#### Culinary Content Management
- **Recipe Collection**: Rich recipe editor with ingredients, methods, techniques
- **Dish Gallery**: High-resolution food photography with detailed descriptions
- **Menu Showcases**: Seasonal menus, tasting menus, special collections
- **Cooking Techniques**: Step-by-step photo tutorials and techniques library
- **Ingredient Stories**: Sourcing stories, seasonal ingredients, supplier relationships
- **Behind-the-Scenes**: Kitchen moments, prep work, creative process documentation
- **Chef's Journal**: Culinary inspiration, travel experiences, flavor discoveries

#### Visual Portfolio Features
- **Photo-First Design**: Large, high-quality images with minimal text overlay
- **Dish Categories**: 
  - Appetizers/Small Plates
  - Main Courses
  - Desserts
  - Seasonal Specials
  - Signature Dishes
  - Technique Showcases
- **Visual Timeline**: Chronological showcase of culinary evolution
- **Before/After**: Ingredient transformations, plating evolution
- **Collections**: Themed photo series (seasons, techniques, collaborations)

#### Professional Features
- **Chef Bio & Philosophy**: Personal story, culinary journey, cooking philosophy
- **Restaurant/Venue Info**: Current positions, past experience, accolades
- **Press & Media**: Reviews, interviews, awards, media appearances
- **Collaborations**: Guest chef events, partnerships, special projects
- **Contact & Booking**: Private dining, consulting, events, media inquiries
- **Awards & Recognition**: Michelin stars, James Beard, local awards
- **Newsletter Management**: Email list building, promotional content distribution
- **Site Copy Management**: All website text editable through CMS admin

#### User Management
- **Single Chef Admin**: Primary content creator and manager
- **Guest Contributors**: Optional collaborators (sous chefs, photographers)
- **Media Access**: Photography team or food stylist access
- **Social Media Manager**: Limited access for social content curation
- **Newsletter Subscribers**: Email list management and segmentation
- **Analytics Dashboard**: View portfolio performance and visitor insights

#### API & Integration
- **RESTful API**: Auto-generated endpoints from Strapi
- **GraphQL Support**: Optional GraphQL endpoint
- **Webhook Support**: Trigger external services on content changes
- **Email Integration**: Contact forms and notifications
- **Social Media Integration**: Sharing capabilities

### Frontend Features

#### Visual Portfolio Website
- **Homepage**: Hero image of signature dish, featured collections, chef introduction
- **Dish Gallery**: Grid/masonry layout showcasing culinary creations
- **Recipe Collection**: Beautifully formatted recipes with step-by-step photos
- **About the Chef**: Personal story, philosophy, culinary journey
- **Current Menus**: Restaurant menus, seasonal offerings, special events
- **Press & Accolades**: Media coverage, awards, recognition
- **Contact & Booking**: Private dining, consulting, collaboration inquiries
- **Newsletter Signup**: Email collection with promotional content preferences
- **Dynamic Copy Management**: All website text managed through CMS

#### Photography-Focused Experience
- **Full-Screen Gallery**: Immersive viewing experience for food photography
- **Lightbox Navigation**: Seamless browsing through dish collections
- **Image Zoom**: High-resolution detail viewing for textures and plating
- **Before/After Sliders**: Ingredient transformation showcases
- **Video Integration**: Cooking technique videos, behind-the-scenes content
- **Instagram Integration**: Live feed from chef's social media

#### User Experience
- **Responsive Design**: Mobile-first, tablet, desktop optimized
- **Performance**: Fast loading, optimized images, caching
- **SEO Optimized**: Meta tags, structured data, sitemap
- **Accessibility**: WCAG 2.1 AA compliance
- **Progressive Enhancement**: Works without JavaScript

### Technical Requirements

#### Backend (Strapi)
- **Database**: SQLite for local development, PostgreSQL for production
- **File Storage**: Local storage for development, cloud storage for production
- **Caching**: Redis caching for API responses
- **Security**: JWT authentication, CORS configuration, rate limiting
- **Backup System**: Automated database backups
- **Environment Management**: Development, staging, production configs

#### Frontend (Next.js)
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Context or Zustand for simple state
- **Forms**: React Hook Form with validation
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Heroicons or Lucide React
- **Analytics**: Google Analytics 4 integration

#### Deployment & Hosting
- **Backend Hosting**: Railway (free tier) or Render (free tier)
- **Frontend Hosting**: Vercel (free tier) or Netlify (free tier)
- **Database**: 
  - Development: SQLite
  - Production: PostgreSQL (Railway/Render free tier)
- **CDN**: Cloudflare (free tier) for static assets
- **Domain**: Free subdomain or custom domain

## Non-Functional Requirements

### Performance
- **Page Load Speed**: < 3 seconds on 3G connection
- **Core Web Vitals**: Green scores on all metrics
- **API Response Time**: < 500ms for most requests
- **Image Optimization**: WebP format, responsive images
- **Bundle Size**: Frontend bundle < 500KB gzipped

### Scalability
- **Content Volume**: Support 10,000+ content items
- **Concurrent Users**: 100+ simultaneous users
- **API Rate Limits**: 1000 requests/hour per IP
- **Database Growth**: Efficient queries, proper indexing
- **Caching Strategy**: API caching, static generation

### Security
- **Data Protection**: HTTPS everywhere, secure headers
- **Authentication**: Strong password requirements, rate limiting
- **Input Validation**: Sanitize all user inputs
- **File Upload Security**: Type validation, size limits
- **API Security**: JWT tokens, proper CORS, rate limiting
- **Regular Updates**: Keep dependencies updated

### Usability
- **Learning Curve**: New users productive within 30 minutes
- **Interface**: Intuitive, consistent with modern web standards
- **Help System**: Contextual help, documentation
- **Error Handling**: Clear error messages, recovery suggestions
- **Offline Capability**: Basic offline content viewing

### Accessibility
- **WCAG Compliance**: Level AA conformance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels, semantic HTML
- **Color Contrast**: 4.5:1 minimum ratio
- **Text Scaling**: Supports up to 200% zoom

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **JavaScript**: Progressive enhancement, core features work without JS
- **CSS**: Graceful degradation for older browsers

## Content Requirements

### Content Types Structure

#### Dish Showcase
- Title (required) - Dish name
- Slug (auto-generated, editable)
- Hero Image (required) - Main dish photograph
- Additional Images (multiple upload) - Plating angles, ingredients, process
- Description (rich text) - Flavor profile, inspiration, technique
- Category (Appetizer, Main, Dessert, Special)
- Technique Tags (Sous Vide, Fermentation, Smoking, etc.)
- Ingredients List (structured list with sources)
- Cooking Method (brief technique description)
- Season/Availability (Spring, Summer, Fall, Winter, Year-round)
- Restaurant/Venue (where it's served)
- Chef Notes (personal insights, modifications)
- Publication Date
- Featured (boolean) - Highlight on homepage
- Status (draft, published, archived)

#### Recipe Collection
- Recipe Name (required)
- Slug (auto-generated, editable)
- Hero Image (finished dish)
- Prep Images (ingredients, mise en place)
- Process Images (step-by-step cooking)
- Difficulty Level (Beginner, Intermediate, Advanced, Professional)
- Prep Time / Cook Time / Total Time
- Servings/Yield
- Ingredients (structured with quantities, sources, substitutions)
- Method (step-by-step with optional images)
- Chef's Tips (professional insights)
- Wine/Beverage Pairing
- Nutritional Notes (optional)
- Season/Availability
- Equipment Needed
- Technique Focus (highlight specific skills)
- Story/Inspiration (background narrative)
- Status (draft, published, private)

#### Menu Collection
- Menu Name (required) - "Spring Tasting Menu 2025"
- Slug (auto-generated, editable)
- Menu Type (Tasting, A La Carte, Prix Fixe, Seasonal)
- Restaurant/Venue
- Active Dates (start/end dates)
- Description (concept, inspiration)
- Courses (structured list linking to dishes)
- Price (optional)
- Dietary Options (vegetarian, vegan, gluten-free alternatives)
- Wine Pairings (optional beverage program)
- Menu PDF (downloadable version)
- Featured Image (hero shot of menu highlight)
- Status (active, archived, upcoming)

#### Chef Profile & Story
- Personal Bio (rich text)
- Culinary Philosophy (mission statement)
- Professional Journey (timeline of positions)
- Training & Education (culinary school, mentors)
- Signature Style (cooking approach, influences)
- Profile Photos (professional headshots, kitchen action)
- Current Position(s)
- Awards & Recognition (structured list)
- Media Mentions (press coverage)
- Contact Information
- Social Media Links
- Booking/Inquiry Information

#### Press & Media
- Article Title (required)
- Publication/Source
- Publication Date
- Article Type (Review, Interview, Profile, Award)
- Excerpt/Summary
- Full Article Text or Link
- Featured Image (article photo or logo)
- PDF Upload (article scan)
- Rating/Score (if review)
- Quote Pullouts (highlight key mentions)
- Status (published, archived)

#### Collaborations & Events
- Event Name (required)
- Event Type (Pop-up, Guest Chef, Collaboration, Private Dining)
- Partner Chef/Restaurant (if applicable)
- Event Date(s)
- Location/Venue
- Description (concept, menu highlights)
- Event Photos (gallery)
- Special Menu (link to menu collection)
- Media Coverage (links to press)
- Testimonials (guest feedback)
- Status (upcoming, completed, archived)

#### Techniques Library
- Technique Name (required)
- Difficulty Level
- Equipment Required
- Description (detailed explanation)
- Step-by-Step Photos
- Video Tutorial (optional)
- Recipe Applications (dishes using this technique)
- Tips & Troubleshooting
- Historical/Cultural Context
- Chef's Variations
- Status (published, draft)

#### Newsletter Management
- Newsletter Name (required) - "Monthly Menu Updates"
- Subject Line Template
- Content Type (New Menu, Event Announcement, Recipe Feature, Behind-the-Scenes)
- Email Content (rich text with image support)
- Featured Dish/Recipe (link to content)
- Call-to-Action (reservation link, recipe download, etc.)
- Send Date (scheduled or immediate)
- Subscriber Segments (all, VIP diners, recipe enthusiasts, press)
- Performance Tracking (open rates, click rates)
- Status (draft, scheduled, sent)

#### Site Copy & Content Management
- Section Name (required) - "Homepage Hero", "About Intro", "Contact Form"
- Page Location (homepage, about, contact, etc.)
- Content Type (Headline, Subheading, Body Text, Button Text, Form Labels)
- Text Content (rich text)
- Display Order (for multiple text blocks)
- Active/Inactive (toggle content on/off)
- Last Updated (automatic timestamp)
- Notes (internal context for editors)

#### Newsletter Subscribers
- Email Address (required)
- First Name (optional)
- Subscription Date (automatic)
- Subscription Source (website, event, social media)
- Preferences (new menus, recipes, events, press updates)
- Status (active, unsubscribed, bounced)
- VIP Status (private dining clients, media contacts)
- Location (optional - for event targeting)
- Last Email Opened (tracking engagement)

### SEO Requirements
- **Meta Titles**: 50-60 characters optimal
- **Meta Descriptions**: 150-160 characters optimal
- **Open Graph Tags**: Title, description, image for social sharing
- **Structured Data**: JSON-LD for articles, organization, breadcrumbs
- **XML Sitemap**: Auto-generated and updated
- **Robots.txt**: Proper crawling instructions

### Media Requirements
- **Image Formats**: JPEG, PNG, WebP, HEIC (for iPhone photos)
- **Video Formats**: MP4, MOV (for cooking technique videos)
- **High-Resolution Support**: 4K photos for detailed food photography
- **File Size Limits**: 
  - Food Photos: 25MB max (professional camera files)
  - Videos: 200MB max (short technique demos)
  - Documents: 10MB max (menus, press clippings)
- **Image Optimization**: Automatic compression with quality preservation
- **Alt Text**: Required for accessibility (dish descriptions)
- **EXIF Data**: Preserve camera settings for photography reference
- **Color Profile**: sRGB for web, Adobe RGB for print materials

## Integration Requirements

### Third-Party Services
- **Email Service**: SendGrid or Mailgun for newsletter delivery and inquiry responses
- **Newsletter Platform**: Integrated email marketing with subscriber management
- **Analytics**: Google Analytics 4 for portfolio performance insights
- **Social Media**: Instagram API for live feed integration
- **Booking/Contact**: Advanced contact forms for private dining inquiries
- **Photography**: Integration with Adobe Lightroom/Capture One for workflow
- **Maps Integration**: Google Maps for restaurant/event locations
- **Calendar**: Optional booking calendar for private dining availability

### API Requirements
- **REST API**: Full CRUD operations for all content types
- **Authentication API**: Login, logout, password reset
- **File Upload API**: Secure file handling and storage
- **Search API**: Full-text search across content
- **Newsletter API**: Subscriber management, email sending, analytics
- **Content Management API**: Dynamic copy and text management
- **Analytics API**: Portfolio performance and newsletter metrics

### Backup & Recovery
- **Automated Backups**: Daily database backups
- **File Backups**: Media files backed up to cloud storage
- **Recovery Testing**: Monthly backup restoration tests
- **Version Control**: Git for code, content versioning in CMS

## Success Metrics

### User Adoption
- **Time to First Post**: < 15 minutes for new users
- **Daily Active Users**: Track regular content creators
- **Content Creation Rate**: Posts/pages created per month
- **User Retention**: 80% of users return within first week

### Performance Metrics
- **Page Speed**: Lighthouse score > 90
- **Uptime**: 99.5% availability target
- **API Response Time**: 95th percentile < 1 second
- **Error Rate**: < 1% of requests result in errors

### Business Metrics
- **Cost Efficiency**: Stay within free tier limits
- **Scalability**: Handle 10x current traffic without major changes
- **Maintenance Time**: < 2 hours/week for updates and monitoring
- **User Satisfaction**: 4.5+ rating from user feedback

## Constraints & Assumptions

### Technical Constraints
- **Free Hosting**: Must work within free tier limitations
- **Database Size**: SQLite limitations for large datasets
- **File Storage**: Limited free storage for media files
- **Compute Resources**: CPU/memory limits on free hosting
- **Concurrent Connections**: Database connection limits

### Business Constraints
- **Budget**: $0 monthly hosting costs
- **Development Time**: Solo developer project
- **Maintenance**: Minimal ongoing maintenance requirements
- **Scaling**: Ability to upgrade to paid tiers later

### Assumptions
- **User Base**: 1-50 content creators initially
- **Content Volume**: < 1000 posts/pages initially
- **Traffic**: < 10,000 monthly visitors initially
- **Technical Skills**: Users comfortable with modern web interfaces
- **Browser Support**: Users primarily on modern browsers
