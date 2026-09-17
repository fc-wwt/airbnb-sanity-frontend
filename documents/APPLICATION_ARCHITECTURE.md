# Application Architecture

## System Overview

The AirBnB Sanity Frontend is a modern Next.js application that interfaces with Sanity.io CMS to display property listings and their details with interactive features.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                      (User Interface)                           │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 │ HTTP Requests (getServerSideProps, API calls)
                 │
┌────────────────▼─────────────────────────────────────────────────┐
│                      NEXT.JS SERVER                              │
│  ┌──────────────────┐      ┌──────────────────┐                 │
│  │  Pages Layer     │      │  API Routes      │                 │
│  ├──────────────────┤      ├──────────────────┤                 │
│  │  index.js        │      │  api/hello.js    │                 │
│  │  [slug].js       │      └──────────────────┘                 │
│  │  _app.js         │                                            │
│  └────────┬─────────┘                                            │
│           │                                                      │
│  ┌────────▼──────────────────────────────────────┐              │
│  │     React Component Layer                      │              │
│  │  ┌─────────────┐  ┌─────────────────────┐     │              │
│  │  │  NavBar     │  │  DashboardMap       │     │              │
│  │  │  Map        │  │  Image              │     │              │
│  │  │  Review     │  │  Review             │     │              │
│  │  └─────────────┘  └─────────────────────┘     │              │
│  └────────────┬───────────────────────────────────┘              │
│               │                                                  │
│  ┌────────────▼──────────────────────────────────┐              │
│  │     Sanity Client Layer                        │              │
│  │  (sanity.js - createClient)                   │              │
│  │  - Fetch operations                            │              │
│  │  - Image URL building                         │              │
│  └────────────┬──────────────────────────────────┘              │
└───────────────┼───────────────────────────────────────────────────┘
                │
      ┌─────────┴──────────────┬──────────────────┐
      │                        │                  │
      ▼                        ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  SANITY.IO CMS   │  │ GOOGLE MAPS API  │  │  IMAGE CDN       │
│  - Property data │  │ - Map rendering  │  │  (Sanity hosted) │
│  - Reviews       │  │ - Geolocation    │  │ - Image serving  │
│  - Host info     │  │ - Markers        │  │ - Optimization   │
│  - Images        │  │ - Clustering     │  │ - Formats        │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

## Technology Stack

### Frontend Framework
- **Next.js 10.1.3**: React framework with server-side rendering (SSR) and static generation
- **React 17.0.2**: Component library for building UI

### Data & Content
- **Sanity.io**: Headless CMS for content management
- **next-sanity**: Integration package for Sanity in Next.js
- **GROQ**: Query language for fetching data from Sanity

### Mapping & Location
- **@react-google-maps/api**: React wrapper for Google Maps API
- Geolocation data stored in Sanity

### Styling
- **CSS**: Global styles in `styles/globals.css`
- Component-scoped CSS classes

## Request Flow - Property Listing Page (Index)

```
User navigates to http://localhost:3000
        │
        ▼
┌─────────────────────────────────────────┐
│  Next.js triggers getServerSideProps    │
│  (At build/request time)                │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Sanity Client executes GROQ query:     │
│  '*[ _type == "property"]'              │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Sanity API returns property data       │
│  (array of properties with images,      │
│   reviews, pricing, location)           │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Props passed to Home component         │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Home component renders:                │
│  1. Property feed (cards with images)   │
│  2. DashboardMap component              │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  DashboardMap loads Google Maps API     │
│  and renders markers for each property  │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Images loaded from Sanity CDN          │
│  via urlFor() image builder             │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Complete page rendered to browser      │
└─────────────────────────────────────────┘
```

## Request Flow - Property Detail Page

```
User clicks on property card
(e.g., property/sample-property)
        │
        ▼
┌─────────────────────────────────────────┐
│  Next.js routes to [slug].js            │
│  Extracts slug from URL params          │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  getServerSideProps executes with       │
│  pageContext.query.slug                 │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Sanity executes parametrized GROQ:     │
│  '*[ _type == "property" &&             │
│   slug.current == $pageSlug][0]{...}'   │
│                                         │
│  Includes:                              │
│  - Property details                     │
│  - Host information (reference)         │
│  - All reviews with traveller info      │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Sanity returns single property object  │
│  with nested references resolved        │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Property component renders:            │
│  1. Title and review count              │
│  2. Main image (Image component)        │
│  3. Sub-images grid                     │
│  4. Property info & host details        │
│  5. Price box                           │
│  6. Description                         │
│  7. Review list (Review components)     │
│  8. Map showing location (Map component)│
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Optimized images loaded from CDN       │
│  Maps rendered with single property     │
│  location marker                        │
└────────────┬──────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Complete property detail page rendered │
└─────────────────────────────────────────┘
```

