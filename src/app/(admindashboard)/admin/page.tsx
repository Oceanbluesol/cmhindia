export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

export default async function AdminOverview() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <AuthBlock />;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return <NoAccess />;

  const [totalRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "rejected"),
  ]);
  const total = totalRes.count ?? 0;
  const pending = pendingRes.count ?? 0;
  const approved = approvedRes.count ?? 0;
  const rejected = rejectedRes.count ?? 0;

  const { data: recentPending } = await supabase
    .from("events")
    .select("id,name,organization_name,poster_url,event_date,event_time,location,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Create, review and approve events.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/events/new" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Create Event</Link>
          <Link href="/admin/events" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Review Events</Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total" value={total} />
        <Stat label="Pending" value={pending} dot="bg-amber-500" />
        <Stat label="Approved" value={approved} dot="bg-green-500" />
        <Stat label="Rejected" value={rejected} dot="bg-red-500" />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Needs approval</h2>
          <Link href="/admin/events?status=pending" className="text-sm text-indigo-600 hover:underline">View all pending →</Link>
        </div>

        {!recentPending?.length ? (
          <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-600 shadow-sm">No pending events 🎉</div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recentPending.map((e) => (
              <li key={e.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {e.poster_url ? <img src={e.poster_url} alt={e.name} className="h-36 w-full object-cover" /> : <div className="h-36 w-full bg-gray-100" />}
                <div className="space-y-1 p-4">
                  <a href={`/admin/events/${e.id}`} className="line-clamp-1 font-medium hover:underline">{e.name}</a>
                  <p className="text-xs text-gray-600">{e.organization_name ?? "—"}</p>
                  <p className="text-xs text-gray-500">{e.event_date ?? "—"} {e.event_time ? `• ${e.event_time}` : ""}</p>
                  <p className="text-xs text-gray-500">{e.location ?? "—"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, dot }: { label: string; value: number; dot?: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        {dot ? <span className={`h-2.5 w-2.5 rounded-full ${dot}`} /> : null}
      </div>
    </div>
  );
}
function AuthBlock() {
  return (
    <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
      <h3 className="text-lg font-semibold">Admin sign-in required</h3>
      <a href="/auth/login" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">Go to Login</a>
    </div>
  );
}
function NoAccess() {
  return (
    <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
      <h3 className="text-lg font-semibold">No access</h3>
      <p className="mt-1 text-sm text-gray-600">Your account is not an admin.</p>
      <a href="/" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">Back to Home</a>
    </div>
  );
}
