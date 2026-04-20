"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

export default function PublicHeader() {
  const [userId, setUserId] = React.useState<string | null | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="CMH India" className="h-8 w-auto sm:w-48" />
        </Link>

        <nav className="hidden gap-6 md:flex items-center">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Home</Link>
          <Link href="/events" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Events</Link>
          <Link href="/#how" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">How it works</Link>
          <Link href="/#faq" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">FAQ</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {userId !== undefined && (
            userId ? (
              <>
                <Link href="/dashboard" className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">Dashboard</Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-600 transition-all">Sign out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">Sign in</Link>
                <Link href="/auth/signup" className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow">Sign up</Link>
              </>
            )
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white shadow-lg">
          <div className="px-4 py-4 space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100">Home</Link>
            <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100">Events</Link>
            <Link href="/#how" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100">How it works</Link>
            <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100">FAQ</Link>
            <div className="pt-2 mt-2 border-t space-y-1">
              {userId ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100">Dashboard</Link>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="w-full text-left rounded-lg px-3 py-2.5 text-base font-medium text-red-600 hover:bg-red-50">Sign out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100">Sign in</Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-base font-medium text-indigo-600 hover:bg-indigo-50 font-semibold">Sign up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
