# 🍽️ Chef's Visual Portfolio - Strapi CMS & Next.js Frontend

A sophisticated culinary portfolio platform built with Strapi v5.23.0 (headless CMS) and Next.js v15.5.2 (frontend). This project showcases professional chefs' culinary artistry through high-quality photography, detailed recipes, and elegant storytelling.

## 🎯 Project Overview

**Tech Stack**: Strapi (Headless CMS) + SQLite + Next.js (Frontend)  
**Hosting**: Free tier solutions (Vercel/Netlify + Railway/Render)  
**Target User**: Professional chef showcasing culinary artistry and brand  
**Primary Purpose**: Visual storytelling through food photography and culinary narrative

## 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

## 🏗️ Project Structure

```
/chef-portfolio-cms/     # Strapi backend (headless CMS)
├── src/api/            # Content types and API endpoints
│   ├── chef-profile/   # Chef biography and professional info
│   ├── dish-showcase/  # Culinary creations with photography
│   ├── newsletter/     # Email marketing content
│   ├── newsletter-subscriber/ # Subscriber management
│   └── site-copy/      # Dynamic website content
├── config/             # Strapi configuration
└── public/uploads/     # Media files and images

/chef-portfolio-frontend/ # Next.js frontend
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   └── lib/           # Utilities and API client
└── public/            # Static assets
```

## 🚀 Quick Start

### Backend (Strapi CMS)

```bash
# Navigate to CMS directory
cd chef-portfolio-cms

# Install dependencies
npm install

# Start development server
npm run develop
```

### Frontend (Next.js)

```bash
# Navigate to frontend directory
cd chef-portfolio-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📋 Content Types

- **Dish Showcase**: High-resolution food photography with detailed descriptions
- **Chef Profile**: Personal story, culinary journey, cooking philosophy  
- **Newsletter**: Email marketing content and templates
- **Newsletter Subscribers**: Email list management and segmentation
- **Site Copy**: Dynamic website content management

## 🎨 Design System

- **Color Palette**: Stone-based neutrals (50-900 scale)
- **Typography**: Inter + Playfair Display + Crimson Pro
- **Components**: ImageCard, GalleryGrid, HeroSection, Navigation, Lightbox
- **Styling**: Tailwind CSS v4 with CSS-based configuration

### Strapi Commands

#### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
```

#### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
```

#### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
