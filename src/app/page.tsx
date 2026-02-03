// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Shield, Zap, Lock, Cloud, Code, Users } from 'lucide-react';
import { ROUTES } from '@/config/constants';

const features = [
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'OAuth 2.0 with PKCE flow and automatic token refresh',
  },
  {
    icon: Zap,
    title: 'Fast & Modern',
    description: 'Next.js 14 with client-side rendering for optimal performance',
  },
  {
    icon: Lock,
    title: 'Protected Routes',
    description: 'Built-in route guards and role-based access control',
  },
  {
    icon: Cloud,
    title: 'API Ready',
    description: 'Axios client with interceptors and error handling',
  },
  {
    icon: Code,
    title: 'TypeScript',
    description: 'Fully typed with strict mode for better DX',
  },
  {
    icon: Users,
    title: 'Production Ready',
    description: 'Error boundaries, loading states, and toast notifications',
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Next.js CSR Boilerplate
            </h1>
            <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
              Production-ready boilerplate with Ping authentication, TypeScript, and modern tooling
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {isAuthenticated ? (
                <Link href={ROUTES.DASHBOARD}>
                  <Button size="lg" className="w-full sm:w-auto">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href={ROUTES.LOGIN}>
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
              )}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="lg" className="w-full">
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 py-20">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Features</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to build modern web applications
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="container py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Tech Stack</h2>
              <p className="text-lg text-muted-foreground">
                Built with modern technologies and best practices
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[
                'Next.js 14',
                'TypeScript',
                'Tailwind CSS',
                'Shadcn/ui',
                'TanStack Query',
                'Zustand',
                'Axios',
                'React Hot Toast',
                'Ping OAuth',
              ].map((tech, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="py-6">
                    <p className="font-medium">{tech}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Built with ❤️ using Next.js 14</p>
        </div>
      </footer>
    </div>
  );
}
