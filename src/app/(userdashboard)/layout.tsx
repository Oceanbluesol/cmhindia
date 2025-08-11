// app/(userdashboard)/dashboard/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { ProfileMenu } from "@/components/profile-menu";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  // Require auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Get display name from profiles (fallback to email local-part)
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const email = user.email ?? "";
  const displayName = profile?.display_name || (email ? email.split("@")[0] : "User");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
             <img src="/logo.svg" alt="EventHub logo" className="h-8 w-48" />
          </div>

          <nav className="hidden gap-6 md:flex">
            <a href="/dashboard" className="text-sm text-gray-700 hover:text-indigo-600">
              Overview
            </a>
            <a href="/dashboard/events" className="text-sm text-gray-700 hover:text-indigo-600">
              My Events
            </a>
            <a href="/dashboard/rsvps" className="text-sm text-gray-700 hover:text-indigo-600">
              RSVPs
            </a>
           
          </nav>

          {/* User profile dropdown */}
          <ProfileMenu displayName={displayName} email={email} />
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
