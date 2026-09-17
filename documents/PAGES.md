# Pages Documentation

## Overview

Next.js uses a file-based routing system. Each file in the `pages` directory becomes a route. This document details each page and API route.

## Page Routing Diagram

```
File Structure                  URL Route
─────────────────────────────   ──────────────────
pages/
├── _app.js                     (wrapper)
├── index.js                    / (home)
├── property/
│   └── [slug].js               /property/:slug (dynamic)
└── api/
    └── hello.js                /api/hello (API endpoint)
```

## Pages Summary

| Route | File | Type | Purpose |
|-------|------|------|---------|
| `/` | `pages/index.js` | Page | Home/listing page with property feed and map |
| `/property/[slug]` | `pages/property/[slug].js` | Page | Property detail page |
| `/_app.js` | `pages/_app.js` | Wrapper | Custom App component wrapping all pages |
| `/api/hello` | `pages/api/hello.js` | API | Example API endpoint |

---

## Detailed Page Documentation

### 1. Home Page (index.js)

**Route:** `/` (http://localhost:3000/)

**File:** `pages/index.js`

**Purpose:** Display all properties with interactive browsing and map

#### Data Fetching

```javascript
export const getServerSideProps = async () => {
  const query = '*[ _type == "property"]'
  const properties = await sanityClient.fetch(query)
  
  if (!properties.length) {
    return { props: { properties: [] } }
  } else {
    return { props: { properties } }
  }
}
```

**Query Breakdown:**
- `*` - All documents
- `[ _type == "property" ]` - Filter to only properties
- Returns array of all property documents with all fields

**Timing:** Executes on every request (server-side)

**Error Handling:**
- If no properties: Returns empty array
- If error occurs: Server 500 error

#### Component Structure

```jsx
Home Component
├── Main container (className="main")
│
├── Feed section (className="feed-container")
│   ├── Title: "Places to stay near you"
│   │
│   └── Feed grid (className="feed")
│       └── For each property:
│           └── Card (className="card")
│               ├── Image
│               │   └── urlFor(mainImage)
│               ├── Review count
│               │   └── reviews.length
│               │   └── isMultiple() for pluralization
│               ├── Title
│               │   └── property.title
│               └── Price
│                   └── £property.pricePerNight
│
└── Map section (className="map")
    └── DashboardMap Component
        └── properties={properties}
```

#### Rendering Flow

```
1. getServerSideProps executes
   ├─ Fetch all properties
   └─ Return { props: { properties: [...] } }

2. Home component receives properties via props
   
3. JSX renders:
   ├─ Navigation (from _app.js)
   ├─ Sidebar with property feed
   │  └─ Map over properties
   │     └─ Create card with image, title, price
   │        └─ Wrap in Link for navigation
   └─ Right side with DashboardMap
      └─ All properties plotted as markers

4. Client-side hydration
   ├─ React attaches event listeners
   ├─ Links become clickable
   ├─ Map becomes interactive
   └─ Page fully interactive

5. Image loading (concurrent)
   ├─ All property mainImages load from CDN
   └─ Images display as they arrive

6. Map loading (concurrent)
   ├─ Google Maps API loads
   ├─ Map initializes
   ├─ Markers render
   └─ Map interactive
```

#### User Interactions

```
Click property card
  │
  ├─ Next Link component handles navigation
  └─ URL changes to /property/property-slug
     └─ Browser requests new page
        └─ getServerSideProps for [slug].js runs
           └─ Detail page loads
```

```
Pan/zoom map
  │
  ├─ Google Maps API handles interactions
  ├─ User can explore location visually
  └─ Click marker (not implemented)
     └─ Could navigate to property
```

#### Layout

```
┌─────────────────────────────────┐
│         NavBar                  │
├─────────────────┬───────────────┤
│  Feed Container │               │
│                 │               │
│  Properties:    │   DashboardMap│
│  ┌───────────┐  │               │
│  │ Property1 │  │ (Interactive) │
│  │ Card      │  │ Map with      │
│  ├───────────┤  │ all markers   │
│  │ Property2 │  │               │
│  │ Card      │  │               │
│  ├───────────┤  │               │
│  │ Property3 │  │               │
│  │ Card      │  │               │
│  └───────────┘  │               │
│                 │               │
└─────────────────┴───────────────┘
```

---

### 2. Property Detail Page ([slug].js)

**Route:** `/property/[slug]` (e.g., `/property/beautiful-london-flat`)

**File:** `pages/property/[slug].js`

**Purpose:** Display detailed information about a single property

#### Dynamic Routing

```javascript
// Next.js creates a dynamic route from filename [slug].js
// URL parameters captured in pageContext.query

export const getServerSideProps = async (pageContext) => {
  const pageSlug = pageContext.query.slug
  // slug = "beautiful-london-flat" (from URL)
}
```

#### Data Fetching

```javascript
const query = `*[ _type == "property" && slug.current == $pageSlug][0]{
  title,
  location,
  propertyType,
  mainImage,
  images,
  pricePerNight,
  beds,
  bedrooms,
  description,
  host->{
    _id,
    name,
    slug,
    image
  },
  reviews[]{
    ...,
    traveller->{
      _id,
      name,
      slug,
      image
    }
  }
}`

const property = await sanityClient.fetch(query, { pageSlug })
```

**Query Breakdown:**
- `*[ _type == "property" && slug.current == $pageSlug ]` - Find matching property
- `[0]` - Get first (only) result
- `{ ... }` - Project specific fields
- `host->{ ... }` - Resolve host reference
- `reviews[]{ ..., traveller->{ ... } }` - Resolve each review's traveller

**Parameters:**
- `pageSlug`: String value from URL

**Timing:** Executes on every request to this route

#### Error Handling

```javascript
// Property not found
if (!property) {
  return {
    props: null,
    notFound: true  // Renders 404 page
  }
}

// Property found
return {
  props: {
    title, location, propertyType, mainImage,
    images, pricePerNight, beds, bedrooms,
    description, host, reviews
  }
}
```

#### Component Structure

```jsx
Property Component
│
├── Title section
│   ├── Property title
│   └── Review count
│
├── Image section (className="images-section")
│   ├── Main image
│   │   └── Image component (identifier="main-image")
│   │       └── urlFor(mainImage)
│   │
│   └── Sub-images section
│       └── For each image in images array:
│           └── Image component (identifier="image")
│               └── urlFor(asset)
│
├── Information section (className="section")
│   ├── Left side (className="information")
│   │   ├── Property type & host name
│   │   ├── Bedroom/bed count
│   │   ├── Enhanced Clean info
│   │   ├── Amenities info
│   │   └── House rules
│   │
│   └── Right side (className="price-box")
│       ├── Price per night
│       ├── Review count
│       └── "Change Dates" button
│           └── Link back to home
│
├── Description section
│   └── property.description
│
├── Reviews section
│   ├── Review count header
│   └── For each review:
│       └── Review component
│           ├── Rating (review.rating)
│           ├── Traveller name
│           └── Traveller avatar
│               └── urlFor(image).width(50).height(50)
│
└── Map section
    ├── "Location" header
    └── Map component
        └── Single marker at property.location
```

#### Rendering Flow

```
1. User arrives at /property/beautiful-london-flat

2. pageContext.query.slug = "beautiful-london-flat"

3. getServerSideProps executes
   ├─ Fetch property by slug
   ├─ Include all nested references
   └─ Return property props

4. Property component renders with props
   ├─ All data available immediately
   └─ No client-side loading needed

5. Images render
   ├─ Main image src from urlFor()
   ├─ Sub-images load
   └─ Avatar images load

6. Map initializes
   ├─ Google Maps API loads
   ├─ Single marker at property location
   └─ Interactive map ready

7. Complete page rendered and interactive
```

#### Layout

```
┌────────────────────────────────────────────┐
│               NavBar                       │
├────────────────────────────────────────────┤
│ Title: Beautiful London Flat               │
│ Reviews: 5 reviews                         │
├────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐   │
│ │      MAIN IMAGE (Hero)               │   │
│ │      (Full Width)                    │   │
│ └──────────────────────────────────────┘   │
│ ┌─────────┬──────────┬──────────────┐     │
│ │Sub Image│Sub Image │ Sub Image    │     │
│ └─────────┴──────────┴──────────────┘     │
├────────────────────────────────────────────┤
│ ┌──────────────────┬─────────────────┐    │
│ │ Information      │  Price Box      │    │
│ │ - Type: Apt      │  £120/night     │    │
│ │ - Hosted by Jane │  5 reviews      │    │
│ │ - 1 bed, 1 room  │  [Change Dates] │    │
│ │ - Description... │                 │    │
│ └──────────────────┴─────────────────┘    │
├────────────────────────────────────────────┤
│ Reviews (5)                                │
│ ┌────────────────────────────────────┐    │
│ │ 5 | John Smith | [avatar]          │    │
│ ├────────────────────────────────────┤    │
│ │ 4 | Jane Doe   | [avatar]          │    │
│ └────────────────────────────────────┘    │
├────────────────────────────────────────────┤
│ Location                                   │
│ ┌────────────────────────────────────┐    │
│ │     Map with Single Marker         │    │
│ │     (400px height)                 │    │
│ └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

#### User Interactions

```
Click "Change Dates"
  │
  ├─ Next Link navigates to "/"
  └─ Browser requests home page
     └─ getServerSideProps for index.js runs
        └─ Home page loads with all properties
```

```
Scroll and explore
  ├─ View images
  ├─ Read information
  ├─ See reviews
  └─ Interact with map
     ├─ Pan/zoom
     ├─ Click marker (not implemented)
     └─ Explore location
```

---

### 3. Custom App (_app.js)

**File:** `pages/_app.js`

**Purpose:** Wrapper component for all pages, global layout

```javascript
const MyApp = ({ Component, pageProps }) => {
  return (
    <>
      <NavBar />
      <Component {...pageProps} />
    </>
  )
}
```

**Features:**

1. **Global Navigation:**
   - NavBar rendered on every page
   - Visible in both index and detail views

2. **CSS Loading:**
   ```javascript
   import "../styles/globals.css"
   ```
   - Global styles applied to all pages

3. **Props Distribution:**
   - Component: Current page component (index.js or [slug].js)
   - pageProps: Data from getServerSideProps

#### Flow

```
Initial Request
  │
  ├─ Next.js loads _app.js
  ├─ Global CSS imported
  ├─ NavBar component added to tree
  └─ Current page component injected
     └─ Page-specific getServerSideProps runs
        └─ Props passed to page component
           └─ _app renders complete page
```

---

### 4. API Route (hello.js)

**Route:** `/api/hello`

**File:** `pages/api/hello.js`

**Purpose:** Example API endpoint (minimal implementation)

```javascript
// Currently minimal/example only
// Not used by application
```

**Potential Uses:**
- Form submission endpoints
- Authentication
- Third-party service calls
- Data aggregation

---

## Routing Summary

### Home Page Route

```
URL: http://localhost:3000/
Method: GET
Handler: getServerSideProps in index.js
Query: Fetch all properties
Response: Rendered property listing page
```

### Detail Page Routes

```
URL: http://localhost:3000/property/beautiful-london-flat
Method: GET
Handler: getServerSideProps with pageContext.query.slug
Query: Fetch property with slug = "beautiful-london-flat"
Response: Rendered property detail page

URL: http://localhost:3000/property/sample-property
Method: GET
Handler: Same, with slug = "sample-property"
Query: Fetch property with that slug
Response: Rendered property detail page

Multiple properties = Multiple dynamic routes
```

---

## Query Parameter Resolution

### Dynamic Route to Query Mapping

```
Browser URL
  │
  ├─ http://localhost:3000/property/beautiful-london-flat
  └─ Split path: ["property", "beautiful-london-flat"]
  
Next.js Router
  │
  ├─ Match against files in pages/property/
  ├─ Find [slug].js
  └─ [slug] = "beautiful-london-flat"
  
getServerSideProps
  │
  ├─ Receive pageContext.query.slug
  └─ slug = "beautiful-london-flat"
  
GROQ Query
  │
  ├─ Build query: *[ _type == "property" && slug.current == $pageSlug ]
  ├─ Parameters: { pageSlug: "beautiful-london-flat" }
  └─ Fetch matching property
```

---

## Server-Side Rendering (SSR) Flow

```
User Request
  │
  ├─ HTTP GET /property/[slug]
  │
  ▼
Next.js Server
  │
  ├─ Match to pages/property/[slug].js
  ├─ Extract slug from URL
  │
  ▼
Execute getServerSideProps(pageContext)
  │
  ├─ pageContext.query.slug available
  ├─ Build Sanity query with slug parameter
  ├─ Fetch data from Sanity
  │
  ▼
Data Available
  │
  ├─ Validate response
  ├─ Check if property exists
  │
  ▼
Render Component (Node.js)
  │
  ├─ Property component receives props
  ├─ JSX converted to HTML string
  ├─ Complete DOM tree generated
  │
  ▼
Send HTML to Browser
  │
  ├─ HTTP 200 response
  ├─ Complete HTML document
  ├─ Full DOM tree already rendered
  │
  ▼
Browser Receives Response
  │
  ├─ Parse HTML immediately visible
  ├─ Load CSS
  ├─ React hydration
  ├─ Load JavaScript
  │
  ▼
Hydrated & Interactive
  │
  ├─ React attaches to DOM
  ├─ Event listeners functional
  ├─ Images start loading
  ├─ Maps initialize
  └─ Fully interactive
```

---

## Advantages of This Architecture

1. **Performance:**
   - HTML ready on first load
   - No blank page while fetching
   - Faster perceived load time

2. **SEO:**
   - Complete HTML in response
   - Search engines see all content
   - Good rankings for property listings

3. **Data Freshness:**
   - Latest data on every request
   - Real-time updates (no caching issues)

4. **Simplicity:**
   - Data fetching co-located with pages
   - Direct access to page context
   - No complex client-side state management

---

## Build vs. Request Time

**Current Architecture (SSR):**
- getServerSideProps runs: **On every request**
- Queries database: **On every request**
- Generation time: **Per-request (slower)**
- Caching: **Not applied**

**Could be optimized with ISR:**
- getStaticProps + revalidate: **Regenerate periodically**
- Faster subsequent requests
- Stale content briefly
- Better for high-traffic apps

**Could be optimized with Static:**
- getStaticProps + getStaticPaths: **Build time only**
- Instant responses
- No dynamic data per-request
- Need rebuild for data changes
