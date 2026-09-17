# Technical Architecture Overview

## System Architecture

This document provides a comprehensive technical architecture overview for all 5 proposed features, including system design, technology stack, data flow, and integration points.

---

## High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        A[Next.js Frontend]
        B[React Components]
        C[Context Providers]
        D[Service Workers]
    end
    
    subgraph API["API Layer"]
        E[Next.js API Routes]
        F[Authentication Middleware]
        G[Rate Limiting]
        H[Validation Layer]
    end
    
    subgraph Services["Service Layer"]
        I[Search Service]
        J[Booking Service]
        K[Recommendation Engine]
        L[Analytics Service]
        M[Virtual Tour Service]
    end
    
    subgraph External["External Services"]
        N[Auth0/Firebase]
        O[Stripe Payment]
        P[SendGrid Email]
        Q[CDN - Cloudinary]
        R[Analytics - GA4]
    end
    
    subgraph Data["Data Layer"]
        S[Sanity CMS]
        T[Redis Cache]
        U[PostgreSQL - Analytics]
    end
    
    A --> E
    B --> C
    C --> E
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J
    H --> K
    H --> L
    H --> M
    
    I --> S
    J --> S
    K --> S
    L --> U
    M --> Q
    
    F --> N
    J --> O
    J --> P
    M --> Q
    L --> R
    
    I --> T
    K --> T
    
    style Client fill:#e1f5ff
    style API fill:#fff4e1
    style Services fill:#f0e1ff
    style External fill:#e1ffe1
    style Data fill:#ffe1e1
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **State Management:** React Context API + Zustand (for complex state)
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Fetch API with custom wrapper
- **Date Handling:** date-fns
- **Virtual Tours:** Pannellum.js
- **Maps:** Mapbox GL JS
- **Charts:** Recharts
- **Testing:** Jest + React Testing Library + Playwright

### Backend
- **Runtime:** Node.js 20+
- **API:** Next.js API Routes (serverless)
- **CMS:** Sanity.io
- **Authentication:** Auth0 or Firebase Auth
- **Payment:** Stripe
- **Email:** SendGrid
- **File Storage:** Cloudinary or AWS S3
- **Caching:** Redis (Upstash for serverless)
- **Analytics DB:** PostgreSQL (Supabase)

### DevOps & Infrastructure
- **Hosting:** Vercel (Next.js) + Sanity Cloud
- **CDN:** Vercel Edge Network + Cloudinary
- **Monitoring:** Sentry (errors) + Vercel Analytics
- **CI/CD:** GitHub Actions
- **Environment:** Docker (local development)

---

## Data Architecture

### Sanity CMS Schema Overview

```mermaid
erDiagram
    PROPERTY ||--o{ BOOKING : has
    PROPERTY ||--o{ REVIEW : has
    PROPERTY }o--|| HOST : "owned by"
    PROPERTY }o--o{ AMENITY : includes
    PROPERTY ||--o| VIRTUAL_TOUR : has
    USER ||--o{ BOOKING : makes
    USER ||--o{ REVIEW : writes
    USER ||--|| USER_PREFERENCES : has
    BOOKING }o--|| PAYMENT : has
    
    PROPERTY {
        string id PK
        string title
        string slug
        number price
        string location
        string propertyType
        number bedrooms
        number bathrooms
        number guests
        object mainImage
        array images
        number rating
        number reviewCount
        text description
        object availability
    }
    
    USER {
        string id PK
        string authId
        string email
        string name
        string phone
        object photo
        boolean emailVerified
        object preferences
    }
    
    BOOKING {
        string id PK
        string bookingReference
        reference property FK
        reference user FK
        date checkIn
        date checkOut
        object guests
        object guestDetails
        object pricing
        string status
        string paymentId
    }
    
    AMENITY {
        string id PK
        string title
        string slug
        string category
        string icon
    }
    
    VIRTUAL_TOUR {
        boolean enabled
        array rooms
        object floorPlan
        file ambientAudio
    }
    
    USER_PREFERENCES {
        object priceRange
        array propertyTypes
        array amenities
        array locations
        string travelStyle
    }
```

