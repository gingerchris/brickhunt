# Cloudflare Pages Deployment Guide

This guide will help you deploy BrickHunt to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account (free tier works fine)
2. Node.js and npm installed locally
3. Your Rebrickable API key

## Method 1: Deploy via Cloudflare Dashboard (Recommended)

### Step 1: Push to GitHub
Your code is already on GitHub at `github.com:gingerchris/brickhunt.git`

### Step 2: Connect to Cloudflare Pages

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Authorize Cloudflare to access your GitHub account
4. Select the `brickhunt` repository
5. Configure the build settings:
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

### Step 3: Add Environment Variables

1. In the Cloudflare Pages project settings, go to **Settings** → **Environment variables**
2. Add the following variable (this will be kept secure on the server side):
   - **Variable name**: `REBRICKABLE_API_KEY`
   - **Value**: `91279517834bc15097f38b7b523d71c0`
   - **Type**: Secret (encrypted)
   - **Environment**: Both Production and Preview

**Important**: Use `REBRICKABLE_API_KEY` (not `VITE_REBRICKABLE_API_KEY`) since we're using a server-side proxy to keep the key secure.

### Step 4: Deploy

1. Click **Save and Deploy**
2. Cloudflare will build and deploy your site automatically
3. Your site will be available at `https://brickhunt.pages.dev`
4. You can also add a custom domain in the settings

## Method 2: Deploy via Wrangler CLI

### Step 1: Install Wrangler

```bash
npm install -g wrangler
# or use the local version
npm install
```

### Step 2: Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate.

### Step 3: Create a Pages Project

```bash
npx wrangler pages project create brickhunt
```

### Step 4: Set Environment Variables

```bash
npx wrangler pages secret put REBRICKABLE_API_KEY
```

When prompted, enter: `91279517834bc15097f38b7b523d71c0`

**Note**: The API key is stored securely and never exposed to the client.

### Step 5: Deploy

```bash
npm run deploy
```

Or manually:

```bash
npm run build
npx wrangler pages deploy dist --project-name=brickhunt
```

## Important Notes

### Camera Permissions

- The app requires camera access for QR and OCR scanning
- Cloudflare Pages serves over HTTPS by default, which is required for camera API
- Users will be prompted to allow camera access when using these features

### API Key Security

- ✅ **The Rebrickable API key is kept secure on the server side**
- The app uses Cloudflare Pages Functions to proxy API requests
- Your API key is never exposed in the client-side JavaScript bundle
- All API requests go through `/api/rebrickable/*` which is handled server-side
- The key is stored as an encrypted environment variable in Cloudflare

### Automatic Deployments

When using the Cloudflare Dashboard method:
- Every push to `main` branch triggers an automatic deployment
- Pull requests create preview deployments
- You can see deployment status in the Cloudflare dashboard

### Build Settings

The project uses:
- **Node version**: 18+ (Cloudflare uses latest LTS by default)
- **Package manager**: npm
- **Build time**: ~1-2 minutes
- **Bundle size**: ~540KB (166KB gzipped)

## Troubleshooting

### Build Fails

If the build fails, check:
1. Environment variables are set correctly
2. Node version is 18 or higher
3. All dependencies are in `package.json`

### Camera Not Working

If camera features don't work:
1. Ensure site is served over HTTPS (Cloudflare does this automatically)
2. Check browser permissions
3. Test on different browsers (Chrome/Edge recommended)

### API Errors

If you get API errors:
1. Verify the `VITE_REBRICKABLE_API_KEY` environment variable is set
2. Check the Rebrickable API status
3. Look at browser console for detailed error messages

## Monitoring

- View deployment logs in Cloudflare Dashboard → Your Project → Deployments
- Analytics available in Dashboard → Your Project → Analytics
- Set up custom domains in Dashboard → Your Project → Custom domains

## Next Steps

After deployment:
1. Test all features (QR scan, OCR, manual entry)
2. Grant camera permissions when prompted
3. Share your deployed URL!
4. Consider adding a custom domain

Your BrickHunt app will be live at: `https://brickhunt.pages.dev`
