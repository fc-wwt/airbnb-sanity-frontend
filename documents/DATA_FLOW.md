# Data Flow Documentation

## Overview

This document describes how data flows through the AirBnB Sanity Frontend application, from user interaction through to page rendering.

## Data Flow Diagram

### Complete Request-Response Cycle

```
┌────────────────────────────────────────────────────────────────────┐
│                     USER INTERACTION LAYER                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Browser Tab                                                  │  │
│  │ • Home Page (/)                                              │  │
│  │ • Property Detail (/property/[slug])                         │  │
│  │ • User clicks links                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────┬─────────────────────────────────────────────────┘
                     │ HTTP GET Request
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS SERVER LAYER                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Page Router                                                  │  │
│  │ • Matches incoming URL to page file                          │  │
│  │ • Extracts route parameters (e.g., [slug])                   │  │
│  │ • Calls getServerSideProps                                   │  │
│  └──────┬───────────────────────────────────────────────────────┘  │
│         │                                                           │
│         ▼                                                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ getServerSideProps Function                                  │  │
│  │ • Receives pageContext with query/params                     │  │
│  │ • Builds Sanity GROQ queries                                 │  │
│  │ • Calls sanityClient.fetch()                                 │  │
│  │ • Returns props object                                       │  │
│  └──────┬───────────────────────────────────────────────────────┘  │
└─────────┼───────────────────────────────────────────────────────────┘
          │ GROQ Query Request
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SANITY.IO API LAYER                              │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ GROQ Query Engine                                              │ │
│  │ Example Query:                                                 │ │
│  │ *[ _type == "property"]{                                       │ │
│  │   ...,                                                         │ │
│  │   host->{...},                                                 │ │
│  │   reviews[]{..., traveller->{...}}                             │ │
│  │ }                                                              │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│           ▼                                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Content Lake (Database)                                        │ │
│  │ • Properties collection                                        │ │
│  │ • Host documents                                               │ │
│  │ • Review documents                                             │ │
│  │ • Traveller documents                                          │ │
│  │ • Image assets                                                 │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│           ▼                                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Response Builder                                               │ │
│  │ • Resolves all references (->)                                 │ │
│  │ • Embeds nested documents                                      │ │
│  │ • Returns JSON response                                        │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
└─────────┼────────────────────────────────────────────────────────────┘
          │ JSON Response
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  NEXT.JS SERVER LAYER (CONTINUED)                  │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Response Handler in getServerSideProps                         │ │
│  │ • Receives JSON from Sanity                                    │ │
│  │ • Validates/transforms data                                    │ │
│  │ • Returns { props: {...} }                                     │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│           ▼                                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ React Component Rendering (Server-Side)                        │ │
│  │ • Component receives props                                      │ │
│  │ • Renders JSX to HTML string                                    │ │
│  │ • Generates complete DOM tree                                   │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
└─────────┼────────────────────────────────────────────────────────────┘
          │ HTML Document
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER RENDERING                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ HTML Parser                                                    │ │
│  │ • Parses server-rendered HTML                                  │ │
│  │ • Builds initial DOM                                           │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│           ▼                                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ CSS Loading & Styling                                          │ │
│  │ • Load globals.css                                             │ │
│  │ • Parse component classes                                      │ │
│  │ • Apply styles to DOM                                          │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│           ▼                                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ React Hydration                                                │ │
│  │ • Client-side React attaches to server-rendered DOM            │ │
│  │ • Makes page interactive                                       │ │
│  │ • Sets up event listeners                                      │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│           ▼                                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Image Loading                                                  │ │
│  │ • urlFor() builder generates CDN URLs                           │ │
│  │ • Images lazy-load or load on demand                            │ │
│  │ • Sanity Image CDN serves optimized images                     │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│           ▼                                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Map Component Initialization                                   │ │
│  │ • useJsApiLoader loads Google Maps API                         │ │
│  │ • GoogleMap component mounts                                    │ │
│  │ • Markers render at property locations                         │ │
│  └────────┬─────────────────────────────────────────────────────┘ │
│           │                                                        │
│           ▼                                                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Complete, Interactive Page                                    │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Home Page Data Flow (Detailed)

```
START: User navigates to / or http://localhost:3000
│
├─ STEP 1: URL Matching
│  ├─ Next.js router matches "/" to pages/index.js
│  └─ Executes getServerSideProps()
│
├─ STEP 2: Data Fetching
│  ├─ GROQ Query: '*[ _type == "property"]'
│  ├─ Sanity returns array of all properties:
│  │  [
│  │    {
│  │      _id: "1",
│  │      title: "Beautiful London Flat",
│  │      slug: { current: "beautiful-london-flat" },
│  │      mainImage: { _type: "image", asset: {...} },
│  │      pricePerNight: 120,
│  │      reviews: [
│  │        { _key: "r1", rating: 5, traveller->{...} },
│  │        { _key: "r2", rating: 4, traveller->{...} }
│  │      ]
│  │    },
│  │    { ... more properties ... }
│  │  ]
│  └─ Returns { props: { properties: [...] } }
│
├─ STEP 3: Component Rendering (Server)
│  ├─ Home component receives properties prop
│  ├─ Maps over properties array
│  ├─ For each property:
│  │  ├─ <Link href={`property/${property.slug.current}`}>
│  │  ├─ <Image src={urlFor(property.mainImage)} />
│  │  ├─ Display review count: property.reviews.length
│  │  ├─ Display title: property.title
│  │  └─ Display price: property.pricePerNight
│  └─ Returns complete HTML
│
├─ STEP 4: Map Component Rendering
│  ├─ DashboardMap receives properties array
│  ├─ useJsApiLoader({ googleMapsApiKey: ... })
│  ├─ GoogleMap loads with center = properties[0].location
│  ├─ For each property:
│  │  └─ Marker at { lat: property.location.lat, lng: property.location.lng }
│  └─ Renders interactive map
│
├─ STEP 5: HTML Sent to Browser
│  └─ Complete HTML document with:
│     ├─ All property cards rendered
│     ├─ Images URLs pointing to Sanity CDN
│     ├─ Map iframe (if Google Maps JS loaded)
│     └─ CSS classes applied
│
├─ STEP 6: Browser Processing
│  ├─ Parse HTML
│  ├─ Load CSS from styles/globals.css
│  ├─ Start loading images from Sanity Image CDN
│  ├─ React hydration
│  ├─ Attach event listeners
│  └─ Load Google Maps JavaScript library
│
└─ END: Interactive page with clickable property cards and live map
```

## Property Detail Page Data Flow (Detailed)

```
START: User clicks on property card
│      URL: /property/beautiful-london-flat
│
├─ STEP 1: URL Matching
│  ├─ Next.js router matches /property/[slug] to pages/property/[slug].js
│  ├─ pageContext.query.slug = "beautiful-london-flat"
│  └─ Executes getServerSideProps(pageContext)
│
├─ STEP 2: Parametrized Data Fetching
│  ├─ GROQ Query with parameter:
│  │  *[ _type == "property" && slug.current == $pageSlug][0]{
│  │    title,
│  │    location,
│  │    propertyType,
│  │    mainImage,
│  │    images,
│  │    pricePerNight,
│  │    beds,
│  │    bedrooms,
│  │    description,
│  │    host->{
│  │      _id,
│  │      name,
│  │      slug,
│  │      image
│  │    },
│  │    reviews[]{
│  │      ...,
│  │      traveller->{
│  │        _id,
│  │        name,
│  │        slug,
│  │        image
│  │      }
│  │    }
│  │  }
│  │
│  ├─ Parameters: { pageSlug: "beautiful-london-flat" }
│  │
│  ├─ Sanity returns single property object:
│  │  {
│  │    _id: "1",
│  │    title: "Beautiful London Flat",
│  │    location: { lat: 51.5074, lng: -0.1278 },
│  │    propertyType: "Entire apartment",
│  │    mainImage: { _type: "image", asset: {...} },
│  │    images: [
│  │      { _key: "img1", asset: {...} },
│  │      { _key: "img2", asset: {...} }
│  │    ],
│  │    pricePerNight: 120,
│  │    beds: 2,
│  │    bedrooms: 1,
│  │    description: "Beautiful flat in central London...",
│  │    host: {
│  │      _id: "host1",
│  │      name: "Jane Doe",
│  │      slug: { current: "jane-doe" },
│  │      image: { _type: "image", asset: {...} }
│  │    },
│  │    reviews: [
│  │      {
│  │        _key: "r1",
│  │        rating: 5,
│  │        traveller: {
│  │          _id: "t1",
│  │          name: "John Smith",
│  │          slug: { current: "john-smith" },
│  │          image: { _type: "image", asset: {...} }
│  │        }
│  │      },
│  │      { ... more reviews ... }
│  │    ]
│  │  }
│  │
│  └─ Extracts and returns props:
│     { props: { title, location, propertyType, ... } }
│
├─ STEP 3: Component Rendering (Server)
│  ├─ Property component receives props
│  ├─ Renders title: {title}
│  ├─ Calculates reviewAmount = reviews.length
│  ├─ Renders main image:
│  │  <Image image={mainImage} />
│  │  └─> urlFor(mainImage).auto("format")
│  ├─ Maps over images array for sub-images:
│  │  {images.map(({_key, asset}) => 
│  │    <Image image={asset} />)}
│  ├─ Renders host info: "Apartment hosted by {host.name}"
│  ├─ Renders price box: "£{pricePerNight}"
│  ├─ Renders description
│  ├─ Maps over reviews array:
│  │  {reviews.map((review) => 
│  │    <Review review={review} />)}
│  │  └─> Renders traveller image: 
│  │      urlFor(review.traveller.image)
│  │        .width(50).height(50)
│  │        .crop("focalpoint").auto("format")
│  └─ Renders Map component with location
│     └─> Marker at { lat: location.lat, lng: location.lng }
│
├─ STEP 4: Image URL Generation
│  ├─ For main image:
│  │  urlFor(mainImage).auto("format")
│  │  └─> https://cdn.sanity.io/images/.../...?auto=format
│  ├─ For sub-images (same pattern)
│  ├─ For traveller avatars:
│  │  urlFor(image).width(50).height(50)
│  │    .crop("focalpoint").auto("format")
│  │  └─> https://cdn.sanity.io/images/.../...?w=50&h=50&crop=focalpoint&auto=format
│  └─ All URLs point to Sanity's image CDN
│
├─ STEP 5: HTML Sent to Browser
│  └─ Complete property detail HTML with:
│     ├─ All text content
│     ├─ Image URLs
│     ├─ Map placeholder
│     └─ Styling classes
│
├─ STEP 6: Browser Processing
│  ├─ Parse HTML
│  ├─ Request and download all images from Sanity CDN
│  ├─ Load and apply CSS
│  ├─ React hydration
│  ├─ Load Google Maps JavaScript
│  ├─ Map renders with single location marker
│  └─ Images display as they load
│
└─ END: Interactive property detail page with:
      ├─ High-quality optimized images
      ├─ Host information
      ├─ All reviews with traveller info
      ├─ Interactive map showing property location
      └─ Click handlers for navigation
