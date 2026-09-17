# Setup Guide

## Prerequisites

Before setting up the development environment, ensure you have:

- **Node.js:** v12.0.0 or higher (v14+ recommended)
- **npm:** v6.0.0 or higher (comes with Node.js)
- **Git:** For version control and cloning repository
- **Code Editor:** VS Code, WebStorm, or your preferred IDE
- **Sanity.io Account:** For backend CMS access
- **Google Cloud Project:** With Maps API enabled

---

## Step 1: Initial Setup

### 1.1 Clone Repository

```bash
git clone https://github.com/yourusername/airbnb-sanity-frontend.git
cd airbnb-sanity-frontend
```

### 1.2 Check Node/npm Versions

```bash
node --version    # Should be v12.0.0+
npm --version     # Should be v6.0.0+
```

### 1.3 Install Dependencies

```bash
npm install
```

This will:
- Download all packages from package.json
- Install into `node_modules/` directory
- Generate `package-lock.json`

**Packages installed:**
- `next@10.1.3` - React framework
- `react@17.0.2` - UI library
- `react-dom@17.0.2` - DOM utilities
- `next-sanity@0.1.12` - Sanity integration
- `@react-google-maps/api@2.1.1` - Maps integration

---

## Step 2: Environment Configuration

### 2.1 Create `.env.local` File

In project root, create `.env.local`:

```bash
touch .env.local
```

### 2.2 Add Environment Variables

Edit `.env.local` and add:

```
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
googlePlacesAPI=your_google_maps_api_key_here
```

### 2.3 Obtain Sanity Configuration

#### From Sanity Studio:

