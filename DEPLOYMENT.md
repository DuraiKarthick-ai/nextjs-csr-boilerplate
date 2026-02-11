# Installation & Deployment Guide

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Environment

Create `.env`:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=https://api.example.com

# Ping OAuth
NEXT_PUBLIC_PING_ISSUER=https://auth.pingone.com/your-env/as
NEXT_PUBLIC_PING_CLIENT_ID=your-client-id
NEXT_PUBLIC_PING_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_PING_LOGOUT_URI=http://localhost:3000
NEXT_PUBLIC_PING_SCOPE=openid profile email
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Production Build

### Local Build

```bash
npm run build
npm run start
```

### Docker Build

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t nextjs-app .
docker run -p 3000:3000 nextjs-app
```

## Deployment Platforms

### Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy**:
```bash
vercel
```

3. **Add Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all `NEXT_PUBLIC_*` variables

4. **Update Ping Redirect URIs**:
   - Add production callback URL
   - Example: `https://your-app.vercel.app/auth/callback`

### Netlify

1. **Install Netlify CLI**:
```bash
npm i -g netlify-cli
```

2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Add environment variables** in Netlify dashboard

### AWS Amplify

1. Connect your Git repository
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
3. Add environment variables
4. Deploy

### Self-Hosted (VPS/EC2)

1. **Setup Node.js**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone and Install**:
```bash
git clone <your-repo>
cd nextjs-csr-boilerplate
npm install
```

3. **Create `.env.production`** with production values

4. **Build**:
```bash
npm run build
```

5. **Setup PM2** (Process Manager):
```bash
npm install -g pm2
pm2 start npm --name "nextjs-app" -- start
pm2 save
pm2 startup
```

6. **Setup Nginx** (reverse proxy):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables for Production

Update these in your deployment platform:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_PING_ISSUER=https://auth.pingone.com/prod-env/as
NEXT_PUBLIC_PING_CLIENT_ID=prod-client-id
NEXT_PUBLIC_PING_REDIRECT_URI=https://your-domain.com/auth/callback
NEXT_PUBLIC_PING_LOGOUT_URI=https://your-domain.com
NEXT_PUBLIC_PING_SCOPE=openid profile email
NEXT_PUBLIC_ENV=production
```

## Ping Production Configuration

1. **Create Production Application** in Ping Console
2. **Update Redirect URIs**:
   - Add: `https://your-domain.com/auth/callback`
   - Add: `https://your-domain.com`
3. **Enable PKCE**: Must be enabled
4. **Grant Types**: Authorization Code
5. **Copy Production Client ID**

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Ping redirect URIs updated
- [ ] API CORS configured for production domain
- [ ] SSL/HTTPS enabled
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy in place

## Monitoring & Logging

### Vercel Analytics
- Automatically available in Vercel
- Check dashboard for performance metrics

### Sentry Integration

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV,
});
```

### Custom Logging

Add to `lib/logger.ts`:

```typescript
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_ENV === 'production') {
      // Send to logging service
    } else {
      console.log(message, data);
    }
  },
  error: (message: string, error: any) => {
    if (process.env.NEXT_PUBLIC_ENV === 'production') {
      // Send to error tracking service
    } else {
      console.error(message, error);
    }
  },
};
```

## Troubleshooting Deployment

### Build Fails
- Check TypeScript errors: `npm run type-check`
- Check ESLint: `npm run lint`
- Ensure all environment variables are set

### Runtime Errors
- Check browser console for errors
- Verify API endpoints are accessible
- Check CORS settings on API

### Authentication Issues
- Verify Ping redirect URIs match exactly
- Check environment variables are loaded
- Ensure HTTPS in production

## Security Recommendations

1. **Enable HTTPS** - Always use HTTPS in production
2. **Environment Variables** - Never commit `.env` to git
3. **API Keys** - Rotate keys regularly
4. **CORS** - Configure API CORS properly
5. **CSP Headers** - Configure Content Security Policy
6. **Rate Limiting** - Implement on API endpoints
7. **Monitoring** - Setup error tracking and alerts

## Performance Optimization

1. **Enable CDN** - Use Vercel Edge Network or CloudFlare
2. **Image Optimization** - Use Next.js Image component
3. **Code Splitting** - Automatic with Next.js
4. **Caching** - Configure TanStack Query cache
5. **Bundle Analysis** - Use `@next/bundle-analyzer`

## Support & Maintenance

- Regularly update dependencies: `npm update`
- Monitor security advisories: `npm audit`
- Review logs for errors
- Monitor performance metrics
- Keep documentation updated

---

**Ready to Deploy!** 🚀

Choose your deployment platform and follow the steps above.