```

## Image Loading Flow

```
Image Reference in Sanity
        │
        ├─ Asset ID: image-abc123
        ├─ Dimensions: 1920x1080
        └─ Format: JPG
        
        ▼
        
urlFor(imageReference)
        │
        ├─ .auto("format")  → Auto-select WebP for Chrome, JPG for Safari
        ├─ .width(50)       → Resize to 50px (optional)
        ├─ .height(50)      → Resize to 50px (optional)
        ├─ .crop("focalpoint") → Auto-crop to face (optional)
        └─ [.url()]         → Generate full CDN URL
        
        ▼
        
CDN URL: https://cdn.sanity.io/images/
         abc123/production/image-abc123.jpg?w=50&h=50&crop=focalpoint&auto=format
        
        ▼
        
Browser Request to Sanity Image CDN
        │
        ├─ Check cache
        ├─ Generate variant if needed
        └─ Serve optimized image
        
        ▼
        
Image Downloaded and Rendered
```

## Sanity Query Flow

```
GROQ Query String (in JavaScript)
        │
        ├─ Example: '*[ _type == "property"]'
        │   - * = all documents
        │   - [ ... ] = filter
        │   - _type == "property" = only properties
        │
        └─ Example: '*[ _type == "property" && slug.current == $pageSlug][0]'
           - && = AND condition
           - $pageSlug = parameter (passed separately)
           - [0] = get first result
        
        ▼
        
