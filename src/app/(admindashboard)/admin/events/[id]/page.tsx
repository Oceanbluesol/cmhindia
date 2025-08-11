import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { approveEvent, rejectEvent, deleteEvent, featureEvent, pendingEvent } from "../actions";

export default async function AdminEventDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data } = await supabase.from("events").select("*").eq("id", params.id).single();
  if (!data) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Event not found</h2>
        <a href="/admin/events" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">Back to list</a>
      </div>
    );
  }
  const e: any = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{e.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            {e.organization_name ? <span>by <span className="font-medium">{e.organization_name}</span></span> : null}
            <StatusBadge status={e.status} />
            {e.is_featured ? <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">Featured</span> : null}
          </div>
          {!!(Array.isArray(e.category) && e.category.length) && (
            <div className="mt-1 flex flex-wrap gap-1">
              {e.category.map((c: string) => (
                <span key={c} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize">{c}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/admin/events/${e.id}/edit`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50">Edit</a>
          <a href="/admin/events" className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50">← Back</a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {e.poster_url ? <img src={e.poster_url} alt={e.name} className="h-72 w-full object-cover sm:h-[22rem]" /> : <div className="flex h-72 w-full items-center justify-center bg-gray-100 text-sm text-gray-500 sm:h-[22rem]">No poster</div>}
            <div className="grid gap-3 p-5 text-sm sm:grid-cols-3">
              <Meta label="Date" value={e.event_date || "—"} />
              <Meta label="Time" value={e.event_time || "—"} />
              <Meta label="Location" value={e.location || "—"} />
              <Meta label="Registration" value={e.registration_fee_type === "paid" && e.registration_fee_amount != null ? `Paid • $${Number(e.registration_fee_amount).toFixed(2)}` : "Free"} />
              <Meta label="Capacity" value={e.is_unlimited ? "Unlimited" : (e.member_limit ?? "—")} />
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-base font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-sm text-gray-800">{e.description || "—"}</p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-base font-semibold">Organizer</h2>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <KV label="Name" value={e.organiser_name || "—"} />
              <KV label="Email" value={e.organiser_email || "—"} />
              <KV label="Phone" value={e.organiser_phone || "—"} />
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h4 className="mb-2 text-sm font-semibold">Moderation</h4>
            <div className="flex flex-wrap gap-2">
              <form action={approveEvent}><input type="hidden" name="id" value={e.id} /><Btn className="bg-green-600 hover:bg-green-700 text-white">Approve</Btn></form>
              <form action={pendingEvent}><input type="hidden" name="id" value={e.id} /><Btn variant="outline">Pending</Btn></form>
              <form action={rejectEvent}><input type="hidden" name="id" value={e.id} /><Btn className="bg-amber-600 hover:bg-amber-700 text-white">Reject</Btn></form>
              <form action={featureEvent}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="is_featured" value={String(!!e.is_featured)} /><Btn className={e.is_featured ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "bg-purple-600 hover:bg-purple-700 text-white"}>{e.is_featured ? "Unfeature" : "Feature"}</Btn></form>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h4 className="mb-2 text-sm font-semibold text-red-700">Danger</h4>
            <form action={deleteEvent} className="flex gap-2">
              <input type="hidden" name="id" value={e.id} />
              <Btn className="bg-red-600 hover:bg-red-700 text-white">Delete</Btn>
              <a href="/admin/events" className="inline-flex items-center rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50">Cancel</a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = status === "approved" ? "bg-green-100 text-green-700" : status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}
function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2">
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
        <div className="truncate font-medium">{value}</div>
      </div>
    </div>
  );
}
function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (<div><dt className="text-gray-500">{label}</dt><dd className="font-medium">{value}</dd></div>);
}
function Btn({ children, className = "", variant }: { children: React.ReactNode; className?: string; variant?: "outline" }) {
  const base = "inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium";
  const styles = variant === "outline" ? "border hover:bg-gray-50" : "bg-gray-100 hover:bg-gray-200";
  return <button className={`${base} ${styles} ${className}`}>{children}</button>;
}
