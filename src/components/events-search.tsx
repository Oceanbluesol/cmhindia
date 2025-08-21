// components/events-search.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

/**
 * EventsSearch
 * - Adds a visible title
 * - Replaces single `date` with `start` and `end` date range
 * - Preserves existing (unrelated) query params when navigating
 * - Responsive layout (stack on mobile, grid/row on larger screens)
 * - Basic validation to ensure start <= end
 */
export default function EventsSearch({
  title = "Search events",
  initialQuery,
  initialStart,
  initialEnd,
}: {
  title?: string;
  initialQuery?: string;
  initialStart?: string; // YYYY-MM-DD
  initialEnd?: string;   // YYYY-MM-DD
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = React.useState(initialQuery ?? "");
  const [start, setStart] = React.useState(initialStart ?? "");
  const [end, setEnd] = React.useState(initialEnd ?? "");
  const [error, setError] = React.useState<string | null>(null);

  // If initial props change (rare in practice), sync local state
  React.useEffect(() => {
    setQ(initialQuery ?? "");
  }, [initialQuery]);
  React.useEffect(() => {
    setStart(initialStart ?? "");
  }, [initialStart]);
  React.useEffect(() => {
    setEnd(initialEnd ?? "");
  }, [initialEnd]);

  // Validate date range
  React.useEffect(() => {
    if (start && end && start > end) {
      setError("Start date must be on or before end date");
    } else {
      setError(null);
    }
  }, [start, end]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;

    // Start from existing params so we don't drop unrelated filters
    const searchParams = new URLSearchParams(params?.toString());
    // Update controlled params
    if (q) searchParams.set("q", q); else searchParams.delete("q");
    if (start) searchParams.set("start", start); else searchParams.delete("start");
    if (end) searchParams.set("end", end); else searchParams.delete("end");

    router.push(`/events${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
  };

  const handleClear = () => {
    setQ("");
    setStart("");
    setEnd("");
    // Keep other params but remove our keys
    const searchParams = new URLSearchParams(params?.toString());
    ["q", "start", "end"].forEach((k) => searchParams.delete(k));
    router.push(`/events${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
  };

  return (
    <section className="w-full rounded-xl border bg-white/50 p-4 sm:p-5 shadow-sm">
      {/* Title */}
      <h2 className="mb-3 text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] lg:items-end">
        {/* Query */}
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-sm font-medium text-gray-700">Keyword</label>
          <input
            id="q"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, description, or location"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Start date */}
        <div className="flex flex-col gap-1">
          <label htmlFor="start" className="text-sm font-medium text-gray-700">Start date</label>
          <input
            id="start"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            max={end || undefined}
          />
        </div>

        {/* End date */}
        <div className="flex flex-col gap-1">
          <label htmlFor="end" className="text-sm font-medium text-gray-700">End date</label>
          <input
            id="end"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min={start || undefined}
          />
        </div>

        {/* Actions */}
        <div className="mt-1 flex gap-2 sm:col-span-2 lg:col-span-1 lg:mt-0">
          <button
            type="submit"
            disabled={!!error}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 sm:flex-none"
          >
            Clear
          </button>
        </div>

        {/* Validation message */}
        {error && (
          <p className="sm:col-span-2 lg:col-span-4 text-sm text-red-600">{error}</p>
        )}
      </form>
    </section>
  );
}
