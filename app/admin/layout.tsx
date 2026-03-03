'use client';

import React from "react"

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ThemeProvider } from '@/components/theme-provider';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isTrainerArea = pathname.startsWith('/admin/trainers');

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (hasRole('admin')) {
      return;
    }

    if (hasRole('trainer') && isTrainerArea) {
      return;
    }

    if (hasRole('trainer')) {
      router.replace('/trainer');
      return;
    }

    router.replace('/login');
  }, [user, isLoading, hasRole, router, pathname, isTrainerArea]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const canAccessAdmin = hasRole('admin') || (hasRole('trainer') && isTrainerArea);

  if (!canAccessAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <AdminSidebar />
      <main className="lg:pl-64 transition-all duration-300">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AuthProvider>
    </ThemeProvider>
  );
}
