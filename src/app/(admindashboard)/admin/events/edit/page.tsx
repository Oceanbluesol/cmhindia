import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { updateEventAdmin, deleteEventAdmin } from "../actions";

type PageParams = { id: string };

export default async function AdminEventEdit({
  params,
}: {
  // ✅ Next 15: params is a Promise
  params: Promise<PageParams>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
  if (error || !data) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Event not found</h2>
        <a href="/admin/events" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">Back to list</a>
      </div>
    );
  }

  const e = data as any;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Event</h1>
        <a href="/admin/events" className="text-sm text-gray-600 hover:text-indigo-600">← Back</a>
      </div>

      {/* Do NOT set encType with a function action */}
      <form action={updateEventAdmin} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <input type="hidden" name="id" value={e.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Event Name" required defaultValue={e.name} />
          <Field id="organization_name" label="Organization" defaultValue={e.organization_name ?? ""} />

          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" name="description" rows={4} defaultValue={e.description ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-200" />
          </div>

          <Field id="event_date" label="Date" type="date" defaultValue={e.event_date ?? ""} />
          <Field id="event_time" label="Time" type="time" defaultValue={e.event_time ?? ""} />
          <Field id="location" label="Location" defaultValue={e.location ?? ""} />
          <Field id="category" label="Categories (comma separated)" defaultValue={(e.category ?? []).join(", ")} placeholder="tech, meetup" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="poster">Upload New Poster (optional)</Label>
            <input id="poster" name="poster" type="file" accept="image/*" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-gray-500">If you upload a new file, it will replace the current poster.</p>
          </div>
          <div className="flex items-end">
            {e.poster_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <a href={e.poster_url} target="_blank" className="group block w-full">
                <img src={e.poster_url} alt={e.name} className="h-32 w-full rounded-lg object-cover ring-1 ring-gray-200 group-hover:opacity-90" />
                <span className="mt-1 block text-xs text-indigo-600 underline">Open current poster</span>
              </a>
            ) : (
              <div className="h-32 w-full rounded-lg bg-gray-100 ring-1 ring-gray-200" />
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="registration_fee_type">Registration Type</Label>
            <select id="registration_fee_type" name="registration_fee_type" defaultValue={e.registration_fee_type ?? "free"} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-200">
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <Field id="registration_fee_amount" label="Fee Amount (if paid)" type="number" min="0" step="0.01" defaultValue={e.registration_fee_amount ?? ""} />
          <Field id="member_limit" label="Max Attendees (leave blank = unlimited)" type="number" min="0" defaultValue={e.member_limit ?? ""} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" defaultValue={e.status} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-200">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_featured" defaultChecked={!!e.is_featured} className="rounded border-gray-300" />
              Feature on homepage
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <a href={`/admin/events/${e.id}`} className="text-sm text-gray-600 hover:text-indigo-600">Cancel</a>
          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Save changes</button>
            <form action={deleteEventAdmin}><input type="hidden" name="id" value={e.id} /><button type="submit" className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">Delete</button></form>
          </div>
        </div>
      </form>
    </div>
  );
}

function Label(props: React.ComponentProps<"label">) {
  return <label {...props} className="block text-sm font-medium text-gray-700" />;
}
function Field({
  id, label, type = "text", required = false, defaultValue, ...rest
}: {
  id: string; label: string; type?: string; required?: boolean; defaultValue?: any; placeholder?: string; min?: string; step?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} name={id} type={type} required={required} defaultValue={defaultValue} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-200" {...rest} />
    </div>
  );
}
