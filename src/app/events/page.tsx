// app/events/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import EventsSearch from "@/components/events-search";
import ShareButton from "@/components/share-button";
import PublicHeader from "@/components/public-header";
import Footer from "@/components/footer";
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
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const start = (Array.isArray(sp.start) ? sp.start[0] : sp.start)?.trim() ?? "";
  const end = (Array.isArray(sp.end) ? sp.end[0] : sp.end)?.trim() ?? "";

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("events")
    .select("id,name,description,event_date,event_time,location,poster_url")
    .eq("status", "approved");

  if (start && end) {
    query = query.gte("event_date", start).lte("event_date", end);
  } else if (start) {
    query = query.gte("event_date", start);
  } else if (end) {
    query = query.lte("event_date", end);
  } else {
    query = query.gte("event_date", today);
  }

  if (q) {
    const like = `%${q}%`;
    query = query.or(
      `name.ilike.${like},description.ilike.${like},location.ilike.${like}`
    );
  }

  const { data } = await query.order("event_date", { ascending: true }).limit(100);
  const events = (data as EventRow[]) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      {/* Page header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">All Upcoming Events</h1>
              <p className="mt-1 text-sm text-gray-500">
                {events.length} event{events.length !== 1 ? "s" : ""} found
                {q && <> for <span className="font-medium text-gray-700">&ldquo;{q}&rdquo;</span></>}
                {start && end && <> between <span className="font-medium text-gray-700">{start}</span> and <span className="font-medium text-gray-700">{end}</span></>}
              </p>
            </div>
            <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Search */}
        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <EventsSearch initialQuery={q} initialStart={start} initialEnd={end} />
        </div>

        {/* Results */}
        {events.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No upcoming events found</h3>
            <p className="mb-6 text-sm text-gray-500">Try adjusting your search filters or check back later.</p>
            <Link
              href="/events"
              className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <li
                key={e.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="overflow-hidden">
                  {e.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.poster_url}
                      alt={e.name}
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-44 w-full bg-gradient-to-br from-indigo-50 to-purple-50" />
                  )}
                </div>

                <div className="flex flex-1 flex-col space-y-3 p-5">
                  <h3 className="line-clamp-2 text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {e.name}
                  </h3>

                  {e.description && (
                    <p className="line-clamp-2 text-sm text-gray-600 flex-1">{e.description}</p>
                  )}

                  <div className="space-y-1.5">
                    {(e.event_date || e.event_time) && (
                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span>
                          {e.event_date ?? ""}
                          {e.event_time ? ` • ${e.event_time.slice(0, 5)}` : ""}
                        </span>
                      </p>
                    )}
                    {e.location && (
                      <p className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        <span className="line-clamp-1">{e.location}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <Link
                      href={`/events/${e.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm"
                    >
                      View details
                    </Link>
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

      <Footer />
    </div>
  );
}
