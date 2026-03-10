#!/bin/bash

# =================================
# MeeChain Monitoring Script
# =================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND_URL="http://localhost:8000/health"
FRONTEND_URL="http://localhost:3000"
RPC_URL="https://rpc.meechain.run.place"
CHECK_INTERVAL=30
ALERT_EMAIL="devops@meechain.io"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL}"

# Functions
log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ✓ $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ⚠ $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} ✗ $1"
}

# Check service health
check_service() {
    local name=$1
    local url=$2
    local timeout=${3:-10}
    
    if curl -f -s -m "$timeout" "$url" > /dev/null 2>&1; then
        log_success "$name is healthy"
        return 0
    else
        log_error "$name is down!"
        return 1
    fi
}

# Check Docker containers
check_containers() {
    log_info "Checking Docker containers..."
    
    local containers=("meechain-backend" "meechain-frontend" "meechain-nginx")
    local all_healthy=true
    
    for container in "${containers[@]}"; do
        if docker ps --filter "name=$container" --filter "status=running" | grep -q "$container"; then
            log_success "$container is running"
        else
            log_error "$container is not running!"
            all_healthy=false
        fi
    done
    
    return $([ "$all_healthy" = true ] && echo 0 || echo 1)
}

# Check disk space
check_disk_space() {
    log_info "Checking disk space..."
    
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 80 ]; then
        log_success "Disk usage: ${usage}%"
    elif [ "$usage" -lt 90 ]; then
        log_warning "Disk usage: ${usage}% (Warning threshold)"
    else
        log_error "Disk usage: ${usage}% (Critical threshold)"
        return 1
    fi
    
    return 0
}

# Check memory usage
check_memory() {
    log_info "Checking memory usage..."
    
    local usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    
    if [ "$usage" -lt 80 ]; then
        log_success "Memory usage: ${usage}%"
    elif [ "$usage" -lt 90 ]; then
        log_warning "Memory usage: ${usage}% (Warning threshold)"
    else
        log_error "Memory usage: ${usage}% (Critical threshold)"
        return 1
    fi
    
    return 0
}

# Check SSL certificate expiry
check_ssl_cert() {
    log_info "Checking SSL certificate..."
    
    local cert_path="/etc/letsencrypt/live/rpc.meechain.run.place/fullchain.pem"
    
    if [ -f "$cert_path" ]; then
        local expiry_date=$(openssl x509 -enddate -noout -in "$cert_path" | cut -d= -f2)
        local expiry_epoch=$(date -d "$expiry_date" +%s)
        local current_epoch=$(date +%s)
        local days_left=$(( ($expiry_epoch - $current_epoch) / 86400 ))
        
        if [ "$days_left" -gt 30 ]; then
            log_success "SSL certificate valid for $days_left days"
        elif [ "$days_left" -gt 7 ]; then
            log_warning "SSL certificate expires in $days_left days"
        else
            log_error "SSL certificate expires in $days_left days!"
            return 1
        fi
    else
        log_error "SSL certificate not found!"
        return 1
    fi
    
    return 0
}

# Send Slack notification
send_slack_notification() {
    local message=$1
    local color=${2:-"danger"}
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-Type: application/json' \
            -d "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"MeeChain Alert\",
                    \"text\": \"$message\",
                    \"footer\": \"MeeChain Monitoring\",
                    \"ts\": $(date +%s)
                }]
            }" > /dev/null 2>&1
    fi
}

# Send email notification
send_email_notification() {
    local subject=$1
    local body=$2
    
    if command -v mail &> /dev/null; then
        echo "$body" | mail -s "$subject" "$ALERT_EMAIL"
    fi
}

# Main monitoring loop
monitor() {
    log_info "Starting MeeChain monitoring..."
    
    while true; do
        echo ""
        echo "=========================================="
        echo "  Health Check - $(date '+%Y-%m-%d %H:%M:%S')"
        echo "=========================================="
        
        local all_healthy=true
        local issues=""
        
        # Check services
        if ! check_service "Backend API" "$BACKEND_URL"; then
            all_healthy=false
            issues="$issues\n- Backend API is down"
        fi
        
        if ! check_service "Frontend" "$FRONTEND_URL"; then
            all_healthy=false
            issues="$issues\n- Frontend is down"
        fi
        
        if ! check_service "RPC Endpoint" "$RPC_URL"; then
            all_healthy=false
            issues="$issues\n- RPC endpoint is down"
        fi
        
        # Check containers
        if ! check_containers; then
            all_healthy=false
            issues="$issues\n- Some containers are not running"
        fi
        
        # Check resources
        if ! check_disk_space; then
            all_healthy=false
            issues="$issues\n- Disk space critical"
        fi
        
        if ! check_memory; then
            all_healthy=false
            issues="$issues\n- Memory usage critical"
        fi
        
        # Check SSL
        if ! check_ssl_cert; then
            all_healthy=false
            issues="$issues\n- SSL certificate issue"
        fi
        
        # Send alerts if issues found
        if [ "$all_healthy" = false ]; then
            log_error "Health check failed!"
            send_slack_notification "MeeChain health check failed:$issues" "danger"
            send_email_notification "MeeChain Alert: Health Check Failed" "Issues detected:$issues"
        else
            log_success "All systems healthy"
        fi
        
        echo "=========================================="
        echo ""
        
        # Wait before next check
        sleep "$CHECK_INTERVAL"
    done
}

# One-time check mode
check_once() {
    echo ""
    echo "=========================================="
    echo "  MeeChain Health Check"
    echo "=========================================="
    echo ""
    
    check_service "Backend API" "$BACKEND_URL"
    check_service "Frontend" "$FRONTEND_URL"
    check_service "RPC Endpoint" "$RPC_URL"
    check_containers
    check_disk_space
    check_memory
    check_ssl_cert
    
    echo ""
    echo "=========================================="
    echo ""
}

# Main
if [ "$1" == "once" ]; then
    check_once
else
    monitor
fi
