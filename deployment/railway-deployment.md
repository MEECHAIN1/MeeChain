# 🚂 MeeChain Railway Deployment Guide

## Overview
Deploy MeeChain Backend to Railway (Free $5 credit/month)

## Prerequisites
- GitHub account with MeeChain repository
- Railway account (sign up at https://railway.app)

## Deployment Steps

### 1. Create New Project

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `MEECHAIN1/MeeChain`
4. Railway will detect the project

### 2. Configure Service

**Service Name:** `meechain-backend`

**Root Directory:** `meechain-backend`

**Start Command:**
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Build Command:**
```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Add these in Railway dashboard (Settings → Variables):

```env
# Auth0
AUTH0_DOMAIN=meechain.au.auth0.com
AUTH0_CLIENT_ID=6hyf98TCLxD8IV7Cf2mlaRZDjrD3qUHB
AUTH0_CLIENT_SECRET=your-secret-here
AUTH0_AUDIENCE=https://meechain.au.auth0.com/api/v2/
AUTH0_MGMT_AUDIENCE=https://meechain.au.auth0.com/api/v2/

# NodeReal
NODEREAL_API_KEY=e061a9d18c5f418099544a920e72eda2
NODEREAL_RPC_URL=https://bsc-mainnet.nodereal.io/v1/

# App
APP_SECRET_KEY=generate-random-key-here
DEBUG=False
ENVIRONMENT=production
PORT=8000

# CORS
CORS_ORIGINS=https://meechain.vercel.app,https://meechain.io
```

### 4. Add PostgreSQL Database (Optional)

1. Click "New" → "Database" → "PostgreSQL"
2. Railway automatically creates `DATABASE_URL` variable
3. Update your backend code to use PostgreSQL

### 5. Add Redis Cache (Optional)

1. Click "New" → "Database" → "Redis"
2. Railway automatically creates `REDIS_URL` variable

### 6. Deploy

Railway automatically deploys when you:
- Push to GitHub `main` branch
- Click "Deploy" in Railway dashboard

### 7. Custom Domain

1. Go to Settings → Domains
2. Click "Generate Domain" for free Railway domain
3. Or add custom domain: `api.meechain.io`
4. Configure DNS:
   - Type: `CNAME`
   - Name: `api`
   - Value: Provided by Railway

## Railway Configuration File

Create `railway.json` in `meechain-backend/`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Nixpacks Configuration

Create `nixpacks.toml` in `meechain-backend/`:

```toml
[phases.setup]
nixPkgs = ["python310", "gcc"]

[phases.install]
cmds = ["pip install -r requirements.txt"]

[phases.build]
cmds = ["echo 'Build complete'"]

[start]
cmd = "uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4"
```

## Health Checks

Railway automatically monitors your service:
- HTTP health checks on `/health` endpoint
- Automatic restarts on failures
- Deployment rollback on errors

## Monitoring

### Metrics
View in Railway dashboard:
- CPU usage
- Memory usage
- Network traffic
- Request count

### Logs
Real-time logs available in Railway dashboard:
```bash
# View logs
railway logs

# Follow logs
railway logs --follow
```

## Scaling

### Vertical Scaling
Upgrade plan for more resources:
- **Hobby**: $5/month credit
- **Pro**: $20/month for more resources

### Horizontal Scaling
Add multiple instances in Pro plan.

## CLI Usage

Install Railway CLI:
```bash
# Install
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs

# Run commands
railway run python manage.py migrate
```

## Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Verify `requirements.txt` is correct
- Ensure Python version is compatible

### Service Crashes
- Check runtime logs
- Verify environment variables
- Check memory usage (may need upgrade)

### Database Connection Issues
- Verify `DATABASE_URL` is set
- Check database is running
- Verify connection string format

### CORS Errors
- Update `CORS_ORIGINS` environment variable
- Include frontend URL
- Restart service after changes

## Cost Optimization

### Free Tier
- $5 credit per month
- ~500 hours of usage
- Shared resources

### Tips
- Use sleep mode for non-production services
- Optimize Docker image size
- Use caching to reduce CPU usage

## Backup Strategy

### Database Backups
Railway Pro includes automatic backups:
- Daily backups
- Point-in-time recovery
- Manual backup triggers

### Manual Backup
```bash
# Export database
railway run pg_dump $DATABASE_URL > backup.sql

# Import database
railway run psql $DATABASE_URL < backup.sql
```

## Support
- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Support: support@railway.app
