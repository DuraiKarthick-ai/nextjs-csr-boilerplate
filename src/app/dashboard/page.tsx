// src/app/dashboard/page.tsx
'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Welcome Section */}
            <div>
              <h1 className="mb-2 text-3xl font-bold">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your account today.
              </p>
            </div>

            {/* User Info Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Name</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.name || 'Not set'}</div>
                  <p className="text-xs text-muted-foreground">Your display name</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Email</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.email || 'Not set'}</div>
                  <p className="text-xs text-muted-foreground">Your email address</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Active</div>
                  <p className="text-xs text-muted-foreground">Authentication verified</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="text-sm font-mono">{user?.sub || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                    <p className="text-sm">{user?.preferred_username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                    <p className="text-sm">
                      {user?.email_verified ? (
                        <span className="text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-yellow-600">⚠ Not verified</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                    <p className="text-sm">{formatDateTime(new Date())}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <button className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
                    <User className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Edit Profile</p>
                      <p className="text-xs text-muted-foreground">Update your information</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
                    <Shield className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Security</p>
                      <p className="text-xs text-muted-foreground">Manage security settings</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent">
                    <Clock className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Activity</p>
                      <p className="text-xs text-muted-foreground">View recent activity</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
