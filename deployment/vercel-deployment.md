# 🚀 MeeChain Vercel Deployment Guide

## Overview
Deploy MeeChain Frontend to Vercel (Free tier available)

## Prerequisites
- GitHub account with MeeChain repository
- Vercel account (sign up at https://vercel.com)

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository: `MEECHAIN1/MeeChain`
3. Select the repository

### 2. Configure Project Settings

**Framework Preset:** Next.js

**Root Directory:** `meechain-frontend`

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```bash
.next
```

**Install Command:**
```bash
npm install
```

### 3. Environment Variables

Add these environment variables in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://meechain-backend.up.railway.app
NODE_ENV=production
```

### 4. Deploy

Click "Deploy" button. Vercel will:
- Install dependencies
- Build the Next.js application
- Deploy to global CDN
- Provide a URL like: `https://meechain.vercel.app`

### 5. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain: `meechain.io`
3. Configure DNS records as instructed by Vercel:
   - Type: `A` or `CNAME`
   - Name: `@` or `www`
   - Value: Provided by Vercel

### 6. Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## Vercel Configuration File

Create `vercel.json` in `meechain-frontend/`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Performance Optimization

### Enable Edge Functions
Vercel automatically uses Edge Functions for optimal performance.

### Image Optimization
Next.js Image component is automatically optimized by Vercel.

### Caching
Static assets are cached on Vercel's global CDN.

## Monitoring

### Analytics
Enable Vercel Analytics in Project Settings:
- Real-time visitor data
- Performance metrics
- Core Web Vitals

### Logs
View deployment and runtime logs in Vercel dashboard.

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure environment variables are set

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is deployed and accessible

### Custom Domain Not Working
- Verify DNS records are correct
- Wait for DNS propagation (up to 48 hours)
- Check SSL certificate status

## Cost
- **Free Tier**: 100GB bandwidth, unlimited deployments
- **Pro**: $20/month for more bandwidth and features

## Support
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
