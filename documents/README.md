# AirBnB Sanity Frontend - Documentation

This directory contains comprehensive documentation for the AirBnB Sanity Frontend application, including architecture diagrams, data flow explanations, and setup guides.

## Contents

1. **[APPLICATION_ARCHITECTURE.md](APPLICATION_ARCHITECTURE.md)** - High-level system architecture and component overview
2. **[DATA_FLOW.md](DATA_FLOW.md)** - How data flows through the application
3. **[COMPONENTS.md](COMPONENTS.md)** - Detailed component documentation
4. **[PAGES.md](PAGES.md)** - Page structure and routing
5. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Development environment setup
6. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide

## Quick Overview

This is a Next.js frontend for an AirBnB clone that integrates with Sanity.io CMS. The application displays property listings with reviews, pricing, and interactive maps using Google Maps API.

### Key Technologies

- **Next.js 10.1.3** - React framework for production
- **React 17.0.2** - UI library
- **Sanity.io** - Headless CMS with GROQ query language
- **Google Maps API** - Interactive property location maps
- **Next-Sanity** - Integration library between Next.js and Sanity

### Primary Features

- Browse property listings with images and reviews
- View detailed property information including amenities and host details
- Interactive maps showing property locations
- Server-side rendering for optimal performance and SEO
- Content management through Sanity Studio

## Getting Started

To get started with development:

```bash
npm install
npm run dev
```

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

## Project Structure

```
airbnb-sanity-frontend/
├── components/          # Reusable React components
├── pages/               # Next.js pages and API routes
├── public/              # Static assets
├── styles/              # Global CSS
├── documents/           # This documentation
├── sanity.js            # Sanity client configuration
├── utils.js             # Utility functions
└── package.json         # Project dependencies
```

For more detailed documentation on each aspect, see the relevant markdown files in this directory.
