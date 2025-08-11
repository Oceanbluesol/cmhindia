// app/(userdashboard)/dashboard/page.tsx
import { createClient } from "@/lib/supabaseServer";

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  poster_url: string | null;
  status: "pending" | "approved" | "rejected";
  is_featured: boolean | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // fetch ONLY this user's events (any status)
  let events: EventRow[] = [];
  if (user?.id) {
    const { data } = await supabase
      .from("events")
      .select(
        "id,name,description,event_date,event_time,location,poster_url,status,is_featured"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    events = (data as EventRow[]) ?? [];
  }

  const stats = {
    total: events.length,
    approved: events.filter((e) => e.status === "approved").length,
    pending: events.filter((e) => e.status === "pending").length,
    rejected: events.filter((e) => e.status === "rejected").length,
  };

  return (
    <div className="space-y-8">
      {/* Header + CTA */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your events, check approval status, and review RSVPs.
          </p>
        </div>
        <a
          href="/dashboard/events/new"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Create Event
        </a>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Events" value={stats.total} />
        <StatCard label="Approved" value={stats.approved} badgeColor="bg-green-500" />
        <StatCard label="Pending" value={stats.pending} badgeColor="bg-amber-500" />
        <StatCard label="Rejected" value={stats.rejected} badgeColor="bg-red-500" />
      </section>

      {/* Events list */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Your Events</h2>
          <a
            href="/dashboard/events"
            className="text-sm text-indigo-600 hover:underline"
          >
            View all
          </a>
        </div>

        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 9).map((e) => (
              <li key={e.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                {e.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.poster_url}
                    alt={e.name}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-gray-100" />
                )}

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-1 text-base font-semibold">{e.name}</h3>
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
                    <a
                      href={`/dashboard/events/${e.id}`}
                      className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                      Manage
                    </a>
                    <a
                      href={`/events/${e.id}`}
                      className="text-sm text-gray-600 hover:underline"
                      target="_blank"
                    >
                      View public
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  badgeColor,
}: {
  label: string;
  value: number;
  badgeColor?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        {badgeColor ? <span className={`h-2.5 w-2.5 rounded-full ${badgeColor}`} /> : null}
      </div>
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

function EmptyState() {
  return (
    <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
      <h3 className="text-lg font-semibold">No events yet</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">
        Create your first event and submit it for approval. Once approved, it will
        appear on the public landing page.
      </p>
      <a
        href="/dashboard/events/new"
        className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Create Event
      </a>
    </div>
  );
}