---

## Feature-Specific Architecture

### Feature 1: Advanced Search & Filtering

```mermaid
sequenceDiagram
    participant U as User
    participant C as SearchComponent
    participant CTX as SearchContext
    participant API as API Route
    participant S as Sanity CMS
    participant R as Redis Cache
    
    U->>C: Enter search criteria
    C->>CTX: Update filters
    CTX->>CTX: Build query params
    CTX->>API: GET /api/search?filters=...
    
    API->>R: Check cache
    alt Cache Hit
        R-->>API: Return cached results
    else Cache Miss
        API->>S: Execute GROQ query
        S-->>API: Return properties
        API->>R: Cache results (5 min)
    end
    
    API-->>CTX: Return results
    CTX-->>C: Update UI
    C-->>U: Display results
```

**Key Components:**
- `SearchContext`: Global search state
- `FilterPanel`: UI for all filters
- `useSearch` hook: Search logic and API calls
- `useUrlState` hook: URL synchronization
- GROQ query builder: Dynamic query construction

**Performance Optimizations:**
- Debounced filter updates (300ms)
- Redis caching (5 minutes)
- Indexed Sanity fields
- Virtual scrolling for results
- Lazy loading of images

---

### Feature 2: User Authentication & Booking

```mermaid
sequenceDiagram
    participant U as User
    participant UI as BookingFlow
    participant Auth as AuthContext
    participant API as API Route
    participant A0 as Auth0
    participant Stripe as Stripe API
    participant S as Sanity CMS
    participant Email as SendGrid
    
    U->>UI: Start booking
    UI->>Auth: Check authentication
    
    alt Not Authenticated
        Auth->>A0: Redirect to login
        A0-->>Auth: Return JWT token
    end
    
    U->>UI: Select dates & guests
    U->>UI: Enter guest details
    U->>UI: Submit payment
    
    UI->>API: POST /api/bookings/create
    API->>Stripe: Create payment intent
    Stripe-->>API: Return client secret
    
    API->>UI: Return payment intent
    UI->>Stripe: Confirm payment
    Stripe-->>UI: Payment successful
    
    UI->>API: POST /api/bookings/confirm
    API->>S: Create booking document
    S-->>API: Booking created
    
    API->>Email: Send confirmation
    Email-->>U: Confirmation email
    
    API-->>UI: Booking confirmed
    UI-->>U: Show confirmation
```

**Key Components:**
- `AuthContext`: User authentication state
- `BookingContext`: Booking flow state
- `PaymentForm`: Stripe Elements integration
- Protected API routes with JWT verification
- Webhook handlers for payment events

**Security Measures:**
- JWT tokens (15 min access, 7 day refresh)
- HTTP-only cookies
- CSRF protection
- Rate limiting on auth endpoints
- PCI-compliant payment handling
- Input validation and sanitization

---

### Feature 3: Property Comparison

```mermaid
flowchart LR
    A[Property Card] -->|Add| B[ComparisonContext]
    C[Property Details] -->|Add| B
    
    B -->|Store| D[LocalStorage]
    B -->|Update| E[ComparisonBar]
    
    E -->|Click Compare| F[ComparisonView]
    
    F -->|Fetch Data| G[API Route]
    G -->|Query| H[Sanity CMS]
    H -->|Return| G
    G -->|Return| F
    
    F -->|Analyze| I[DifferenceDetector]
    I -->|Highlight| J[ComparisonTable]
    
    J -->|Book| K[BookingFlow]
    J -->|Remove| B
    
    style B fill:#e1f5ff
    style I fill:#fff4e1
```

**Key Components:**
- `ComparisonContext`: Manages comparison state (max 4 properties)
- `ComparisonBar`: Sticky bottom bar
- `ComparisonTable`: Side-by-side view
- `DifferenceHighlighter`: Algorithm to detect and highlight differences
- LocalStorage persistence (7 days)

**Data Flow:**
1. User adds property to comparison
2. Property ID stored in context and localStorage
3. Comparison bar updates with thumbnail
4. On "Compare" click, fetch full property data
5. Analyze differences and render table
6. User can book or remove properties

