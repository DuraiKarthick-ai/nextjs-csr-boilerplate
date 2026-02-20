// src/app/auth/login/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Shield } from 'lucide-react';
import { ROUTES } from '@/config/constants';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (!isLoading && isAuthenticated) {
      const returnUrl = sessionStorage.getItem('returnUrl') || ROUTES.DASHBOARD;
      sessionStorage.removeItem('returnUrl');
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = () => {
    // If you want users to land on Receive-Change after login, store that as the return URL
    try {
      sessionStorage.setItem('returnUrl', ROUTES.RECEIVE_CHANGE);
    } catch (e) {
      // ignore storage errors
    }

    // Debug: ensure handler runs
    // eslint-disable-next-line no-console
    console.log('Login button clicked - initiating login flow');

    // call the auth login
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => { await login(); })();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="mt-2">
              Sign in to your account using Ping authentication
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={handleLogin} className="w-full gap-2" size="lg">
            <LogIn className="h-5 w-5" />
            Sign in with Ping
          </Button>

          <div className="space-y-2 rounded-lg bg-muted p-4">
            <h3 className="text-sm font-semibold">Secure Login</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• OAuth 2.0 with PKCE</li>
              <li>• Enterprise-grade security</li>
              <li>• Automatic token refresh</li>
            </ul>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
