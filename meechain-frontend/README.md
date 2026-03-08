# MeeChain Frontend Dashboard

A modern React/Next.js dashboard for MeeChain backend management, built with TypeScript, TailwindCSS, and Recharts.

## 🚀 Features

- **Dashboard Overview**: Real-time system metrics and activity monitoring
- **Contributors Management**: View and manage all contributors with badges
- **RPC Analytics**: Monitor RPC usage with interactive charts
- **Configuration Management**: Secure configuration viewing and management
- **Audit Logs**: Comprehensive activity logging and filtering
- **Responsive Design**: Mobile-friendly interface
- **Real-time Data**: Mock data with API integration ready

## 📁 Project Structure

```
meechain-frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard overview
│   ├── contributors/      # Contributors management
│   ├── rpc/              # RPC analytics
│   ├── config/           # Configuration management
│   └── logs/             # Audit logs
├── components/            # Reusable UI components
│   ├── Navbar.tsx        # Navigation bar
│   ├── Sidebar.tsx       # Sidebar navigation
│   ├── TokenStatus.tsx   # JWT token status
│   ├── RpcGraph.tsx      # RPC usage charts
│   ├── BadgeGallery.tsx  # Badge display
│   └── ContributorCard.tsx # Contributor cards
├── utils/                 # Utility functions
│   └── api.ts            # API client for FastAPI backend
└── public/               # Static assets
```

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Charting library
- **Lucide React** - Icon library
- **Axios** - HTTP client

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd meechain-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Configure environment (optional):
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔌 API Integration

The dashboard is designed to connect with the MeeChain FastAPI backend. Update the API base URL in `utils/api.ts`:

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  // ...
});
```

### Available Endpoints

- `GET /dashboard/contributors` - Get contributor list
- `GET /dashboard/badges` - Get badge definitions
- `GET /dashboard/rpc-usage` - Get RPC usage statistics
- `GET /dashboard/token-status` - Get JWT token status
- `GET /dashboard/logs` - Get audit logs
- `GET /dashboard/config` - Get configuration (admin only)
- `GET /health` - Health check
- `GET /me` - Get identity (requires JWT)
- `POST /rpc` - Send RPC call (requires JWT)

## 📱 Pages

### 1. Dashboard Overview (`/`)
- System statistics
- Token status
- Top contributors
- RPC usage summary
- Recent activity

### 2. Contributors (`/contributors`)
- Contributor list with filtering
- Badge gallery
- Role distribution
- Activity metrics

### 3. RPC Usage (`/rpc`)
- Interactive charts
- RPC call tester
- Recent calls table
- Quota information

### 4. Configuration (`/config`)
- Secure configuration viewing
- Secret management
- Environment variables
- Security notes

### 5. Audit Logs (`/logs`)
- Log filtering and search
- Export functionality
- Log distribution
- Recent activity

## 🎨 Styling

- Uses TailwindCSS for styling
- Custom color scheme with consistent design
- Responsive breakpoints for mobile/tablet/desktop
- Smooth animations and transitions

## 🔒 Security Features

- Secret masking for sensitive data
- Copy protection for API keys
- Role-based UI elements (planned)
- Secure API communication

## 🧪 Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Starting Production Server
```bash
npm start
```

## 📊 Mock Data

The dashboard includes mock data for demonstration. To connect to the real backend:

1. Ensure the FastAPI backend is running
2. Update API URLs in `utils/api.ts`
3. Implement authentication flow (JWT tokens)

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] JWT authentication flow
- [ ] Role-based access control
- [ ] Dark mode toggle
- [ ] Export functionality for all pages
- [ ] Advanced filtering and search
- [ ] Performance monitoring
- [ ] Integration with monitoring tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Recharts](https://recharts.org/) for charts
- [Lucide](https://lucide.dev/) for icons

---

Built with ❤️ for the MeeChain ecosystem