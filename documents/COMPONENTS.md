# Components Documentation

## Overview

The application is composed of reusable React components that handle different aspects of the UI. This document provides detailed information about each component.

## Component Tree

```
_app.js (Custom App Wrapper)
│
├── NavBar (Global Navigation)
│   └── Static navbar displayed on every page
│
└── Pages (Current Route)
    │
    ├── index.js (Home/Listing Page)
    │   ├── DashboardMap (Map with property markers)
    │   │   └── GoogleMap (Google Maps component)
    │   │       └── Marker (Multiple markers)
    │   │
    │   └── Property Cards (Mapped from array)
    │       └── Link (Next.js link for navigation)
    │
    └── property/[slug].js (Detail Page)
        ├── Image (Main property image)
        ├── Image (Sub-images in grid)
        ├── Host information section
        ├── Price box
        ├── Review (Mapped from reviews array)
        │   └── Image (Traveller avatar)
        └── Map (Single location marker)
            └── GoogleMap (Google Maps component)
                └── Marker (Single marker)
```

## Component Details

### 1. NavBar Component

**File:** `components/NavBar.js`

**Purpose:** Global navigation component displayed on all pages

**Props:** None

**Description:**
```jsx
const NavBar = () => {
  return (
    <div className="nav">
      <div className="logo"></div>
    </div>
  )
}
```

**Features:**
- Simple navigation bar
- Logo container (currently empty, can be populated with image/text)
- Displayed via `_app.js` wrapper

**Styling:**
- Uses `.nav` class from `globals.css`
- Logo styled with `.logo` class

**Usage:**
Automatically included on every page through `_app.js`.

---

### 2. DashboardMap Component

**File:** `components/DashboardMap.js`

**Purpose:** Interactive map showing multiple property locations

**Props:**
```typescript
interface Props {
  properties: Property[]  // Array of property objects with location data
}
```

**Key Features:**

1. **Hook Setup:**
   ```
   useJsApiLoader()
   - Loads Google Maps JavaScript API
   - Called with googleMapsApiKey environment variable
   - Returns { isLoaded } boolean
   ```

2. **Map Container:**
   - Width: 100%
   - Height: 100vh (full viewport height)

3. **Map Initialization:**
   - Center: First property location (properties[0])
   - Zoom level: 10

4. **Markers:**
   - Rendered for each property
   - Position: property.location.lat/lng
   - Custom icon: Beach flag image

5. **React Hooks:**
   ```
   onLoad(): Runs when map loads
   - Creates LatLngBounds
   - Fits bounds (currently empty)
   
   onUnmount(): Runs when component unmounts
   - Cleans up map reference
   ```

6. **Memoization:**
   - Wrapped in React.memo to prevent unnecessary re-renders
   - Performance optimization for expensive map rendering

**Data Flow:**
```
properties array
    │
    ├─ Extract first location for center
    ├─ Create marker for each property
    │  └─ lat/lng from property.location
    └─ Render interactive map
```

**Rendering:**
- Conditional: Only renders if `isLoaded === true`
- Returns empty fragment if Google Maps not loaded

---

### 3. Map Component

**File:** `components/Map.js`

**Purpose:** Single location map for property detail page

**Props:**
```typescript
interface Props {
  location: {
    lat: number
    lng: number
  }
}
```

**Differences from DashboardMap:**

1. **Container Size:**
   - Width: 100%
   - Height: 400px (fixed height)

2. **Single Location:**
   - Center: Passed location prop
   - One marker at location

3. **Usage:**
   - Detail page only
   - Shows exact property location

4. **Similarities:**
   - Same Google Maps API integration
   - Same hook setup
   - Same marker styling
   - React.memo wrapped

**Data Flow:**
```
location prop { lat, lng }
    │
    ├─ Set as map center
    ├─ Create single marker
    └─ Render fixed-height map
```

---

### 4. Image Component

**File:** `components/Image.js`

**Purpose:** Optimized image rendering with Sanity image URLs

**Props:**
```typescript
interface Props {
  identifier: "main-image" | "image"
  image: {
    _type: "image"
    asset: { _id: string, url: string }
  }
}
```

**Features:**