1. Go to [sanity.io](https://www.sanity.io/)
2. Sign in to your account
3. Navigate to your project
4. Look for:
   - **Project ID:** In project settings
   - **Dataset:** Usually "production"
5. Copy these values to `.env.local`

#### Alternative - From sanity.json (backend):

If you have access to the backend repo:
```bash
# Backend repo at: github.com/kubowania/airbnb-sanity-backend
cat sanity.json  # Find projectId and dataset
```

### 2.4 Obtain Google Maps API Key

#### Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Google Maps JavaScript API**:
   - APIs & Services → Library
   - Search "Maps JavaScript API"
   - Click Enable
4. Create API Key:
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Copy the generated key
5. (Optional) Restrict key to browser referers:
   - Edit API key
   - Application restrictions → HTTP referers
   - Add your domain (e.g., localhost:3000)

Add to `.env.local`:
```
googlePlacesAPI=AIzaSyD...your_key...
```

### 2.5 Verify Environment Setup

```bash
# Should output without errors if env vars are set
node -e "console.log(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)"
```

---

## Step 3: Development Server

### 3.1 Start Development Server

```bash
npm run dev
```

**Output should show:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 3.2 Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

**Expected result:**
- AirBnB listing page loads
- Property cards display (if data exists in Sanity)
- Map loads with property markers
- Page is interactive

### 3.3 Verify Functionality

```
✓ Home page loads
✓ Property cards visible
✓ Images display
✓ Map renders
✓ Click property card navigates to detail page
✓ Detail page loads full property info
✓ No console errors
```

### 3.4 Debug Issues

If something doesn't work:

```bash
# Check if dev server is running
curl http://localhost:3000

# Check Node version
node --version

# Check npm version
npm --version

# Check .env.local exists and has values
cat .env.local

# View server logs
npm run dev  # Watch the terminal output

# Check browser console for errors
# Open DevTools: F12 or Right-click → Inspect
# Look for errors in Console tab
```

---

## Step 4: Development Workflow

### 4.1 File Watching

The dev server watches for file changes:

```
Changes to:
├── pages/*.js → Page re-renders
├── components/*.js → Component re-renders
├── styles/*.css → Styles update
└── sanity.js → Query config updates
```

**No restart needed** - changes apply automatically

### 4.2 Making Changes

Example: Modify a component

```javascript
// Before: components/NavBar.js
const NavBar = () => {
  return <div className="nav"><div className="logo"></div></div>
}

// After: Add some styling
const NavBar = () => {
  return (
    <div className="nav">
      <div className="logo">
        <span>AirBnB Clone</span>
      </div>
    </div>
  )
}
```

Save file → Browser automatically updates

### 4.3 Browser DevTools

**Open DevTools:**
```
Windows/Linux: F12 or Ctrl+Shift+I
Mac: Cmd+Option+I
```

**Useful tabs:**
- **Console:** Error messages, logs
- **Network:** API calls to Sanity, image CDN
- **Elements:** DOM structure
- **Application:** Local storage, cookies

### 4.4 Common Development Tasks

#### Modify Property Styling

Edit `styles/globals.css`:
- Changes affect all pages
- Auto-reload in browser

#### Add New Component

Create `components/MyComponent.js`:
```javascript
const MyComponent = ({ prop1 }) => {
  return <div>{prop1}</div>
}

export default MyComponent
```

Import in page/component:
```javascript
import MyComponent from "../components/MyComponent"
```

Use:
```javascript
<MyComponent prop1="value" />
```

#### Modify Sanity Query

Edit `pages/index.js` or `pages/property/[slug].js`:

Change the query:
```javascript
// Before
const query = '*[ _type == "property"]'

// After: Add price filter
const query = '*[ _type == "property" && pricePerNight < 150]'
```

Save → Server re-renders with new data

---

## Step 5: Testing the Application

### 5.1 Manual Testing

**Test Case 1: Home Page**
```
1. Navigate to http://localhost:3000
2. Verify page loads
3. Verify properties display
4. Verify map renders
5. Verify images load
6. Click a property card
```

**Test Case 2: Detail Page**
```
1. Click property from listing
2. Verify URL changes to /property/[slug]
3. Verify all images load
4. Verify reviews display
5. Verify map shows correct location
6. Click "Change Dates" to return to home
```

**Test Case 3: Error Handling**
```
1. Try /property/nonexistent
2. Should show 404 page
```

**Test Case 4: Network Issues**
```
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Reload page
4. Watch loading progress
5. Should eventually load completely
```

### 5.2 Browser Compatibility

Test in different browsers:

```
✓ Chrome/Edge: Latest versions
✓ Firefox: Latest version
✓ Safari: Latest version
✓ Mobile: iPhone Safari, Chrome Mobile
```

### 5.3 Responsive Design

Test at different viewport sizes:

```
Desktop: 1920x1080
Tablet: 768x1024
Mobile: 375x667
```

---

## Troubleshooting

### Issue: "Cannot find module 'next'"

**Cause:** Dependencies not installed

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "NEXT_PUBLIC_SANITY_PROJECT_ID is undefined"

**Cause:** Environment variables not set

**Solution:**
1. Create `.env.local` file
2. Add all required variables
3. Restart dev server: `npm run dev`

### Issue: Properties not displaying

**Cause:** No data in Sanity or query issue

**Solution:**
1. Check Sanity backend has data
2. Verify query in browser DevTools Network tab
3. Check Sanity API response for errors
4. Verify project ID and dataset

### Issue: Images not loading

**Cause:** Invalid Sanity URL or API key

**Solution:**
1. Verify NEXT_PUBLIC_SANITY_PROJECT_ID
2. Verify NEXT_PUBLIC_SANITY_DATASET
3. Check Sanity Image CDN settings
4. Look for CORS errors in console

### Issue: Map not rendering

**Cause:** Google Maps API not loading or invalid key

**Solution:**
1. Verify googlePlacesAPI environment variable
2. Check API key has Maps API enabled
3. Verify location data has valid lat/lng
4. Check Google Cloud billing enabled

### Issue: Port 3000 already in use

**Cause:** Another process using port

**Solution:**
```bash
# Find and kill process
lsof -i :3000  # Show process
kill -9 <PID>  # Kill it

# Or use different port
PORT=3001 npm run dev
```

---

## Next Steps

### Ready for Development?

1. ✓ Environment configured
2. ✓ Dev server running
3. ✓ Application working

**Now you can:**

- Modify components in `components/` directory
- Edit pages in `pages/` directory
- Update styles in `styles/globals.css`
- Adjust Sanity queries
- Add new features

### Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Google Maps API](https://developers.google.com/maps)

### See Also

- **APPLICATION_ARCHITECTURE.md** - System design overview
- **DATA_FLOW.md** - How data flows through app
- **COMPONENTS.md** - Component documentation
- **PAGES.md** - Page routing and structure

---

## Environment Variables Reference

| Variable | Required | Value | Usage |
|----------|----------|-------|-------|
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | "production" | Sanity dataset name |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | UUID string | Sanity project identifier |
| `googlePlacesAPI` | Yes | API Key string | Google Maps API key |
| `NODE_ENV` | No | "development" | Next.js environment |
| `PORT` | No | 3000 (default) | Dev server port |

**Note:** `NEXT_PUBLIC_` prefix makes variable accessible in browser JavaScript. Never expose secrets with this prefix.

---

## Performance Tips

1. **Cache Images:** Sanity CDN handles caching automatically
2. **Lazy Load:** Images lazy-load by default
3. **Bundle Size:** Keep components small
4. **Unused CSS:** Remove unused styles
5. **API Calls:** Minimize Sanity queries with specific fields
