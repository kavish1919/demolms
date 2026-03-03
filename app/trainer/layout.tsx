"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import {
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  ChartSpline,
  ClipboardList,
  Layers3,
  LayoutDashboard,
  Lightbulb,
  Link2,
  Menu,
  MessageCircle,
  ShieldCheck,
  Target,
  Users,
  X,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/trainer" },
  { icon: BookOpenCheck, label: "My Cohorts", href: "/trainer/cohorts" },
  { icon: Users, label: "Student Focus", href: "/trainer/students" },
  { icon: CalendarClock, label: "Live Sessions", href: "/trainer/sessions" },
  { icon: ClipboardList, label: "Assessments", href: "/trainer/assessments" },
  { icon: ChartSpline, label: "Analytics", href: "/trainer/analytics" },
  { icon: BarChart3, label: "Earnings", href: "/trainer/earnings" },
  { icon: Layers3, label: "Resources", href: "/trainer/resources" },
  { icon: ShieldCheck, label: "Compliance", href: "/trainer/compliance" },
];

function TrainerSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-5">
          <Link href="/trainer" className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-primary to-primary/40 p-3 text-white">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-sidebar-foreground/70">Trainer</p>
              <h2 className="text-lg font-semibold">Command Center</h2>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/30"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                    onClick={onClose}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-2xl bg-sidebar-accent/80 p-4">
            <div className="mb-3 flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-sidebar-primary" />
              <div>
                <p className="text-xs uppercase tracking-widest text-sidebar-foreground/60">Snapshot</p>
                <p className="text-sm font-semibold">Daily teaching inspiration</p>
              </div>
            </div>
            <Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
              View Coaching Tips
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

function TrainerHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Today&apos;s briefing</p>
            <h1 className="text-xl font-semibold text-foreground">Lead your cohorts with clarity</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Link2 className="h-4 w-4" />
            Share resources
          </Button>
          <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-primary/70 text-white">
            <MessageCircle className="h-4 w-4" />
            Launch AMA
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-3 pl-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=trainer"} />
                  <AvatarFallback>
                    {user?.firstName?.[0] || 'T'}
                    {user?.lastName?.[0] || 'R'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left text-sm leading-tight md:block">
                  <span className="font-semibold">{user ? `${user.firstName} ${user.lastName}`.trim() : 'Trainer'}</span>
                  <span className="block text-xs text-muted-foreground">{user?.role === 'trainer' ? 'Lead Trainer' : user?.role}</span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Trainer Console</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Studio Settings</DropdownMenuItem>
              <DropdownMenuItem>Notification Rules</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function TrainerLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'trainer') {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

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

  if (!user || user.role !== 'trainer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <TrainerSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <TrainerHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="px-4 py-6 lg:px-10">
          <div className="mx-auto max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <TrainerLayoutContent>{children}</TrainerLayoutContent>
      </AuthProvider>
    </ThemeProvider>
  );
}