sanityClient.fetch(query, parameters)
        │
        ├─ Query: GROQ string
        ├─ Parameters: { pageSlug: "sample" }
        └─ Config:
           ├─ useCdn: true (production) / false (development)
           ├─ projectId: from environment variable
           └─ dataset: "production" or "development"
        
        ▼
        
HTTP POST to https://api.sanity.io/v2021-06-07/...
        │
        ├─ Body: { query, params }
        ├─ Headers: Authorization (if authenticated)
        └─ Timeout: typically 10-30 seconds
        
        ▼
        
Sanity Query Engine
        │
        ├─ Parse GROQ
        ├─ Optimize query plan
        ├─ Fetch from content lake
        ├─ Resolve references (-> operator)
        ├─ Apply projections
        └─ Build result
        
        ▼
        
JSON Response
        │
        ├─ Success: { result: {...} } or { result: [...] }
        └─ Error: { error: { message: "...", code: "..." } }
        
        ▼
        
JavaScript Promise resolves with data
        │
        └─ Data ready for component rendering
```

## Reference Resolution

When Sanity encounters a reference (denoted by `->` in GROQ):

```
Document in Sanity:
{
  _id: "property1",
  _type: "property",
  title: "Beautiful Flat",
  host: {
    _ref: "host1",
    _type: "reference"
  }
}

        ▼ (Reference NOT resolved)

