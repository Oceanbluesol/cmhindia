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
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="CMH India" className="h-8 w-auto sm:w-40" />
            <span className="hidden text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5 sm:inline">Admin</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-5">
            <Link href="/admin" className="rounded-lg px-2 py-1.5 text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors">Dashboard</Link>
            <Link href="/admin/events" className="rounded-lg px-2 py-1.5 text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors">Events</Link>
            <Link href="/admin/events/new" className="hidden rounded-lg px-2 py-1.5 text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors sm:block">New Event</Link>
          </nav>
          <form action="/auth/signout" method="post">
            <button className="rounded-full bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
