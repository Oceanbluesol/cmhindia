// components/events-search.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function EventsSearch({
  initialQuery,
  initialDate,
}: {
  initialQuery?: string;
  initialDate?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = React.useState(initialQuery ?? "");
  const [date, setDate] = React.useState(initialDate ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (q) searchParams.set("q", q);
    if (date) searchParams.set("date", date);
    router.push(`/events?${searchParams.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, description, or location"
        className="w-full rounded-lg border px-3 py-2 text-sm sm:w-64"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm sm:w-48"
      />
      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Search
      </button>
      <button
        type="button"
        onClick={() => {
          setQ("");
          setDate("");
          router.push("/events");
        }}
        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
      >
        Clear
      </button>
    </form>
  );
}
