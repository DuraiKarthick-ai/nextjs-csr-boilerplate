# Building the Docker image with required envs

The Next.js build step requires several runtime/build-time environment variables. When building inside Docker (multi-stage), pass them as build-args so the build stage picks them up.

Example local Docker build command (PowerShell):

```powershell
docker build . -t frontend:latest `
  --build-arg NEXT_PUBLIC_APP_URL="https://app.example.com" `
  --build-arg NEXT_PUBLIC_API_BASE_URL="https://api.example.com" `
  --build-arg NEXT_PUBLIC_PING_ISSUER="https://example-ping-issuer.com" `
  --build-arg NEXT_PUBLIC_PING_CLIENT_ID="your-client-id" `
  --build-arg NEXT_PUBLIC_PING_REDIRECT_URI="https://app.example.com/auth/callback" `
  --build-arg NEXT_PUBLIC_PING_LOGOUT_URI="https://app.example.com/" `
  --build-arg NEXT_PUBLIC_PING_SCOPE="openid profile email"
```

Then push and deploy the resulting image to your registry and update your Kubernetes deployment.

CI note
- In CI (Cloud Build / GitHub Actions), inject the values as build-args too. If values are secrets, retrieve them from Secret Manager and pass them as build-args at build time.

Security note
- NEXT_PUBLIC_* variables are embedded in the client bundle and are public; avoid placing secrets in NEXT_PUBLIC_* variables. For sensitive values, use server-only env vars and Kubernetes Secrets.