1. **URL Building:**
   ```javascript
   urlFor(image).auto("format")
   ```
   - Generates Sanity image CDN URL
   - Auto selects format (WebP for Chrome, JPG for Safari)

2. **Styling:**
   ```javascript
   className={identifier === "main-image" ? "main-image" : "image"}
   ```
   - "main-image" for hero image (full width)
   - "image" for grid images

3. **Image Optimization:**
   - CDN handles resize/crop
   - Browser-specific format selection
   - Lazy loading implicit through img tag

**Usage Examples:**

Main image:
```jsx
<Image identifier="main-image" image={mainImage} />
```

Sub-images:
```jsx
{images.map(({ _key, asset }) => (
  <Image key={_key} identifier="image" image={asset} />
))}
```

---

### 5. Review Component

**File:** `components/Review.js`

**Purpose:** Display individual review with traveller information

**Props:**
```typescript
interface Props {
  review: {
    rating: number
    traveller: {
      name: string
      image: { _type: "image", asset: {...} }
    }
  }
}
```

**Features:**

1. **Traveller Avatar:**
   ```javascript
   urlFor(review.traveller.image)
     .width(50)
     .height(50)
     .crop("focalpoint")
     .auto("format")
   ```
   - 50x50 pixel square
   - Auto-crops to face (focalpoint)
   - Browser-optimized format

2. **Review Information:**
   - Rating: Numerical display
   - Name: Traveller name
   - Avatar: Optimized image

3. **Styling:**
   - Uses `.review-box` class

**Data Flow:**
```
review object
    │
    ├─ rating → Display
    ├─ traveller.name → Display
    └─ traveller.image → urlFor() → Display
```

**Usage:**
```jsx
{reviews.map((review) => (
  <Review key={review._key} review={review} />
))}
```

---

## Component Lifecycle Flows

### DashboardMap/Map Lifecycle

```
Mount
  │
  ├─ useJsApiLoader() fetches Google Maps API
  │
  ├─ GoogleMap component initializes
  │
  ├─ onLoad callback fires
  │  └─ Creates bounds, sets up map
  │
  ├─ Markers render at property locations
  │
  └─ useJsApiLoader returns { isLoaded: true }
     └─ Component renders maps to DOM

Update (Props change)
  │
  ├─ React.memo checks if properties changed
  │
  ├─ If changed:
  │  ├─ Re-render markers
  │  └─ Update map bounds
  │
  └─ If same:
     └─ Skip render (optimization)

Unmount
  │
  ├─ onUnmount callback fires
  │  └─ Clears map reference
  │
  └─ Component removed from DOM
```

### Image Component Lifecycle

```
Mount
  ├─ Generate urlFor() URL
  └─ Render img tag
       │
       ├─ Browser begins image download
       ├─ Sanity CDN processes image
       │  ├─ Resizes if needed
       │  ├─ Converts format if needed
       │  └─ Serves optimized version
       │
       └─ Image displays when loaded

Update (Different image)
  ├─ New urlFor() URL generated
  ├─ New img src set
  └─ Browser downloads new image

Unmount
  └─ Component removed
     └─ Browser stops image transfer if in progress
```

### Review Component Lifecycle

```
Mount
  ├─ Generate avatar URL with:
  │  ├─ width(50)
  │  ├─ height(50)
  │  ├─ crop("focalpoint")
  │  └─ auto("format")
  │
  ├─ Render review box with:
  │  ├─ Rating text
  │  ├─ Traveller name
  │  └─ Avatar image
  │
  └─ Avatar image loads from CDN

Update (Different review)
  └─ All content re-renders

Unmount
  └─ Component removed
```

---

## Props Flow Diagram

### Home Page Props Flow

```
getServerSideProps()
  │
  ├─ Fetches properties from Sanity
  │
  ▼
return { props: { properties: [...] } }
  │
  ▼
Home Component
  │
  ├─ Passes to DashboardMap:
  │  └─ properties={properties}
  │
  └─ Maps properties:
     └─ Passes to Image:
        └─ image={property.mainImage}
```

### Detail Page Props Flow

