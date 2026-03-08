# MeeChain Frontend Dashboard - Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: Your FastAPI backend URL
   - (Optional) Auth0 variables if using authentication
3. **Deploy** with automatic CI/CD

### Option 2: Docker Deployment

1. **Build Docker image**:
   ```bash
   docker build -t meechain-frontend .
   ```

2. **Run container**:
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_API_URL=http://your-backend-url:8000 \
     meechain-frontend
   ```

3. **Docker Compose** (with backend):
   ```yaml
   version: '3.8'
   services:
     frontend:
       build: ./meechain-frontend
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_API_URL=http://backend:8000
       depends_on:
         - backend
     
     backend:
       build: ./meechain-backend
       ports:
         - "8000:8000"
       env_file:
         - .env
   ```

### Option 3: Manual Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "meechain-frontend" -- start
   pm2 save
   pm2 startup
   ```

## 🔧 Environment Configuration

### Required Variables
```env
NEXT_PUBLIC_API_URL=http://your-backend-url:8000
```

### Optional Variables
```env
# Authentication
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.us.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.meechain.io

# Features
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# UI
NEXT_PUBLIC_SITE_NAME=MeeChain Dashboard
NEXT_PUBLIC_SITE_DESCRIPTION=Dashboard for MeeChain contributors
```

## 📦 Build Optimization

### Static Export (Optional)
```bash
# Update next.config.ts
const nextConfig = {
  output: 'export',  // Enable static export
}

# Build static files
npm run build
```

### Image Optimization
- Place images in `public/` directory
- Use Next.js Image component for automatic optimization
- Configure `next.config.ts` for external image domains

## 🔒 Security Considerations

1. **CORS Configuration**: Ensure backend allows frontend domain
2. **HTTPS**: Always use HTTPS in production
3. **Environment Variables**: Never commit secrets to version control
4. **Content Security Policy**: Consider adding CSP headers
5. **Rate Limiting**: Implement if needed for public access

## 📊 Monitoring

### Health Checks
- Endpoint: `http://your-frontend-url/api/health` (if implemented)
- Monitor response time and status codes

### Logging
- Application logs via console or logging service
- Error tracking with Sentry or similar
- Performance monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify `NEXT_PUBLIC_API_URL` is correct

2. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

3. **Runtime Errors**
   - Check browser console for errors
   - Verify API connectivity
   - Check environment variables

### Debug Mode
Enable debug mode by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

## 📈 Performance Optimization

1. **Code Splitting**: Automatic with Next.js
2. **Image Optimization**: Use Next.js Image component
3. **Caching**: Implement service workers if needed
4. **Bundle Analysis**: Use `@next/bundle-analyzer`

## 🔗 Integration with Backend

### Authentication Flow
1. User logs in via Auth0 (if configured)
2. Frontend receives JWT token
3. Token included in API requests
4. Backend validates token and returns data

### Real-time Updates
Consider adding WebSocket support for:
- Live RPC call updates
- Real-time contributor activity
- Instant badge notifications

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Error tracking set up
- [ ] Monitoring in place
- [ ] Backup strategy defined
- [ ] Documentation updated
- [ ] Security audit completed

## 📞 Support

For issues or questions:
1. Check the [README.md](./README.md)
2. Review error logs
3. Contact development team
4. Open GitHub issue

---

**Deployment successful!** 🎉

Your MeeChain Frontend Dashboard is now ready for contributors and administrators.