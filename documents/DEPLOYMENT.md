# Deployment Guide

## Overview

This guide covers deploying the AirBnB Sanity Frontend to production environments.

---

## Building for Production

### 1. Build Process

The Next.js build process:

```bash
npm run build
```

**Process:**
1. Optimizes code and assets
2. Creates `.next/` output directory
3. Generates static assets
4. Compiles pages and components
5. Reports build errors

**Output:**
```
> next build

info  - Loaded env from /path/to/.env.local
info  - Loaded env from /path/to/.env.production.local
info  - Compiled successfully
info  - Collecting page data
info  - Generating static pages (0/3)
info  - Finalizing page optimization

Route (pages)                              Size     First Load JS
┌ ○ /                                       2.3 kB        45 kB
├ ○ /property/[slug]                       3.1 kB        46 kB
└ ○ 404                                     3.0 kB        44 kB
```

### 2. Verify Build Success

```bash
# Build should exit with code 0
echo $?  # Should output: 0

# Check output directory exists
ls -la .next/

# Try starting production server
npm run start
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is made by the Next.js team and provides the best integration.

#### 1.1 Prerequisites

- GitHub account with repository
- Vercel account (free tier available)

#### 1.2 Deploy Steps

**Via Web Dashboard:**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Import Project"
4. Select your repository
5. Configure project:
   - Framework: `Next.js`
   - Root directory: `.` (current)
   - Environment variables: Add all from `.env.local`
     - `NEXT_PUBLIC_SANITY_DATASET`
     - `NEXT_PUBLIC_SANITY_PROJECT_ID`
     - `googlePlacesAPI`
6. Click "Deploy"

**Via CLI:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy with production URL
vercel --prod
```

#### 1.3 Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SANITY_DATASET": "@sanity_dataset",
    "NEXT_PUBLIC_SANITY_PROJECT_ID": "@sanity_project_id",
    "googlePlacesAPI": "@google_maps_api"
  }
}
```

#### 1.4 Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable:
   - Name: `NEXT_PUBLIC_SANITY_DATASET`
   - Value: `production`
   - Select: `Production`, `Preview`, `Development` (as needed)
3. Repeat for other variables
4. Redeploy after adding

#### 1.5 Domain Configuration

1. In Project Settings → Domains
2. Add custom domain or use Vercel's provided domain
3. Configure DNS if custom domain
4. SSL certificate auto-provisioned

#### 1.6 Monitoring

- **Deployments:** View all deployment history
- **Analytics:** Monitor traffic and performance
- **Function Logs:** See API endpoint logs
- **Errors:** View deployment errors

---

### Option 2: Netlify

#### 2.1 Prerequisites

- GitHub repository
- Netlify account (free tier available)

#### 2.2 Deploy Steps

**Via Web Dashboard:**

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub account
4. Select repository
5. Configure build:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables:
   - `NEXT_PUBLIC_SANITY_DATASET=production`
   - `NEXT_PUBLIC_SANITY_PROJECT_ID=...`
   - `googlePlacesAPI=...`
7. Click "Deploy"

**Via CLI:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### 2.3 Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "14"

[[redirects]]
  from = "/*"
  to = "/404"
  status = 404
```

---

### Option 3: Traditional VPS/Server (Self-Hosted)

#### 3.1 Prerequisites

- Linux server (Ubuntu, Debian, CentOS)
- Node.js installed
- npm installed
- PM2 or similar process manager
- Nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt free)

#### 3.2 Server Setup

**SSH into server:**

```bash
ssh user@your-server.com
```

**Install Node.js:**

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

**Install PM2 (Process Manager):**

```bash
sudo npm install -g pm2
```

#### 3.3 Deploy Application

**Clone repository:**

```bash
git clone https://github.com/your-repo/airbnb-sanity-frontend.git
cd airbnb-sanity-frontend
```

**Install dependencies:**

```bash
npm install --production
```

**Create `.env.production.local`:**

```bash
cat > .env.production.local << EOF
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_PROJECT_ID=your_id
googlePlacesAPI=your_key
EOF
```

**Build application:**

```bash
npm run build
```

**Start with PM2:**

```bash
pm2 start "npm run start" --name "airbnb-frontend"
pm2 save
pm2 startup
```

#### 3.4 Nginx Configuration

Create `/etc/nginx/sites-available/airbnb`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/airbnb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3.5 SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 4: Docker Container

#### 4.1 Create Dockerfile

```dockerfile
# Build stage
FROM node:16 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .
RUN npm run build

# Production stage
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/.next ./.next

EXPOSE 3000

CMD ["npm", "start"]
```

#### 4.2 Create docker-compose.yml

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SANITY_DATASET=production
      - NEXT_PUBLIC_SANITY_PROJECT_ID=${SANITY_PROJECT_ID}
      - googlePlacesAPI=${GOOGLE_API_KEY}
    restart: unless-stopped
```

#### 4.3 Build and Run

```bash
docker-compose build
docker-compose up -d
```

---

## Environment Variables for Production

### 1. Create `.env.production.local`

```bash
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123def456
googlePlacesAPI=AIzaSyD...

