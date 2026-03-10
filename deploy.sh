#!/bin/bash

# =================================
# MeeChain Production Deployment Script
# =================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="MeeChain"
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
LOG_DIR="./logs"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file $ENV_FILE not found"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$LOG_DIR"
    mkdir -p "./nginx/ssl"
    
    log_success "Directories created"
}

# Backup current deployment
backup_deployment() {
    log_info "Creating backup of current deployment..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/meechain_backup_$TIMESTAMP.tar.gz"
    
    if [ -d "./data" ]; then
        tar -czf "$BACKUP_FILE" ./data ./logs 2>/dev/null || true
        log_success "Backup created: $BACKUP_FILE"
    else
        log_warning "No data directory found, skipping backup"
    fi
}

# Pull latest code
pull_latest_code() {
    log_info "Pulling latest code from GitHub..."
    
    if [ -d ".git" ]; then
        git pull origin main
        log_success "Code updated"
    else
        log_warning "Not a git repository, skipping pull"
    fi
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    
    log_success "Docker images built"
}

# Stop current containers
stop_containers() {
    log_info "Stopping current containers..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    log_success "Containers stopped"
}

# Start new containers
start_containers() {
    log_info "Starting new containers..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    log_success "Containers started"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    sleep 10  # Wait for services to start
    
    # Check backend
    if curl -f http://localhost:8000/health &> /dev/null; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        return 1
    fi
    
    log_success "All health checks passed"
}

# Show container status
show_status() {
    log_info "Container status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

# Show logs
show_logs() {
    log_info "Recent logs:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50
}

# Cleanup old images
cleanup() {
    log_info "Cleaning up old Docker images..."
    
    docker image prune -f
    
    log_success "Cleanup completed"
}

# Rollback function
rollback() {
    log_warning "Rolling back to previous version..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/meechain_backup_*.tar.gz 2>/dev/null | head -1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        log_info "Restoring from: $LATEST_BACKUP"
        tar -xzf "$LATEST_BACKUP" -C .
        
        # Restart containers
        docker-compose -f "$DOCKER_COMPOSE_FILE" down
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
        
        log_success "Rollback completed"
    else
        log_error "No backup found for rollback"
        exit 1
    fi
}

# Main deployment flow
main() {
    echo ""
    echo "=========================================="
    echo "  $PROJECT_NAME Production Deployment"
    echo "=========================================="
    echo ""
    
    # Check if rollback is requested
    if [ "$1" == "rollback" ]; then
        rollback
        exit 0
    fi
    
    # Normal deployment flow
    check_prerequisites
    create_directories
    backup_deployment
    pull_latest_code
    stop_containers
    build_images
    start_containers
    
    # Health check with retry
    if ! health_check; then
        log_error "Health check failed, rolling back..."
        rollback
        exit 1
    fi
    
    show_status
    cleanup
    
    echo ""
    log_success "Deployment completed successfully!"
    echo ""
    echo "=========================================="
    echo "  Access URLs:"
    echo "  - Frontend: https://meechain.io"
    echo "  - API: https://api.meechain.io"
    echo "  - RPC: https://rpc.meechain.run.place"
    echo "  - API Docs: https://api.meechain.io/docs"
    echo "=========================================="
    echo ""
    
    # Show logs option
    read -p "Show recent logs? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        show_logs
    fi
}

# Run main function
main "$@"
