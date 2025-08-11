// app/(userdashboard)/dashboard/events/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  poster_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default async function EventsListPage({
  // ✅ Next 15: searchParams is a Promise
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = (sp.status as "all" | "pending" | "approved" | "rejected" | undefined) ?? "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Please sign in</h2>
        <p className="mt-1 text-sm text-gray-600">You need to be logged in to manage your events.</p>
        <a
          href="/auth/login"
          className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go to Login
        </a>
      </div>
    );
  }

  let query = supabase
    .from("events")
    .select("id,name,description,event_date,event_time,location,poster_url,status,created_at")
    .eq("user_id", user.id);

  if (status !== "all") query = query.eq("status", status);
  if (q) {
    const like = `%${q}%`;
    query = query.or(`name.ilike.${like},description.ilike.${like},location.ilike.${like}`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-gray-600">{error.message}</p>
      </div>
    );
  }

  const events = (data as EventRow[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Events</h1>
          <p className="text-sm text-gray-600">Create, filter, and track status.</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Event
        </Link>
      </div>

      {/* Filters (GET form) */}
      <form
        action="/dashboard/events"
        method="get"
        className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="q" className="block text-xs font-medium text-gray-600">
            Search
          </label>
          <input
            id="q"
            name="q"
            type="text"
            defaultValue={q}
            placeholder="Search by name, description, or location"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="w-full sm:w-56">
          <label htmlFor="status" className="block text-xs font-medium text-gray-600">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Apply
          </button>
          <Link
            href="/dashboard/events"
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        </div>
      </form>

      {/* Results */}
      {events.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold">No events found</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">
            Try adjusting your filters or create a new event.
          </p>
          <a
            href="/dashboard/events/new"
            className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Event
          </a>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <li
              key={e.id}
              className="group relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <Link href={`/dashboard/events/${e.id}/details`} aria-label={`View ${e.name}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {e.poster_url ? (
                  <img src={e.poster_url} alt={e.name} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-gray-100" />
                )}
              </Link>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/dashboard/events/${e.id}/details`}
                    className="line-clamp-1 text-base font-semibold hover:underline"
                  >
                    {e.name}
                  </Link>
                  <StatusBadge status={e.status} />
                </div>

                {e.description ? (
                  <p className="line-clamp-2 text-sm text-gray-600">{e.description}</p>
                ) : null}

                <div className="grid gap-1 text-sm text-gray-700">
                  {e.event_date ? (
                    <p>
                      <span className="font-medium">Date:</span> {e.event_date}
                      {e.event_time ? ` • ${e.event_time}` : ""}
                    </p>
                  ) : null}
                  {e.location ? (
                    <p>
                      <span className="font-medium">Location:</span> {e.location}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    href={`/dashboard/events/${e.id}`}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <a
                    href={`/events/${e.id}`}
                    className="text-sm text-gray-600 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View public
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : status === "pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
