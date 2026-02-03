// src/components/layout/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ROUTES } from '@/config/constants';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { toggleSidebar } = useStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Next.js Boilerplate</span>
          </Link>
        </div>

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {user?.name || user?.email || 'User'}
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Link href={ROUTES.LOGIN}>
              <Button>Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
