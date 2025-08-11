export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { approveEvent, pendingEvent, rejectEvent, deleteEvent } from "./actions";

type SearchParams = { q?: string; status?: "all" | "pending" | "approved" | "rejected" };
type EventRow = {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  poster_url: string | null;
  status: "pending" | "approved" | "rejected";
  organization_name: string | null;
  organiser_email: string | null;
  created_at: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");
  return supabase;
}

export default async function AdminEventsPage({ searchParams }: { searchParams?: SearchParams }) {
  const supabase = await requireAdmin();
  const qRaw = (searchParams?.q ?? "").trim();
  const statusRaw = (searchParams?.status ?? "all") as "all"|"pending"|"approved"|"rejected";
  const q = qRaw.replace(/[(),%]/g, "");
  const like = q ? `%${q}%` : "";

  let query = supabase
    .from("events")
    .select("id,user_id,name,description,event_date,event_time,location,poster_url,status,organization_name,organiser_email,created_at");

  if (statusRaw !== "all") query = query.eq("status", statusRaw);
  if (q) {
    query = query.or([
      `name.ilike.${like}`,
      `description.ilike.${like}`,
      `location.ilike.${like}`,
      `organization_name.ilike.${like}`,
      `organiser_email.ilike.${like}`,
    ].join(","));
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Error loading events</h2>
        <p className="mt-1 text-sm text-gray-600">{error.message}</p>
      </div>
    );
  }
  const events = (data as EventRow[]) ?? [];

  const tabs: Array<{ label: string; value: "all" | "approved" | "pending" | "rejected" }> = [
    { label: "All", value: "all" },
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">All Events</h1>
          <p className="text-sm text-gray-600">Search, filter, approve/reject, edit, or delete.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/events/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">+ New Event</Link>
          <Link href="/admin" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Back to site</Link>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = statusRaw === t.value;
            const href = `/admin/events?status=${t.value}${qRaw ? `&q=${encodeURIComponent(qRaw)}` : ""}`;
            return (
              <Link key={t.value} href={href}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {t.label}
              </Link>
            );
          })}
        </div>

        <form method="get" className="mt-4 flex gap-3">
          <input type="hidden" name="status" value={statusRaw} />
          <div className="relative flex-1">
            <input id="q" name="q" type="text" defaultValue={qRaw}
              placeholder="Search by name, org, description, location, email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-10 text-sm focus:border-indigo-500 focus:outline-none" />
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          </div>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Search</button>
          <Link href="/admin/events" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Clear</Link>
        </form>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold">No events match your filters</h3>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th className="w-[92px]">Poster</Th>
                <Th>Name</Th>
                <Th>Org / Email</Th>
                <Th>Date &amp; Time</Th>
                <Th>Location</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {events.map((e) => (
                <tr key={e.id} className="align-top">
                  <Td>
                    {e.poster_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.poster_url} alt={e.name} className="h-14 w-20 rounded object-cover" />
                    ) : <div className="h-14 w-20 rounded bg-gray-100" />}
                  </Td>
                  <Td className="max-w-[280px]">
                    <div className="font-medium"><Link href={`/admin/events/${e.id}`} className="hover:underline">{e.name}</Link></div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-gray-600">{e.description ?? "—"}</div>
                    <div className="mt-1 text-xs text-gray-500">Created: {e.created_at?.slice(0,19)?.replace("T"," ") ?? "—"}</div>
                  </Td>
                  <Td>
                    <div className="font-medium">{e.organization_name ?? "—"}</div>
                    <div className="text-gray-600">{e.organiser_email ?? "—"}</div>
                  </Td>
                  <Td>
                    <div>{e.event_date || "—"}</div>
                    <div className="text-gray-600">{e.event_time || ""}</div>
                  </Td>
                  <Td>{e.location || "—"}</Td>
                  <Td><StatusBadge status={e.status} /></Td>
                  <Td className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <form action={approveEvent}><input type="hidden" name="id" value={e.id} /><Btn>Approve</Btn></form>
                      <form action={pendingEvent}><input type="hidden" name="id" value={e.id} /><Btn variant="outline">Pending</Btn></form>
                      <form action={rejectEvent}><input type="hidden" name="id" value={e.id} /><Btn className="bg-amber-600 hover:bg-amber-700 text-white">Reject</Btn></form>
                      <form action={deleteEvent}><input type="hidden" name="id" value={e.id} /><Btn className="bg-red-600 hover:bg-red-700 text-white">Delete</Btn></form>
                      <Link href={`/admin/events/${e.id}`} className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50">Details</Link>
                      <Link href={`/admin/events/${e.id}/edit`} className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50">Edit</Link>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
function Btn({ children, className = "", variant }: { children: React.ReactNode; className?: string; variant?: "outline" }) {
  const base = "inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium";
  const styles = variant === "outline" ? "border hover:bg-gray-50" : "bg-gray-100 hover:bg-gray-200";
  return <button className={`${base} ${styles} ${className}`}>{children}</button>;
}
function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = status === "approved" ? "bg-green-100 text-green-700" : status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}