```
getServerSideProps()
  │
  ├─ Fetches single property from Sanity
  │ └─ Includes host reference resolution
  │ └─ Includes reviews with traveller references
  │
  ▼
return { 
  props: {
    title, location, propertyType, mainImage,
    images, pricePerNight, beds, bedrooms,
    description, host, reviews
  }
}
  │
  ▼
Property Component receives all props
  │
  ├─ Passes to Image:
  │  ├─ image={mainImage}
  │  └─ image={asset} for each in images
  │
  ├─ Passes to Map:
  │  └─ location={location}
  │
  ├─ Maps reviews:
  │  └─ Passes to Review:
  │     └─ review={review}
  │
  └─ Host prop used in JSX
     └─ host.name, host.image (if used)
```

---

## Key Implementation Patterns

### 1. URL Building Pattern

Used throughout for consistent image optimization:

```javascript
// Basic
urlFor(imageRef)

// With transformations
urlFor(imageRef)
  .width(100)
  .height(100)
  .crop("focalpoint")
  .auto("format")
  .url()  // Explicit URL generation

// Implicit URL conversion
urlFor(imageRef).auto("format")  // Returns URL string directly
```

### 2. Mapping Pattern

Components render arrays using `.map()`:

```javascript
// Images
{images.map(({ _key, asset }) => (
  <Image key={_key} identifier="image" image={asset} />
))}

// Reviews
{reviews.map((review) => (
  <Review key={review._key} review={review} />
))}

// Property cards
{properties.map((property) => (
  <Link href={`property/${property.slug.current}`}>
    <div key={property._id} className="card">
      {/* Card content */}
    </div>
  </Link>
))}
```

### 3. Conditional Rendering Pattern

Used for API-dependent rendering:

```javascript
// Wait for Google Maps API
return isLoaded ? (
  <GoogleMap>
    {/* Map content */}
  </GoogleMap>
) : (
  <></>  // Empty fragment while loading
)

// Check for data
return properties && (
  <div className="main">
    {/* Page content */}
  </div>
)
```

### 4. React.memo Optimization

Applied to expensive components:

```javascript
export default React.memo(DashboardMap)
export default React.memo(Map)
```

Prevents re-renders when parent updates but props stay same.

---

## Component Interaction Diagram

```
User Interaction
  │
  ├─ Click property card
  │  └─ Next.js Link navigates to /property/[slug]
  │
  ├─ Page loads
  │  └─ getServerSideProps fetches detail
  │
  ├─ Detail page renders
  │  ├─ Images load from CDN
  │  ├─ Map initializes
  │  ├─ Reviews display
  │  └─ Interactive page ready
  │
  ├─ User views property
  │  ├─ Scroll triggers lazy-load of images
  │  ├─ Click "Change Dates" button
  │  │  └─ Navigates back to home
  │  └─ Interact with map
  │
  └─ Return to home
     └─ getServerSideProps fetches properties
        └─ Home renders with DashboardMap
           └─ Interactive property browsing

```

---

## Environment Dependencies

Components depend on these environment variables:

```
NEXT_PUBLIC_SANITY_DATASET
  └─ Used in: sanity.js (affects all components accessing data)

NEXT_PUBLIC_SANITY_PROJECT_ID
  └─ Used in: sanity.js (affects all components accessing data)

googlePlacesAPI
  └─ Used in: DashboardMap.js, Map.js
     └─ Loads Google Maps JavaScript API
```

---

## Common Component Issues & Solutions

### Issue: Images not loading

**Solution:**
1. Check imageReference has `asset` property
2. Verify Sanity project ID and dataset in environment
3. Check CORS settings in Sanity project
4. Verify image asset exists in Sanity

### Issue: Map not displaying

**Solution:**
1. Verify `googlePlacesAPI` environment variable set
2. Check API key has Maps API enabled
3. Verify location data has valid lat/lng numbers
4. Check console for Google Maps errors

### Issue: Reviews not showing

**Solution:**
1. Verify reviews array exists in property
2. Check traveller references resolved (use `->` in query)
3. Verify traveller image URLs are valid

### Issue: Component re-rendering too often

**Solution:**
1. Check if using React.memo on expensive components
2. Verify unnecessary prop changes
3. Check useCallback dependencies in hooks
4. Use React DevTools Profiler to identify bottleneck