---

### Feature 4: Interactive Virtual Tours

```mermaid
flowchart TD
    A[Property Page] --> B{Has Virtual Tour?}
    
    B -->|Yes| C[VirtualTourViewer]
    B -->|No| D[Photo Gallery]
    
    C --> E[PanoramaViewer]
    C --> F[FloorPlanViewer]
    
    E --> G[Pannellum Library]
    G --> H[Load 360° Image]
    H --> I[CDN - Cloudinary]
    
    E --> J[Render Hotspots]
    J --> K{Hotspot Type}
    
    K -->|Navigation| L[Navigate to Room]
    K -->|Info| M[Show Info Modal]
    
    L --> E
    
    F --> N[SVG Floor Plan]
    N --> O[Interactive Rooms]
    O --> P{Click Room}
    P --> E
    
    C --> Q[TourControls]
    Q --> R[Fullscreen]
    Q --> S[Auto-rotate]
    Q --> T[VR Mode]
    
    C --> U[Analytics Tracking]
    U --> V[Track Events]
    
    style G fill:#e1f5ff
    style I fill:#fff4e1
```

**Key Components:**
- `VirtualTourViewer`: Main container
- `PanoramaViewer`: 360° panorama display (Pannellum)
- `FloorPlanViewer`: Interactive SVG floor plan
- `TourControls`: Fullscreen, zoom, auto-rotate, VR
- `NavigationHotspot`: Click to move between rooms
- `InfoHotspot`: Click to see feature details

**Image Pipeline:**
1. Host uploads 360° images to Sanity
2. Sanity processes and stores in Cloudinary
3. Images served via CDN with optimization
4. Progressive loading (low-res → high-res)
5. Preload adjacent rooms for smooth transitions

**Performance:**
- Lazy load panoramas (only current room)
- WebGL acceleration
- Image compression (WebP with JPEG fallback)
- Preload next likely room based on hotspots
- Dispose of unused WebGL contexts

---

### Feature 5: Smart Recommendations

```mermaid
flowchart TB
    subgraph Tracking["Event Tracking"]
        A[User Actions] --> B[Track Event]
        B --> C[Analytics API]
        C --> D[PostgreSQL]
    end
    
    subgraph Processing["Data Processing"]
        D --> E[Batch Job - Daily]
        E --> F[User Behavior Analysis]
        E --> G[Property Similarity Matrix]
        E --> H[Popularity Scores]
    end
    
    subgraph Algorithms["Recommendation Algorithms"]
        I[Recommendation Request] --> J{User Type}
        
        J -->|Logged In| K[Collaborative Filtering]
        J -->|Anonymous| L[Popularity-Based]
        
        K --> M[Similar Users]
        M --> N[Their Preferences]
        
        I --> O[Content-Based Filtering]
        O --> P[Property Features]
        P --> Q[Similarity Calculation]
        
        I --> R[Contextual Filtering]
        R --> S[Time/Location/Device]
        
        N --> T[Hybrid Scoring]
        Q --> T
        H --> T
        S --> T
    end
    
    subgraph Delivery["Recommendation Delivery"]
        T --> U[Ranked Results]
        U --> V[Cache - Redis]
        V --> W[API Response]
        W --> X[UI Components]
    end
    
    style F fill:#e1f5ff
    style T fill:#fff4e1
    style V fill:#f0e1ff
```

**Recommendation Pipeline:**

1. **Event Tracking:**
   - Track user interactions (views, clicks, searches, bookings)
   - Store in PostgreSQL with timestamp and metadata
   - Real-time updates to user session profile

2. **Batch Processing (Daily):**
   - Analyze user behavior patterns
   - Calculate user similarity scores
   - Build property similarity matrix
   - Update popularity scores with time decay

3. **Real-Time Recommendation:**
   - Receive recommendation request
   - Check Redis cache (1 hour TTL)
   - If cache miss, run algorithms:
     - Collaborative filtering (35% weight)
     - Content-based filtering (30% weight)
     - Popularity-based (20% weight)
     - Contextual (15% weight)
   - Combine scores and rank
   - Apply diversity filter
   - Cache and return results

