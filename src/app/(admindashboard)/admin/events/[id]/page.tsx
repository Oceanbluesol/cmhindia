// app/(admindashboard)/admin/events/[id]/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
// If your action handlers live next to /admin/events/page.tsx, keep this:
import { approveEvent, rejectEvent, deleteEvent, featureEvent, pendingEvent } from "../actions";
// If you moved them to an actions file, use:
// import { approveEvent, rejectEvent, deleteEvent, featureEvent } from "../actions";

export default async function AdminEventDetail({
  params,
}: {
  // ✅ Next 15: params is a Promise
  params: Promise<{ id: string }>;
}) {
  // ✅ Await the params
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const { data } = await supabase.from("events").select("*").eq("id", id).single();

  if (!data) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Event not found</h2>
        <a href="/admin/events" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
          Back
        </a>
      </div>
    );
  }

  const e: any = data;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{e.name}</h1>
          {e.organization_name && (
            <p className="mt-1 text-sm text-gray-600">{e.organization_name}</p>
          )}
          {Array.isArray(e.category) && e.category.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {e.category.map((c: string) => (
                <span
                  key={c}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : null}
          {e.description && (
            <p className="mt-4 whitespace-pre-line text-sm text-gray-700">
              {e.description}
            </p>
          )}
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold">Organizer</h3>
          <div className="mt-2 grid gap-1 text-sm text-gray-700">
            {e.organiser_name && <p>Name: {e.organiser_name}</p>}
            {e.organiser_email && <p>Email: {e.organiser_email}</p>}
            {e.organiser_phone && <p>Phone: {e.organiser_phone}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {e.poster_url ? (
            <img src={e.poster_url} alt={e.name} className="h-56 w-full object-cover" />
          ) : (
            <div className="h-56 w-full bg-gray-100" />
          )}
          <div className="p-4 text-sm text-gray-700">
            <p>
              {e.event_date ?? ""} {e.event_time ? `• ${e.event_time}` : ""}
            </p>
            {e.location && <p>{e.location}</p>}
            <p className="mt-1">
              {e.registration_fee_type === "paid" && e.registration_fee_amount ? (
                <span className="font-medium text-gray-900">
                  Fee: ${Number(e.registration_fee_amount).toFixed(2)}
                </span>
              ) : (
                <span className="font-medium text-green-600">Free</span>
              )}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-semibold">Actions</h4>
          <div className="flex flex-wrap gap-2">
            <form action={approveEvent}>
              <input type="hidden" name="id" value={e.id} />
              <button className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                Approve
              </button>
            </form>
            <form action={rejectEvent}>
              <input type="hidden" name="id" value={e.id} />
              <button className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700">
                Reject
              </button>
            </form>
            <form action={featureEvent}>
              <input type="hidden" name="id" value={e.id} />
              <input type="hidden" name="is_featured" value={String(!!e.is_featured)} />
              <button
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  e.is_featured
                    ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {e.is_featured ? "Unfeature" : "Feature"}
              </button>
            </form>
            <form action={deleteEvent}>
              <input type="hidden" name="id" value={e.id} />
              <button className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
                Delete
              </button>
            </form>
          </div>

          <a href="/admin/events" className="mt-3 inline-block text-xs text-indigo-600 hover:underline">
            ← Back to list
          </a>
        </div>
      </div>
    </div>
  );
}
