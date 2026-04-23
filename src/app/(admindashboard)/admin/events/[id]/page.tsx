import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { approveEvent, rejectEvent, deleteEventAdmin, featureEvent, pendingEvent } from "../actions";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminEventDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: SP;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data } = await supabase.from("events").select("*").eq("id", id).single();
  if (!data) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Event not found</h2>
        <a href="/admin/events" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">Back</a>
      </div>
    );
  }

  const sp = (await searchParams) ?? {};
  const urlError = typeof sp.error === "string" ? decodeURIComponent(sp.error) : null;
  const e: any = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <a href="/admin/events" className="text-sm text-gray-500 hover:text-indigo-600">← Back to Events</a>
        <a href={`/admin/events/${e.id}/edit`} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">Edit Event</a>
      </div>

      {urlError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {urlError}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h1 className="text-xl font-semibold sm:text-2xl">{e.name}</h1>
              <StatusBadge status={e.status} />
            </div>
            {e.organization_name && <p className="mt-1 text-sm text-gray-500">{e.organization_name}</p>}
            {Array.isArray(e.category) && e.category.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {e.category.map((c: string) => (
                  <span key={c} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">{c}</span>
                ))}
              </div>
            )}
            {e.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700">{e.description}</p>}
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Organizer Details</h3>
            <div className="grid gap-1 text-sm text-gray-700 sm:grid-cols-2">
              {e.organiser_name && <p><span className="font-medium">Name:</span> {e.organiser_name}</p>}
              {e.organiser_email && <p><span className="font-medium">Email:</span> {e.organiser_email}</p>}
              {e.organiser_phone && <p><span className="font-medium">Phone:</span> {e.organiser_phone}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Actions</h4>
            <div className="flex flex-wrap gap-2">
              <form action={approveEvent}><input type="hidden" name="id" value={e.id} /><button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Approve</button></form>
              <form action={pendingEvent}><input type="hidden" name="id" value={e.id} /><button className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Mark Pending</button></form>
              <form action={rejectEvent}><input type="hidden" name="id" value={e.id} /><button className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">Reject</button></form>
              <form action={featureEvent}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="is_featured" value={String(!!e.is_featured)} />
                <button className={`rounded-lg px-4 py-2 text-sm font-medium ${e.is_featured ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "bg-purple-600 text-white hover:bg-purple-700"}`}>
                  {e.is_featured ? "Unfeature" : "Feature"}
                </button>
              </form>
              <form action={deleteEventAdmin}><input type="hidden" name="id" value={e.id} /><button className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">Delete</button></form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {e.poster_url ? (
              <img src={e.poster_url} alt={e.name} className="h-48 w-full object-cover sm:h-56" />
            ) : (
              <div className="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 sm:h-56" />
            )}
            <div className="p-4 text-sm text-gray-700 space-y-1">
              {e.event_date && <p className="font-medium">{e.event_date}{e.event_time ? ` · ${e.event_time}` : ""}</p>}
              {e.location && <p className="text-gray-600">{e.location}</p>}
              <p className="mt-2">
                {e.registration_fee_type === "paid" && e.registration_fee_amount
                  ? <span className="font-semibold text-gray-900">Fee: ₹{Number(e.registration_fee_amount).toFixed(2)}</span>
                  : <span className="font-semibold text-green-600">Free</span>}
              </p>
              {!e.is_unlimited && e.member_limit && (
                <p className="text-gray-600">Max attendees: {e.member_limit}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = status === "approved" ? "bg-green-100 text-green-700" : status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}