4. **Delivery:**
   - Homepage: "Recommended for You"
   - Property page: "Similar Properties"
   - Search results: Personalized ranking
   - Email: Weekly recommendations

**Key Algorithms:**

```typescript
// Collaborative Filtering
function findSimilarUsers(userId: string): User[] {
  // Cosine similarity on user-item interaction matrix
  // Return top 10 similar users
}

// Content-Based Filtering
function calculatePropertySimilarity(propA: Property, propB: Property): number {
  // Feature vector: [price, bedrooms, bathrooms, guests, amenities, location, rating]
  // Cosine similarity between vectors
}

// Hybrid Scoring
function hybridScore(property: Property, context: Context): number {
  return (
    collaborativeScore * 0.35 +
    contentScore * 0.30 +
    popularityScore * 0.20 +
    contextualScore * 0.15
  );
}
```

---

## API Endpoints

### Search & Filtering
```
GET  /api/search
     ?location=paris
     &priceMin=100
     &priceMax=500
     &checkIn=2024-06-01
     &checkOut=2024-06-07
     &guests=4
     &propertyTypes=apartment,house
     &amenities=wifi,pool
     &sort=price-asc
     &page=1
     &limit=20
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/verify-email
```

### User Profile
```
GET    /api/users/me
PATCH  /api/users/me
DELETE /api/users/me
POST   /api/users/me/photo
PATCH  /api/users/me/preferences
```

### Bookings
```
POST   /api/bookings/create
GET    /api/bookings/:id
GET    /api/bookings/user/:userId
PATCH  /api/bookings/:id/cancel
POST   /api/bookings/:id/confirm
GET    /api/bookings/:id/receipt
```

### Payments
```
POST /api/payments/create-intent
POST /api/payments/confirm
POST /api/webhooks/stripe
```

### Comparison
```
POST /api/comparison/add
POST /api/comparison/remove
GET  /api/comparison?ids=id1,id2,id3
```

### Virtual Tours
```
GET /api/virtual-tours/:propertyId
POST /api/virtual-tours/track-event
GET /api/virtual-tours/:propertyId/analytics
```

### Recommendations
```
GET /api/recommendations/personalized
    ?userId=xxx&limit=12
GET /api/recommendations/similar
    ?propertyId=xxx&limit=6
GET /api/recommendations/trending
    ?location=paris&limit=12
GET /api/recommendations/users-also-viewed
    ?propertyId=xxx&limit=6
```

### Analytics
```
POST /api/analytics/track
GET  /api/analytics/dashboard
GET  /api/analytics/property/:id
```

---

## Caching Strategy

### Redis Cache Layers

```typescript
// Cache keys and TTLs
const CACHE_CONFIG = {
  // Search results
  'search:{query_hash}': 300, // 5 minutes
  
  // Property details
  'property:{id}': 3600, // 1 hour
  
  // User profile
  'user:{id}': 1800, // 30 minutes
  
  // Recommendations
  'recommendations:personalized:{userId}': 3600, // 1 hour
  'recommendations:similar:{propertyId}': 7200, // 2 hours
  'recommendations:trending:{location}': 1800, // 30 minutes
  
  // Comparison data
  'comparison:{propertyIds}': 3600, // 1 hour
  
  // Virtual tour data
  'virtual-tour:{propertyId}': 86400, // 24 hours
  
  // Analytics aggregates
  'analytics:property:{id}:daily': 3600, // 1 hour
};
```

### Cache Invalidation

```typescript
// Invalidate on updates
async function invalidatePropertyCache(propertyId: string) {
  await redis.del(`property:${propertyId}`);
  await redis.del(`virtual-tour:${propertyId}`);
  await redis.del(`recommendations:similar:${propertyId}`);
  // Invalidate search results containing this property
  await redis.keys('search:*').then(keys => redis.del(...keys));
}

async function invalidateUserCache(userId: string) {
  await redis.del(`user:${userId}`);
  await redis.del(`recommendations:personalized:${userId}`);
}
```

