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

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production build of the application.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase for errors.
- `npm run format`: Formats the code using Prettier.
- `npm run type-check`: Runs the TypeScript compiler to check for type errors.
