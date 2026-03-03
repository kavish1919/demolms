"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { TrainerSidebar } from "@/components/trainer/trainer-sidebar";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 🔐 Auth guard
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "trainer")) {
      router.replace("/login"); // ✅ replace, not push
    }
  }, [isLoading, user, router]);

  // ⏳ While auth is loading, show a loader (NOT null)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading trainer dashboard...</p>
      </div>
    );
  }

  // 🛑 If user is invalid, block render (redirect already triggered)
  if (!user || user.role !== "trainer") {
    return null;
  }

  // ✅ Auth OK → render layout
  return (
    <div className="min-h-screen bg-background flex">
      <TrainerSidebar />

      <main className="flex-1 ml-64 p-6">
        {children}
      </main>
    </div>
  );
}
