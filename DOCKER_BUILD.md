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

Cloud Build / GCP note
----------------------
To run this repository using Cloud Build, the provided `cloudbuild.yaml` passes build-args from substitutions. When creating or editing your Cloud Build trigger, set the substitutions prefixed with an underscore (for example `_NEXT_PUBLIC_APP_URL`). Alternatively, configure the trigger to read values from Secret Manager and map them to the substitutions.

Example: when creating a trigger in the Cloud Console, under "Substitution variables" add `_NEXT_PUBLIC_APP_URL` and others, then run the trigger. The build will pass these into the Dockerfile as build-args so Next.js can build successfully inside the container.