---

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Route
    participant Auth as Auth0
    participant DB as Database
    
    U->>FE: Login request
    FE->>Auth: Authenticate
    Auth-->>FE: Access token + Refresh token
    FE->>FE: Store tokens (httpOnly cookie)
    
    FE->>API: Request with token
    API->>API: Verify JWT signature
    API->>API: Check token expiration
    
    alt Token Valid
        API->>DB: Fetch user data
        DB-->>API: User data
        API-->>FE: Response
    else Token Expired
        API-->>FE: 401 Unauthorized
        FE->>Auth: Refresh token
        Auth-->>FE: New access token
        FE->>API: Retry with new token
    end
```

### Security Measures

1. **Authentication:**
   - JWT tokens with short expiration
   - HTTP-only cookies (prevent XSS)
   - Secure flag (HTTPS only)
   - SameSite=Strict (prevent CSRF)

2. **Authorization:**
   - Role-based access control (RBAC)
   - Resource-level permissions
   - API route middleware for auth checks

3. **Data Protection:**
   - Encrypt sensitive data at rest
   - TLS 1.3 for data in transit
   - Environment variables for secrets
   - No sensitive data in logs

4. **API Security:**
   - Rate limiting (100 req/min per IP)
   - Input validation (Zod schemas)
   - SQL injection prevention (parameterized queries)
   - XSS prevention (sanitize inputs)
   - CORS configuration

5. **Payment Security:**
   - PCI DSS compliance via Stripe
   - Never store card details
   - Webhook signature verification
   - Idempotency keys for payments

---

## Monitoring & Observability

### Metrics to Track

**Performance Metrics:**
- API response times (p50, p95, p99)
- Page load times
- Time to First Byte (TTFB)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

**Business Metrics:**
- User registrations
- Booking conversion rate
- Search-to-booking funnel
- Recommendation click-through rate
- Virtual tour engagement
- Revenue per user

**Technical Metrics:**
- Error rate by endpoint
- Cache hit rate
- Database query performance
- API rate limit hits
- Failed payment attempts

### Monitoring Tools

```typescript
// Sentry for error tracking
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});

// Custom performance monitoring
export async function trackPerformance(
  operation: string,
  fn: () => Promise<any>
) {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    
    // Log to analytics
    await logMetric({
      operation,
      duration,
      status: 'success',
      timestamp: new Date(),
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    // Log error
    Sentry.captureException(error);
    await logMetric({
      operation,
      duration,
      status: 'error',
      error: error.message,
      timestamp: new Date(),
    });
    
    throw error;
  }
}
```

---

## Scalability Considerations

### Horizontal Scaling
- Serverless functions (auto-scale)
- CDN for static assets
- Database read replicas
- Redis cluster for caching

### Performance Optimization
- Code splitting and lazy loading
- Image optimization (WebP, responsive)
- Database query optimization
- API response compression (gzip)
- Edge caching (Vercel Edge)

### Load Testing Targets
- 1,000 concurrent users
- 10,000 requests per minute
- < 2 second response time (95th percentile)
- 99.9% uptime

---

## Deployment Architecture

```mermaid
flowchart LR
    A[GitHub Repo] -->|Push| B[GitHub Actions]
    B -->|Build| C[Docker Image]
    B -->|Test| D[Run Tests]
    
    D -->|Pass| E[Deploy to Staging]
    E -->|Manual Approval| F[Deploy to Production]
    
    F --> G[Vercel Edge Network]
    G --> H[Next.js App]
    
    H --> I[Sanity CMS]
    H --> J[Redis Cache]
    H --> K[PostgreSQL]
    
    G --> L[CDN - Cloudinary]
    
    style B fill:#e1f5ff
    style G fill:#fff4e1
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:e2e

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Conclusion

This technical architecture provides a solid foundation for implementing all 5 features with:

- **Scalability:** Serverless architecture with auto-scaling
- **Performance:** Multi-layer caching and CDN
- **Security:** Industry-standard authentication and encryption
- **Reliability:** Monitoring, error tracking, and redundancy
- **Maintainability:** Clean architecture and comprehensive testing

The modular design allows features to be developed independently while sharing common infrastructure and services.
