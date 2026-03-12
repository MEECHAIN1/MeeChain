# 🚀 MeeChain - Contributor Management Platform

## 📋 Overview

MeeChain is a comprehensive platform for managing contributors, tracking RPC usage, awarding badges, and monitoring system health. Built with modern technologies and best practices.

## 🏗️ Architecture

### Backend (FastAPI)
- **Authentication**: Auth0 JWT with RS256 verification
- **RPC Proxy**: NodeReal BSC RPC with rate limiting & quotas
- **Badge System**: 9 badge types with composite logic
- **Dashboard**: Contributor stats, admin logs, system monitoring
- **Security**: JWT validation, rate limiting, audit logging

### Frontend (Next.js/React)
- **Dashboard**: 5 interactive pages for contributors and admins
- **Components**: Reusable UI components with TailwindCSS
- **Charts**: Interactive RPC usage analytics with Recharts
- **Responsive**: Mobile-first design for all screen sizes

## 🚀 Quick Start

### Prerequisites
- Python 3.11+ for backend
- Node.js 18+ for frontend
- Docker (optional, for containerization)

### Backend Setup
```bash
cd meechain-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd meechain-frontend
npm install
npm run dev
```

### Docker Setup
```bash
# Backend
docker build -t meechain-backend ./meechain-backend
docker run -p 8000:8000 meechain-backend

# Frontend
docker build -t meechain-frontend ./meechain-frontend
docker run -p 3000:3000 meechain-frontend
```

## 📁 Project Structure

```
MeeChain-Project/
├── meechain-backend/          # FastAPI Backend
│   ├── .github/              # CI/CD, Dependabot, PR templates
│   ├── dashboard/            # Dashboard routes
│   ├── *.py                  # Core modules
│   └── requirements.txt      # Python dependencies
├── meechain-frontend/        # Next.js Frontend
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # React components
│   ├── utils/                # Utility functions
│   └── public/               # Static assets
└── README.md                 # This file
```

## 🔧 Features

### Backend Features
- ✅ **Authentication**: JWT validation with Auth0
- ✅ **RPC Proxy**: Secure BSC RPC calls with quotas
- ✅ **Badge System**: Award badges based on contributor activity
- ✅ **Dashboard API**: Stats, logs, and monitoring endpoints
- ✅ **Security**: Rate limiting, input validation, audit logging
- ✅ **Documentation**: OpenAPI/Swagger, ReDoc, API documentation

### Frontend Features
- ✅ **Dashboard**: Overview, contributors, RPC usage, config, logs
- ✅ **Interactive Charts**: RPC usage analytics with Recharts
- ✅ **Responsive Design**: Mobile, tablet, desktop support
- ✅ **Type Safety**: TypeScript for all components
- ✅ **Modern UI**: TailwindCSS with Lucide icons

### DevOps Features
- ✅ **CI/CD**: GitHub Actions for testing, building, deployment
- ✅ **Dependabot**: Automated dependency updates
- ✅ **Code Review**: AI-powered reviews with CodeRabbit
- ✅ **Security Scanning**: Trivy, Bandit, npm audit
- ✅ **Docker Support**: Containerization for both services

## 📊 API Endpoints

### Public Endpoints
- `GET /health` - System health check
- `GET /docs` - Swagger UI documentation
- `GET /redoc` - ReDoc documentation

### Protected Endpoints (JWT required)
- `GET /me` - Get identity from JWT
- `POST /rpc` - Proxy RPC call to BSC
- `GET /badges` - Get personal badges
- `GET /dashboard/my/stats` - Personal stats
- `GET /dashboard/admin/logs` - Admin audit logs

## 🛡️ Security

### Authentication
- JWT tokens with RS256 verification
- Auth0 integration for identity management
- Scope-based authorization

### Rate Limiting
- 60 requests per minute per user
- 1000 requests per day per user
- Distributed rate limiting ready

### Security Features
- Input validation with Pydantic
- No hardcoded secrets
- Security headers
- Audit logging

## 🚀 Deployment

### Environment Variables
```env
# Backend
AUTH0_DOMAIN=meechain.ua.auth0.com
AUTH0_AUDIENCE=https://api.meechain.run.place
NODEREAL_API_KEY=your-nodereal-api-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Deployment Options
1. **Docker Compose** - Local development and production
2. **Kubernetes** - Production deployment with scaling
3. **Vercel** - Frontend deployment (recommended)
4. **Render/Railway** - Backend deployment

## 📈 Monitoring & Observability

### Health Checks
- `GET /health` - Backend health
- Frontend health check via HTTP status

### Metrics
- RPC call statistics
- Error rates and latency
- User activity tracking
- System resource usage

### Logging
- Structured logging for both services
- Audit trails for security events
- Centralized log aggregation

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** changes with tests
4. **Submit** a pull request
5. **Get** AI code review from CodeRabbit
6. **Merge** after approval

### Code Standards
- Follow PEP 8 for Python
- Use TypeScript for frontend
- Write comprehensive tests
- Update documentation
- Consider security implications

## 📚 Documentation

### Available Documentation
- [API Documentation](http://localhost:8000/docs) - Swagger UI
- [ReDoc](http://localhost:8000/redoc) - Alternative API docs
- [Deployment Guide](./DEPLOYMENT.md) - Deployment instructions
- [CI/CD Guide](./CI_CD_DOCUMENTATION.md) - Pipeline documentation
- [Dependabot Guide](./DEPENDABOT_GUIDE.md) - Dependency management

## 🎯 Roadmap

### Phase 1 (Complete) ✅
- Backend API with authentication
- Frontend dashboard
- Basic CI/CD pipeline
- Documentation

### Phase 2 (In Progress) 🔄
- Redis integration for distributed rate limiting
- PostgreSQL for persistent badge storage
- Advanced monitoring with Prometheus/Grafana
- Real-time updates with WebSockets

### Phase 3 (Planned) 📅
- Multi-chain RPC support
- Advanced analytics dashboard
- Mobile application
- Community features

## 🆘 Support

### Getting Help
- **GitHub Issues**: For bugs and feature requests
- **Documentation**: Check available guides first
- **Community**: Join our Discord/Slack

### Emergency Contacts
- **Security Issues**: security@meechain.io
- **Production Issues**: ops@meechain.io
- **General Support**: support@meechain.io

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** for the amazing Python framework
- **Next.js** for the React framework
- **TailwindCSS** for styling
- **Auth0** for authentication
- **NodeReal** for BSC RPC access

---

**✨ Built with ❤️ for the MeeChain community** 🚀

*"Empowering contributors, one badge at a time"*
