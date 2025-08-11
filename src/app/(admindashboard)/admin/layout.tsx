export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
             <img src="/logo.svg" alt="EventHub logo" className="h-8 w-48" />
            <span className="text-lg font-semibold">Admin</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
            <Link href="/admin/events" className="text-gray-700 hover:text-indigo-600">Events</Link>
            <Link href="/admin/events/new" className="text-gray-700 hover:text-indigo-600">New Event</Link>
          </nav>
          <form action="/auth/signout" method="post">
            <button className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
