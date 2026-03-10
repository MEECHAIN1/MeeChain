# 🚀 MeeChain Production Deployment Guide

## 📋 Overview

This guide covers the complete deployment process for MeeChain to production environment with SSL certificates, monitoring, and automated backups.

## 🏗️ Infrastructure Requirements

### Server Specifications
- **OS**: Ubuntu 20.04 LTS or later
- **CPU**: 4+ cores
- **RAM**: 8GB+ 
- **Storage**: 100GB+ SSD
- **Network**: Static IP with domain configured

### Domain Configuration
- `meechain.io` → Frontend Dashboard
- `api.meechain.io` → Backend API
- `rpc.meechain.run.place` → RPC Endpoint

### SSL Certificates
- Location: `/etc/letsencrypt/live/rpc.meechain.run.place/`
- Files: `fullchain.pem`, `privkey.pem`

## 🔧 Prerequisites

### 1. Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone Repository

```bash
cd /opt
git clone https://github.com/MEECHAIN1/MeeChain.git
cd MeeChain
```

### 3. Configure Environment

```bash
# Copy production environment template
cp .env.production .env.production.local

# Edit with your actual values
nano .env.production.local
```

**Required Environment Variables:**
- `AUTH0_DOMAIN` - Auth0 domain
- `AUTH0_CLIENT_ID` - Auth0 client ID
- `AUTH0_CLIENT_SECRET` - Auth0 client secret
- `NODEREAL_API_KEY` - NodeReal API key
- `APP_SECRET_KEY` - Generate with: `openssl rand -hex 32`

### 4. Set Up SSL Certificates

```bash
# If using existing certificates
sudo cp -r /path/to/certbot/config/live/rpc.meechain.run.place /etc/letsencrypt/live/

# Or generate new certificates with Certbot
sudo certbot certonly --standalone -d meechain.io -d api.meechain.io -d rpc.meechain.run.place
```

## 🚀 Deployment Steps

### 1. Make Scripts Executable

```bash
chmod +x deploy.sh
chmod +x monitor.sh
```

### 2. Run Deployment

```bash
# Full deployment
sudo ./deploy.sh

# The script will:
# - Check prerequisites
# - Create necessary directories
# - Backup current deployment
# - Pull latest code
# - Build Docker images
# - Start containers
# - Run health checks
```

### 3. Verify Deployment

```bash
# Check container status
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs -f

# Run health check
./monitor.sh once
```

### 4. Access Services

- **Frontend**: https://meechain.io
- **API**: https://api.meechain.io
- **API Docs**: https://api.meechain.io/docs
- **RPC**: https://rpc.meechain.run.place

## 📊 Monitoring

### Start Continuous Monitoring

```bash
# Run in background
nohup ./monitor.sh > monitor.log 2>&1 &

# Or use systemd service (recommended)
sudo cp meechain-monitor.service /etc/systemd/system/
sudo systemctl enable meechain-monitor
sudo systemctl start meechain-monitor
```

### Check Monitoring Status

```bash
# View logs
tail -f monitor.log

# Or systemd logs
sudo journalctl -u meechain-monitor -f
```

## 🔄 Updates & Maintenance

### Update to Latest Version

```bash
cd /opt/MeeChain
git pull origin main
sudo ./deploy.sh
```

### Rollback to Previous Version

```bash
sudo ./deploy.sh rollback
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f meechain-backend

# Last 100 lines
docker-compose -f docker-compose.production.yml logs --tail=100
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.production.yml restart

# Restart specific service
docker-compose -f docker-compose.production.yml restart meechain-backend
```

## 💾 Backup & Recovery

### Manual Backup

```bash
# Create backup
./deploy.sh backup

# Backups are stored in: ./backups/
```

### Restore from Backup

```bash
# List available backups
ls -lh ./backups/

# Restore specific backup
tar -xzf ./backups/meechain_backup_YYYYMMDD_HHMMSS.tar.gz
docker-compose -f docker-compose.production.yml restart
```

### Automated Backups

```bash
# Add to crontab for daily backups at 2 AM
crontab -e

# Add this line:
0 2 * * * cd /opt/MeeChain && ./deploy.sh backup
```

## 🔒 Security Checklist

- [ ] SSL certificates installed and valid
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] SSH key-based authentication enabled
- [ ] Root login disabled
- [ ] Fail2ban installed and configured
- [ ] Regular security updates enabled
- [ ] Secrets stored in environment variables (not in code)
- [ ] Rate limiting configured in Nginx
- [ ] CORS properly configured
- [ ] Security headers enabled

### Configure Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📈 Performance Optimization

### Docker Resource Limits

Edit `docker-compose.production.yml` to adjust:
- CPU limits
- Memory limits
- Worker processes

### Nginx Optimization

Edit `nginx/nginx.conf` to adjust:
- Worker connections
- Keepalive timeout
- Gzip compression
- Cache settings

### Database Optimization (if using PostgreSQL)

```bash
# Connect to PostgreSQL
docker exec -it meechain-postgres psql -U meechain

# Run VACUUM and ANALYZE
VACUUM ANALYZE;
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs meechain-backend

# Check container status
docker ps -a

# Rebuild image
docker-compose -f docker-compose.production.yml build --no-cache meechain-backend
```

### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/rpc.meechain.run.place/fullchain.pem -text -noout

# Renew certificate
sudo certbot renew
```

### High Memory Usage

```bash
# Check memory usage
docker stats

# Restart containers
docker-compose -f docker-compose.production.yml restart
```

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.production.yml logs postgres

# Connect to database
docker exec -it meechain-postgres psql -U meechain
```

## 📞 Support

### Emergency Contacts
- **Security Issues**: security@meechain.io
- **Production Issues**: ops@meechain.io
- **General Support**: support@meechain.io

### Useful Commands

```bash
# Quick health check
curl -f https://api.meechain.io/health

# Check all services
./monitor.sh once

# View resource usage
docker stats

# Clean up old images
docker system prune -a

# Export logs
docker-compose -f docker-compose.production.yml logs > logs_$(date +%Y%m%d).txt
```

## 🎯 Next Steps

1. **Set up monitoring alerts** - Configure Slack/email notifications
2. **Enable automated backups** - Set up cron jobs
3. **Configure CI/CD** - Set up GitHub Actions secrets
4. **Load testing** - Test with expected traffic
5. **Documentation** - Update team documentation
6. **Training** - Train team on deployment process

---

**✨ Deployment completed! MeeChain is now running in production.** 🚀

*For questions or issues, contact the DevOps team.*