# Optional performance settings
NODE_ENV=production
```

### 2. Restrict Google API Key

In Google Cloud Console:

1. APIs & Services → Credentials
2. Edit API Key
3. Application restrictions:
   - HTTP referers
   - Add production domain
   - Example: `https://yourdomain.com/*`

This prevents key theft/abuse.

### 3. Sanity Access Control

In Sanity project settings:

1. Project → Settings → API
2. Review CORS origins
3. Add production domain
4. For public reading, CORS not strictly needed (NEXT_PUBLIC vars)

---

## Performance Optimization

### 1. Enable Caching

**Vercel:** Automatic (ImmutableDeploymentId)

**Other platforms:**
```javascript
// pages/index.js
export const getServerSideProps = async () => {
  const properties = await sanityClient.fetch(query)
  
  return {
    props: { properties },
    revalidate: 60  // Cache for 60 seconds (ISR)
  }
}
```

### 2. Image Optimization

Current setup uses Sanity CDN:
- Images already optimized
- Auto format selection
- CDN distribution

Consider adding Next.js Image:
```javascript
import Image from 'next/image'

<Image 
  src={urlFor(mainImage).url()} 
  alt="Property"
  width={800}
  height={600}
/>
```

### 3. Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# In next.config.js:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({})

# Run analysis
ANALYZE=true npm run build
```

### 4. Content Delivery Network

- Sanity handles image CDN
- Consider global CDN for HTML/JS (Vercel auto-includes)
- Cloudflare for DNS + CDN

---

## Monitoring & Logging

### 1. Application Monitoring

**Vercel Analytics:**
- Automatic performance monitoring
- Real User Monitoring (RUM)
- Deployment analytics

**Alternative: Sentry**
```bash
npm install @sentry/nextjs
```

### 2. Error Tracking

**In pages:**
```javascript
import * as Sentry from "@sentry/nextjs";

export async function getServerSideProps(context) {
  try {
    const data = await sanityClient.fetch(query)
  } catch (error) {
    Sentry.captureException(error)
    // Handle error
  }
}
```

### 3. Log Collection

**Vercel:** Logs automatically collected
**Other platforms:** Use:
- Papertrail
- LogRocket
- Datadog

---

## Continuous Deployment

### GitHub Actions (Auto-Deploy on Push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Vercel Auto-Deploy

With GitHub connected:
- Every push to main → Auto-deploys to production
- Preview deployments for pull requests
- Can be disabled in settings

---

## Rollback Procedures

### Vercel Rollback

1. Go to Deployments
2. Find previous working deployment
3. Click three dots menu
4. Select "Redeploy"

### Manual Rollback

```bash
# Check git history
git log --oneline

# Revert to previous commit
git revert <commit-hash>
git push origin main

# Or checkout previous version
git checkout <commit-hash>
git push -f origin main
```

---

## Post-Deployment Checklist

- [ ] Verify production URL loads
- [ ] Check all property listings display
- [ ] Test property detail pages
- [ ] Verify images load correctly
- [ ] Test map functionality
- [ ] Check navigation works
- [ ] Test on mobile devices
- [ ] Verify no console errors
- [ ] Check performance metrics
- [ ] Monitor error logs
- [ ] Test with slow network (DevTools)
- [ ] Verify environment variables correct

---

## Common Production Issues

### Issue: 404 on detail pages

**Cause:** Incorrect route configuration

**Solution:**
```javascript
// Verify query parameter extraction
console.log(pageContext.query.slug)

// Ensure slug matches URL
// http://localhost:3000/property/my-property
// slug should be "my-property"
```

### Issue: Images 404

**Cause:** Invalid Sanity project ID or dataset

**Solution:**
```bash
# Verify environment variables
echo $NEXT_PUBLIC_SANITY_PROJECT_ID
echo $NEXT_PUBLIC_SANITY_DATASET

# Rebuild and redeploy
npm run build
git push origin main  # If using auto-deploy
```

### Issue: Map not rendering

**Cause:** Google Maps API key invalid or blocked

**Solution:**
1. Verify API key in Google Cloud Console
2. Check API key restrictions match domain
3. Verify Maps JavaScript API enabled
4. Check billing is enabled

### Issue: Performance degradation

**Cause:** Slow Sanity queries or network

**Solution:**
1. Optimize GROQ queries (fetch only needed fields)
2. Add caching/ISR
3. Use CDN for static assets
4. Monitor Sanity API performance

---

## Scaling Considerations

### As traffic grows:

1. **Caching:** Implement ISR or static generation
2. **Database:** Sanity handles scaling automatically
3. **CDN:** Vercel/Netlify provide automatic CDN
4. **Images:** Sanity CDN scales automatically
5. **API Rate Limits:** Monitor Sanity usage

### Sanity Scaling

```javascript
// Monitor usage
export const getServerSideProps = async () => {
  // Sanity includes rate limit info in response headers
  const response = await sanityClient.getDatastore().client.observable.request({
    uri: 'YOUR_QUERY'
  })
  
  // Use ISR for better performance
  return {
    props: {...},
    revalidate: 60  // Cache 60 seconds
  }
}
```

---

## See Also

- **SETUP_GUIDE.md** - Development setup
- **APPLICATION_ARCHITECTURE.md** - System design
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Sanity Deployment](https://www.sanity.io/docs/deployment)
