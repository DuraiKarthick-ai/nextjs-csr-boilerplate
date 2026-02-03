# Quick Start Guide

This guide will help you get the Next.js CSR boilerplate running in minutes.

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm
- A Ping OAuth application configured

## Step 1: Installation

```bash
# Install dependencies
npm install
```

## Step 2: Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Ping OAuth credentials:

```env
NEXT_PUBLIC_PING_ISSUER=https://auth.pingone.com/YOUR-ENV-ID/as
NEXT_PUBLIC_PING_CLIENT_ID=your-client-id
NEXT_PUBLIC_PING_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com
```

## Step 3: Ping OAuth Configuration

In your Ping console:

1. **Create an Application** (if not already created)
2. **Set Application Type**: Web Application
3. **Enable PKCE**: Required for security
4. **Add Redirect URIs**:
   - `http://localhost:3000/auth/callback` (development)
   - Your production callback URL (when deployed)
5. **Add Logout URI**: `http://localhost:3000`
6. **Set Scopes**: `openid`, `profile`, `email`
7. **Grant Types**: Authorization Code
8. **Copy Client ID** to your `.env.local`

## Step 4: API Configuration (Optional)

If you have a backend API:

1. Update `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
2. Ensure your API accepts Bearer tokens in Authorization header
3. Update API endpoints in `src/config/constants.ts`

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Test Authentication

1. Click "Get Started" or "Login"
2. You'll be redirected to Ping
3. Login with your Ping credentials
4. You'll be redirected back to the dashboard

## Project Structure Overview

```
src/
├── app/              # Next.js pages
│   ├── auth/        # Authentication pages
│   └── dashboard/   # Protected dashboard
├── components/       # React components
│   ├── auth/        # Auth components
│   ├── common/      # Shared components
│   ├── layout/      # Layout components
│   └── ui/          # UI components
├── contexts/        # React contexts (Auth)
├── hooks/           # Custom hooks
├── lib/             # Utilities
│   ├── api/         # API client
│   └── auth/        # Auth utilities
├── services/        # API services
├── store/           # Zustand store
├── types/           # TypeScript types
└── config/          # Configuration
```

## Common Tasks

### Adding New Protected Routes

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Making API Calls

```tsx
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getProfile(),
  });
  
  if (isLoading) return <Loading />;
  return <div>{data.name}</div>;
}
```

### Using Global State

```tsx
import { useStore } from '@/store/useStore';

function MyComponent() {
  const { theme, setTheme } = useStore();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Current: {theme}
    </button>
  );
}
```

## Troubleshooting

### "State mismatch" error
- Clear browser cache and cookies
- Check that redirect URI matches exactly

### "Failed to fetch" errors
- Verify API_BASE_URL is correct
- Check CORS settings on your API
- Ensure API is running

### TypeScript errors
- Run `npm run type-check`
- Check tsconfig.json settings

### Build errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Next Steps

1. **Customize the UI**: Update colors in `tailwind.config.ts`
2. **Add More Routes**: Create new pages in `src/app`
3. **Add API Endpoints**: Create services in `src/services`
4. **Deploy**: Use Vercel, Netlify, or your preferred platform

## Need Help?

- Check the main [README.md](./README.md)
- Review the code comments
- Check Ping documentation
- Open an issue on GitHub

Happy coding! 🚀
