import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

type Search = Promise<Record<string, string | string[] | undefined>>;

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
  user_id: string;
};

export default async function AdminEventsPage({ searchParams }: { searchParams?: Search }) {
  const sp = (await searchParams) ?? {};
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = (typeof sp.status === "string" ? sp.status : "all") as "all" | "pending" | "approved" | "rejected";
  const urlError = typeof sp.error === "string" ? decodeURIComponent(sp.error) : null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">Admin sign-in required</h3>
        <a href="/auth/login" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">Go to Login</a>
      </div>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">No access</h3>
        <a href="/" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">Back to Home</a>
      </div>
    );
  }

  let query = supabase
    .from("events")
    .select("id,name,description,event_date,event_time,location,poster_url,status,created_at,user_id")
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  if (q) {
    const like = `%${q}%`;
    query = query.or(`name.ilike.${like},description.ilike.${like},location.ilike.${like}`);
  }

  const { data, error } = await query.limit(100);
  if (error) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">Error loading events</h3>
        <p className="mt-1 text-sm text-gray-600">{error.message}</p>
      </div>
    );
  }

  const events = (data as EventRow[]) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">All Events</h1>
          <p className="text-sm text-gray-500">Search, filter, edit, approve or delete.</p>
        </div>
        <Link href="/admin/events/new" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          + Create Event
        </Link>
      </div>

      {urlError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {urlError}
        </div>
      )}

      <form action="/admin/events" method="get" className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="block text-xs font-medium text-gray-600">Search</label>
          <input id="q" name="q" type="text" defaultValue={q} placeholder="Name, description, or location" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <div className="w-full sm:w-44">
          <label htmlFor="status" className="block text-xs font-medium text-gray-600">Status</label>
          <select id="status" name="status" defaultValue={status} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 sm:flex-none">Apply</button>
          <Link href="/admin/events" className="flex-1 rounded-lg border px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none">Clear</Link>
        </div>
      </form>

      {events.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting filters or create a new event.</p>
          <Link href="/admin/events/new" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">+ Create Event</Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <li key={e.id} className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {e.poster_url ? (
                <img src={e.poster_url} alt={e.name} className="h-36 w-full object-cover sm:h-40" />
              ) : (
                <div className="h-36 w-full bg-gradient-to-br from-gray-100 to-gray-200 sm:h-40" />
              )}
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/events/${e.id}`} className="line-clamp-2 text-sm font-semibold leading-tight hover:text-indigo-600 sm:text-base">
                    {e.name}
                  </Link>
                  <StatusBadge status={e.status} />
                </div>
                {e.description && <p className="line-clamp-2 text-xs text-gray-500 sm:text-sm">{e.description}</p>}
                <div className="text-xs text-gray-600 sm:text-sm">
                  {e.event_date && <p>{e.event_date}{e.event_time ? ` · ${e.event_time}` : ""}</p>}
                  {e.location && <p className="truncate">{e.location}</p>}
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <Link href={`/admin/events/${e.id}/edit`} className="text-xs font-medium text-indigo-600 hover:underline sm:text-sm">Edit</Link>
                  <Link href={`/admin/events/${e.id}`} className="text-xs text-gray-500 hover:text-gray-700 hover:underline sm:text-sm">Manage →</Link>
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
  const styles = status === "approved" ? "bg-green-100 text-green-700" : status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
