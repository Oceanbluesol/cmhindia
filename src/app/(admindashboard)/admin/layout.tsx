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
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="CMH India" className="h-7 w-auto sm:h-8 sm:w-40" />
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5">Admin</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm overflow-x-auto">
            <Link href="/admin" className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors text-xs sm:text-sm sm:px-3">
              Dashboard
            </Link>
            <Link href="/admin/events" className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors text-xs sm:text-sm sm:px-3">
              Events
            </Link>
            <Link href="/admin/events/new" className="whitespace-nowrap rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors sm:text-sm sm:px-3">
              + New
            </Link>
          </nav>
          <form action="/auth/signout" method="post" className="shrink-0">
            <button className="rounded-full bg-red-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors sm:px-3 sm:text-sm">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