## Data Model Overview

### Core Entities (in Sanity)

```
┌─────────────────┐
│   Property      │
├─────────────────┤
│ • title         │
│ • slug          │
│ • description   │
│ • propertyType  │
│ • location ─────┼──┐
│ • mainImage ────┼─┐│
│ • images ───────┼─┼├─── Images
│ • beds          │ │└─┼─────────────────────┐
│ • bedrooms      │ └─┼─> Location (lat, lng)│
│ • pricePerNight │   │                      │
│ • host ─────────┼───┼──┐                   │
│ • reviews ──────┼───┼──┼─┐                 │
└─────────────────┘   │  │ │                 │
                      │  │ │   ┌──────────┐  │
                      │  │ │   │ Host     │  │
                      │  │ │   ├──────────┤  │
                      │  │ │   │ • name   │  │
                      │  │ └─> │ • image  │  │
                      │  │     │ • slug   │  │
                      │  │     └──────────┘  │
                      │  │                   │
                      │  └───────────────────┘
                      │
                      ▼
                ┌──────────────────┐
                │ Property Images  │
                ├──────────────────┤
                │ • _key           │
                │ • asset (image)  │
                └──────────────────┘

┌─────────────────────┐
│     Review          │
├─────────────────────┤
│ • _key              │
│ • rating            │
│ • comment (implied) │
│ • traveller ────────┼──┐
└─────────────────────┘  │
                         │
                    ┌────▼─────────┐
                    │  Traveller   │
                    ├──────────────┤
                    │ • name       │
                    │ • image      │
                    │ • slug       │
                    └──────────────┘
```

## Component Hierarchy

```
_app.js
├── NavBar
└── Component (Current Page)
    │
    ├── index.js (Home)
    │   ├── NavBar (from _app)
    │   ├── h1 (feed title)
    │   ├── DashboardMap
    │   │   └── GoogleMap
    │   │       └── Marker (multiple)
    │   └── Card Grid
    │       └── Link → property/[slug]
    │
    └── property/[slug].js (Detail)
        ├── NavBar (from _app)
        ├── Image (mainImage)
        ├── Image (multiple sub-images)
        ├── Host Info Section
        ├── Price Box
        ├── Review (multiple)
        │   └── Image (traveller avatar)
        └── Map
            └── GoogleMap
                └── Marker (single location)
```

## Key Design Patterns

### 1. Server-Side Rendering (SSR)
- Uses `getServerSideProps` to fetch data at request time
- Ensures fresh data on every page load
- Improves SEO with complete HTML on first load

### 2. Image Optimization
- `urlFor()` builder provides responsive image optimization
- Images auto-formatted (WebP, etc.) based on browser
- Lazy loading for off-screen images

### 3. Component Reusability
- `Image` component wraps Sanity image URLs
- `Map` component reused in both listing and detail views
- `Review` component maps over reviews array

### 4. Content References
- Sanity references (host, traveller) resolved with arrow syntax (`host->`)
- Maintains relational integrity without duplication

### 5. Dynamic Routing
- `[slug].js` creates dynamic routes based on property slug
- URL structure: `/property/sample-property-name`
- Query parameters passed via context

## Performance Considerations

### Current Optimizations
- SSR reduces time-to-first-byte
- Image CDN via Sanity reduces bandwidth
- React.memo on expensive components (DashboardMap, Map)
- Google Maps lazy loading with useJsApiLoader

### Potential Improvements
- Implement Next.js Image component for optimization
- Add caching headers for static content
- Consider ISR (Incremental Static Regeneration) for properties
- Implement pagination for property listings
- Compress styles and bundle split

## Environment Variables Required

```
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_PROJECT_ID=<your-project-id>
googlePlacesAPI=<your-google-maps-api-key>
```

Note: `NEXT_PUBLIC_` prefix makes variables available in browser. The Google API key should be restricted to browser referers in production.
