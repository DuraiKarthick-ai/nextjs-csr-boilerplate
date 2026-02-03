# Complete File Structure

```
nextjs-csr-boilerplate/
├── .env.example                      # Environment variables template
├── .eslintrc.json                    # ESLint configuration
├── .gitignore                        # Git ignore rules
├── .prettierrc                       # Prettier configuration
├── next.config.js                    # Next.js configuration (CSR only)
├── package.json                      # Dependencies and scripts
├── postcss.config.js                 # PostCSS configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── README.md                         # Main documentation
├── QUICKSTART.md                     # Quick start guide
│
├── public/                           # Static assets
│   └── (add your static files here)
│
└── src/
    ├── app/                          # Next.js App Router
    │   ├── auth/                     # Authentication routes
    │   │   ├── callback/
    │   │   │   └── page.tsx         # OAuth callback handler
    │   │   └── login/
    │   │       └── page.tsx         # Login page
    │   ├── dashboard/
    │   │   └── page.tsx             # Protected dashboard
    │   ├── globals.css              # Global styles
    │   ├── layout.tsx               # Root layout
    │   ├── page.tsx                 # Home page
    │   └── providers.tsx            # Client providers wrapper
    │
    ├── components/                   # React components
    │   ├── auth/
    │   │   └── ProtectedRoute.tsx   # Route protection wrapper
    │   ├── common/
    │   │   ├── ErrorBoundary.tsx    # Error boundary component
    │   │   └── Loading.tsx          # Loading components
    │   ├── layout/
    │   │   ├── Header.tsx           # App header
    │   │   └── Sidebar.tsx          # Navigation sidebar
    │   └── ui/                       # Shadcn UI components
    │       ├── button.tsx
    │       └── card.tsx
    │
    ├── config/                       # Configuration files
    │   ├── constants.ts             # App constants
    │   └── env.ts                   # Environment validation
    │
    ├── contexts/                     # React contexts
    │   └── AuthContext.tsx          # Authentication context
    │
    ├── hooks/                        # Custom hooks
    │   ├── useApi.ts               # TanStack Query hooks
    │   └── useAuth.ts              # Auth hooks
    │
    ├── lib/                          # Utility libraries
    │   ├── api/
    │   │   └── client.ts           # Axios client with interceptors
    │   ├── auth/
    │   │   ├── jwt.ts              # JWT utilities
    │   │   ├── oauth.ts            # OAuth utilities
    │   │   ├── pkce.ts             # PKCE implementation
    │   │   └── tokenStorage.ts     # Token storage
    │   └── utils.ts                # Common utilities
    │
    ├── services/                     # API service layer
    │   ├── auth.service.ts         # Authentication service
    │   └── user.service.ts         # User service
    │
    ├── store/                        # State management
    │   └── useStore.ts             # Zustand store
    │
    └── types/                        # TypeScript definitions
        ├── api.types.ts            # API types
        ├── auth.types.ts           # Auth types
        └── user.types.ts           # User types
```

## Key Files Explained

### Configuration Files

- **next.config.js**: Configured for CSR only, security headers
- **tsconfig.json**: Strict TypeScript with path aliases
- **tailwind.config.ts**: Tailwind with Shadcn UI colors
- **.env.example**: Template for environment variables

### Authentication Flow

1. **Login**: `app/auth/login/page.tsx` → Redirects to Ping
2. **Callback**: `app/auth/callback/page.tsx` → Exchanges code for tokens
3. **Token Storage**: `lib/auth/tokenStorage.ts` → In-memory storage
4. **Auto Refresh**: `contexts/AuthContext.tsx` → Automatic token refresh

### API Integration

1. **Client**: `lib/api/client.ts` → Axios with interceptors
2. **Services**: `services/*.service.ts` → API service layer
3. **Hooks**: `hooks/useApi.ts` → TanStack Query hooks

### State Management

- **Auth State**: Context API in `contexts/AuthContext.tsx`
- **Global State**: Zustand in `store/useStore.ts`
- **API Cache**: TanStack Query

### Component Structure

- **UI Components**: Shadcn UI in `components/ui/`
- **Auth Components**: `components/auth/`
- **Layout**: `components/layout/`
- **Common**: Shared components in `components/common/`

## Environment Variables

All environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

Required variables:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_PING_ISSUER`
- `NEXT_PUBLIC_PING_CLIENT_ID`
- `NEXT_PUBLIC_PING_REDIRECT_URI`
- `NEXT_PUBLIC_PING_LOGOUT_URI`
- `NEXT_PUBLIC_PING_SCOPE`

## Adding New Features

### New Protected Page
1. Create page in `src/app/[name]/page.tsx`
2. Wrap with `<ProtectedRoute>`
3. Add to sidebar navigation

### New API Endpoint
1. Add types in `src/types/`
2. Create service in `src/services/`
3. Create hook in `src/hooks/useApi.ts`
4. Use in component

### New UI Component
1. Add to `src/components/ui/` (if Shadcn)
2. Or `src/components/common/` (if custom)
3. Export and import where needed

## Security Features

- ✅ PKCE for OAuth 2.0
- ✅ Tokens in memory (not localStorage)
- ✅ Automatic token refresh
- ✅ CSRF protection via state parameter
- ✅ XSS protection (React default)
- ✅ Security headers configured
- ✅ Environment variable validation
