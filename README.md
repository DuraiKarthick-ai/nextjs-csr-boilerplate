# Signs MFE Application

This is the "Signs" micro-frontend (MFE) application. It is designed to be consumed by the main `portal-app` and exposes a single page component for displaying sign products.

## Overview

- **Framework:** [Next.js](https://nextjs.org/) 14
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Module Federation:** [@module-federation/nextjs-mf](https://www.npmjs.com/package/@module-federation/nextjs-mf)
- **Port:** `3001`

This application is responsible for fetching and displaying a list of "Sign" products from a backend API. It includes both client-side and server-side logic for data fetching and exposes its main component to be used in other applications.

## Key Features

### Module Federation

The `signs-app` is configured as a **remote** in the Module Federation setup.

- **Name:** `signs`
- **Exposes:**
  - `./ProductsPage`: The main React component located at `src/components/products/ProductsPage.tsx`.
- **Consumes:**
  - `portal/AuthContext`: Consumes the authentication context from the `portal-app` to get access to the user's session and tokens.

### API Proxy

To handle CORS issues when calling the backend API from the browser, this application uses a Next.js API route as a proxy.

- **Proxy Route:** `GET /api/items`
- **Backend Endpoint:** `http://34.149.59.244/api/v1/signs/items`

Client-side code should call the `/api/items` endpoint. The Next.js server will then make a server-to-server request to the real backend, bypassing browser CORS restrictions.

### Environment Variables

The application can be configured using the following environment variables. See `.env.example` for a template.

- `SIGNS_API_BASE_URL`: The base URL of the backend API (e.g., `http://34.149.59.244`).
- `NEXT_PUBLIC_PORTAL_REMOTE_URL_DEV`: The development URL of the portal host application (e.g., `http://localhost:3000`).
- `NEXT_PUBLIC_PORTAL_REMOTE_URL_PROD`: The production URL of the portal host application.
- `NEXT_PUBLIC_SIGNS_APP_URL`: The public URL of this signs-app. This is crucial for the client-side `apiClient` to correctly target the API proxy when running in a deployed environment.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)

### Installation

1.  Clone the repository.
2.  Navigate to the `signs-app` directory:
    ```bash
    cd signs-app
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running in Development

To start the development server on `http://localhost:3001`:

```bash
npm run dev
```

This application is intended to be run alongside the `portal-app`.

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
