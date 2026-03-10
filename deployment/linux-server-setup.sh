#!/bin/bash

# =================================
# MeeChain Linux Server Setup Script
# Ubuntu/Debian with Docker + Docker Compose
# =================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "=========================================="
echo "  MeeChain Linux Server Setup"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root (use sudo)"
    exit 1
fi

# 1. Update system
log_info "Updating system packages..."
apt-get update && apt-get upgrade -y
log_success "System updated"

# 2. Install prerequisites
log_info "Installing prerequisites..."
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx
log_success "Prerequisites installed"

# 3. Install Docker (if not installed)
if ! command -v docker &> /dev/null; then
    log_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    log_success "Docker installed"
else
    log_success "Docker already installed"
fi

# 4. Install Docker Compose (if not installed)
if ! command -v docker-compose &> /dev/null; then
    log_info "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    log_success "Docker Compose installed"
else
    log_success "Docker Compose already installed"
fi

# 5. Configure firewall
log_info "Configuring firewall..."
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw status
log_success "Firewall configured"

# 6. Configure fail2ban
log_info "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
log_success "Fail2ban configured"

# 7. Create project directory
log_info "Creating project directory..."
mkdir -p /opt/MeeChain
cd /opt/MeeChain
log_success "Project directory created"

# 8. Clone repository
log_info "Cloning MeeChain repository..."
if [ -d ".git" ]; then
    log_warning "Repository already exists, pulling latest changes..."
    git pull origin main
else
    git clone https://github.com/MEECHAIN1/MeeChain.git .
fi
log_success "Repository cloned"

# 9. Copy SSL certificates
log_info "Setting up SSL certificates..."
if [ -d "/etc/letsencrypt/live/rpc.meechain.run.place" ]; then
    log_success "SSL certificates found"
else
    log_warning "SSL certificates not found at /etc/letsencrypt/live/rpc.meechain.run.place"
    log_info "You need to either:"
    echo "  1. Copy existing certificates to /etc/letsencrypt/live/rpc.meechain.run.place"
    echo "  2. Generate new certificates with: certbot certonly --standalone -d rpc.meechain.run.place"
fi

# 10. Create environment file
log_info "Creating environment file..."
if [ ! -f ".env.production.local" ]; then
    cp .env.production .env.production.local
    log_warning "Please edit .env.production.local with your actual values"
    log_info "Run: nano .env.production.local"
else
    log_success "Environment file already exists"
fi

# 11. Create log and backup directories
log_info "Creating directories..."
mkdir -p /var/log/meechain
mkdir -p /var/backups/meechain
chmod 755 /var/log/meechain
chmod 755 /var/backups/meechain
log_success "Directories created"

# 12. Make scripts executable
log_info "Making scripts executable..."
chmod +x deploy.sh
chmod +x monitor.sh
log_success "Scripts are executable"

# 13. Install monitoring service
log_info "Installing monitoring service..."
cp meechain-monitor.service /etc/systemd/system/
systemctl daemon-reload
log_success "Monitoring service installed"

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit environment file: nano /opt/MeeChain/.env.production.local"
echo "2. Ensure SSL certificates are in place"
echo "3. Run deployment: cd /opt/MeeChain && ./deploy.sh"
echo "4. Start monitoring: systemctl enable meechain-monitor && systemctl start meechain-monitor"
echo ""
echo "Access URLs after deployment:"
echo "  - Frontend: https://meechain.io"
echo "  - API: https://api.meechain.io"
echo "  - RPC: https://rpc.meechain.run.place"
echo "  - API Docs: https://api.meechain.io/docs"
echo ""
