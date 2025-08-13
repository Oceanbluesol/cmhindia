// app/events/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import EventsSearch from "@/components/events-search";
import ShareButton from "@/components/share-button";
import { Calendar, MapPin } from "lucide-react";

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  poster_url: string | null;
};

export default async function EventsPage({
  // ✅ Next 15: searchParams is a Promise
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("events")
    .select("id,name,description,event_date,event_time,location,poster_url")
    .eq("status", "approved")
    .gte("event_date", today);

  if (q) {
    const like = `%${q}%`;
    query = query.or(
      `name.ilike.${like},description.ilike.${like},location.ilike.${like}`
    );
  }

  const { data } = await query.order("event_date", { ascending: true }).limit(100);
  const events = (data as EventRow[]) ?? [];

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          ← Back to Home
        </Link>
        <div className="flex items-center justify-center text-center sm:text-left">
          <h1 className="text-2xl font-semibold">All Upcoming Events</h1>
        </div>
      </div>

      {/* Search */}
      <EventsSearch initialQuery={q} />

      {/* Results meta */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing <span className="font-medium">{events.length}</span>{" "}
          {events.length === 1 ? "event" : "events"}
          {q ? (
            <>
              {" "}
              for <span className="font-medium">“{q}”</span>
            </>
          ) : null}
        </p>
      </div>

      {/* Results */}
      {events.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-gray-600">No upcoming events found.</p>
          <p className="mt-1 text-xs text-gray-500">Try a different search.</p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <li
              key={e.id}
              className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {e.poster_url ? (
                <img
                  src={e.poster_url}
                  alt={e.name}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="h-44 w-full bg-gray-100" />
              )}

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-1 text-base font-semibold">
                    {e.name}
                  </h3>
                </div>

                {e.description ? (
                  <p className="line-clamp-2 text-sm text-gray-600">
                    {e.description}
                  </p>
                ) : null}

                <div className="grid gap-1 text-sm text-gray-700">
                  {(e.event_date || e.event_time) && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {e.event_date ?? ""}
                        {e.event_time ? ` • ${e.event_time.slice(0, 5)}` : ""}
                      </span>
                    </p>
                  )}
                  {e.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="line-clamp-1">{e.location}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/events/${e.id}`}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    View details
                  </Link>

                  {/* NEW: Share button */}
                  <ShareButton
                    path={`/events/${e.id}`}
                    title={e.name}
                    text={e.description ?? undefined}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
