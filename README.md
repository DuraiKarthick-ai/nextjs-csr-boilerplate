# Next.js 14 CSR Boilerplate with Ping Authentication

A production-ready Next.js 14 boilerplate with client-side rendering, Ping OAuth 2.0 authentication, and comprehensive API integration.

## Features

- ✅ **Client-Side Rendering Only** - No SSR/SSG
- 🔐 **Ping Authentication** - OAuth 2.0 with PKCE flow
- 🔄 **Automatic Token Refresh** - Seamless token management
- 🛡️ **Protected Routes** - Route guards with redirect logic
- 📡 **API Integration** - Axios with interceptors and auto token injection
- 🎯 **State Management** - Zustand + Context API
- 📊 **Data Fetching** - TanStack Query with caching
- 🎨 **Modern UI** - Shadcn/ui + Tailwind CSS
- 🔔 **Toast Notifications** - React Hot Toast
- 🚨 **Error Boundaries** - Comprehensive error handling
- 📝 **TypeScript** - Strict mode enabled
- 🧪 **Code Quality** - ESLint + Prettier configured

## Tech Stack

- **Framework**: Next.js 14 (App Router, CSR only)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand + Context API
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Authentication**: Ping OAuth 2.0 with PKCE
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier

## Prerequisites

- Node.js 18.x or higher
- npm or yarn or pnpm
- Ping account with OAuth 2.0 configuration

## Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd nextjs-csr-boilerplate

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=https://api.example.com

# Ping OAuth Configuration
NEXT_PUBLIC_PING_ISSUER=https://auth.pingone.com/your-environment-id/as
NEXT_PUBLIC_PING_CLIENT_ID=your-client-id
NEXT_PUBLIC_PING_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_PING_LOGOUT_URI=http://localhost:3000
NEXT_PUBLIC_PING_SCOPE=openid profile email

# Optional: Additional Configuration
NEXT_PUBLIC_ENV=development
```

### 3. Ping OAuth Setup

1. **Create OAuth 2.0 Application** in PingOne/PingFederate
2. **Set Redirect URIs**:
   - Callback: `http://localhost:3000/auth/callback`
   - Logout: `http://localhost:3000`
3. **Enable PKCE** (Proof Key for Code Exchange)
4. **Grant Types**: Authorization Code
5. **Scopes**: openid, profile, email (add custom scopes as needed)
6. **Copy Client ID** to your `.env.local`

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nextjs-csr-boilerplate/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── callback/         # OAuth callback handler
│   │   │   └── login/            # Login page
│   │   ├── dashboard/            # Protected dashboard
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   └── providers.tsx         # Client-side providers
│   ├── components/               # React components
│   │   ├── auth/                 # Auth-related components
│   │   ├── common/               # Shared components
│   │   ├── layout/               # Layout components
│   │   └── ui/                   # Shadcn UI components
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.tsx       # Authentication context
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts           # Authentication hook
│   │   └── useApi.ts            # API query hooks
│   ├── lib/                      # Utility libraries
│   │   ├── api/                  # API client and services
│   │   ├── auth/                 # Auth utilities (PKCE, tokens)
│   │   └── utils.ts              # Common utilities
│   ├── services/                 # API service layer
│   │   ├── auth.service.ts      # Auth API calls
│   │   └── user.service.ts      # User API calls
│   ├── store/                    # Zustand stores
│   │   └── useStore.ts          # Global state store
│   ├── types/                    # TypeScript definitions
│   │   ├── api.types.ts         # API types
│   │   ├── auth.types.ts        # Auth types
│   │   └── user.types.ts        # User types
│   └── config/                   # Configuration
│       ├── env.ts               # Environment validation
│       └── constants.ts         # App constants
├── public/                       # Static files
├── .env.local                    # Environment variables (create this)
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## Key Features Explained

### Authentication Flow

1. **Login**: User clicks login → Redirected to Ping with PKCE challenge
2. **Callback**: Ping redirects back → Exchange code for tokens
3. **Token Storage**: Tokens stored in memory (secure)
4. **Auto Refresh**: Refresh token automatically before expiration
5. **Logout**: Clear local tokens + Ping session termination

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

### API Integration

```tsx
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

function Profile() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: userService.getProfile,
  });

  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return <div>{data.name}</div>;
}
```

### State Management

```tsx
import { useStore } from '@/store/useStore';

function Component() {
  const { theme, setTheme } = useStore();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Current: {theme}
    </button>
  );
}
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
npm run type-check   # Run TypeScript compiler check
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NEXT_PUBLIC_API_BASE_URL` | API base URL | Yes |
| `NEXT_PUBLIC_PING_ISSUER` | Ping issuer URL | Yes |
| `NEXT_PUBLIC_PING_CLIENT_ID` | Ping OAuth client ID | Yes |
| `NEXT_PUBLIC_PING_REDIRECT_URI` | OAuth callback URL | Yes |
| `NEXT_PUBLIC_PING_LOGOUT_URI` | Logout redirect URL | Yes |
| `NEXT_PUBLIC_PING_SCOPE` | OAuth scopes | Yes |

## Security Features

- ✅ PKCE implementation for OAuth 2.0
- ✅ Tokens stored in memory (not localStorage)
- ✅ Automatic token refresh
- ✅ CSRF protection
- ✅ XSS protection via React
- ✅ Environment variable validation
- ✅ Secure HTTP headers (CSP ready)
- ✅ Protected route guards

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard.

### Docker

```bash
# Build
docker build -t nextjs-app .

# Run
docker run -p 3000:3000 nextjs-app
```

### Other Platforms

Build the application:

```bash
npm run build
npm run start
```

## Customization

### Adding New API Endpoints

1. Define types in `src/types/`
2. Create service in `src/services/`
3. Use in components with TanStack Query

### Adding New Routes

1. Create page in `src/app/`
2. Wrap with `<ProtectedRoute>` if authentication needed
3. Add navigation links

### Styling

- Global styles: `src/app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Add components: `npx shadcn-ui@latest add [component]`

## Troubleshooting

### Authentication Issues

1. **Verify Ping configuration** matches `.env.local`
2. **Check redirect URIs** are exactly the same
3. **Ensure PKCE is enabled** in Ping
4. **Check browser console** for detailed errors

### API Issues

1. **Verify API_BASE_URL** is correct
2. **Check network tab** for request/response
3. **Ensure tokens are valid** (not expired)
4. **Check CORS configuration** on API server

### Build Issues

1. Run `npm run type-check` for TypeScript errors
2. Run `npm run lint` for ESLint errors
3. Clear `.next` folder and rebuild

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Check the [documentation](docs/)
- Open an issue on GitHub
- Contact support team

---

***Built with ❤️ using Next.js 14*** 