Query without ->:
*[ _type == "property" ]
        ▼
Result:
{
  _id: "property1",
  host: { _ref: "host1", _type: "reference" }  ← Still a reference
}

        ▼ (Reference RESOLVED)

Query with ->:
*[ _type == "property" ] { ..., host->{ ... } }
        ▼
Sanity automatically:
1. Finds document with _id = "host1"
2. Embeds entire host document
3. Returns complete nested object
        ▼
Result:
{
  _id: "property1",
  host: {
    _id: "host1",
    _type: "person",
    name: "Jane Doe",
    image: { _type: "image", asset: {...} },
    slug: { current: "jane-doe" }
  }  ← Fully populated
}
```

## Error Handling Flow

```
Data Fetch Error (Network, Auth, etc.)
        │
        ├─ getServerSideProps catches error
        │  
        ├─ Check error type:
        │  ├─ Network error → Retry or return empty
        │  ├─ Not found → return { notFound: true }
        │  ├─ Auth error → Redirect or return error
        │  └─ Other → Log and return default
        │
        ├─ Property Detail (slug not found):
        │  ├─ Query returns null
        │  └─ return { props: null, notFound: true }
        │     → Next.js renders 404 page
        │
        └─ Home Page (no properties):
           ├─ Query returns empty array []
           └─ return { props: { properties: [] } }
              → Component renders empty state
```

## Real-Time Updates

**Note:** This application does NOT implement real-time updates. To add real-time capabilities:

```
Current: Static at request time
  └─ getServerSideProps fetches once per request

Future: Could implement real-time with:
  ├─ Sanity webhooks → trigger rebuild
  ├─ Client-side polling → refetch periodically
  ├─ WebSocket subscription → listen for changes
  └─ NEXT.js ISR → revalidate in background
```
