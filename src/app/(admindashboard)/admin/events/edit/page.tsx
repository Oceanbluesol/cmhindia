import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { adminUpdateEvent, deleteEvent } from "../actions";

export default async function AdminEditEventPage({ params }: { params: { id: string } }) {
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
        <a href="/admin/events" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">Back</a>
      </div>
    );
  }
  const e: any = data;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Event</h1>
        <div className="flex gap-3">
          <a href={`/admin/events/${e.id}`} className="text-sm text-gray-600 hover:text-indigo-600">Details</a>
          <a href="/admin/events" className="text-sm text-gray-600 hover:text-indigo-600">← Back</a>
        </div>
      </div>

      <form action={adminUpdateEvent} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <input type="hidden" name="id" value={e.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Event Name" defaultValue={e.name} required />
          <Field id="organization_name" label="Organization" defaultValue={e.organization_name ?? ""} />
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" name="description" rows={4} defaultValue={e.description ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>

          <Field id="event_date" label="Date" type="date" defaultValue={e.event_date ?? ""} />
          <Field id="event_time" label="Time" type="time" defaultValue={e.event_time ?? ""} />
          <Field id="location" label="Location" defaultValue={e.location ?? ""} />
          <Field id="category" label="Categories (comma separated)" defaultValue={(e.category ?? []).join(", ")} />

          <Field id="poster_url" label="Poster URL (optional)" defaultValue={e.poster_url ?? ""} />
          <div className="sm:col-span-2">
            <Label htmlFor="poster">Upload New Poster (optional)</Label>
            <input id="poster" name="poster" type="file" accept="image/*" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-gray-500">Uploading a new file will replace the current poster.</p>
          </div>

          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="registration_fee_type">Registration Type</Label>
              <select id="registration_fee_type" name="registration_fee_type" defaultValue={e.registration_fee_type ?? "free"} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none">
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <Field id="registration_fee_amount" label="Fee Amount (if paid)" type="number"  defaultValue={e.registration_fee_amount ?? ""} />
          </div>

          <Field id="member_limit" label="Max Attendees (leave blank = unlimited)" type="number"  defaultValue={e.member_limit ?? ""} />

          <Field id="organiser_name" label="Organizer Name" defaultValue={e.organiser_name ?? ""} />
          <Field id="organiser_phone" label="Organizer Phone" defaultValue={e.organiser_phone ?? ""} />
          <Field id="organiser_email" label="Organizer Email" type="email" defaultValue={e.organiser_email ?? ""} />

          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={e.status ?? "pending"} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <label className="flex items-end gap-2">
              <input id="is_featured" name="is_featured" type="checkbox" defaultChecked={!!e.is_featured} className="h-4 w-4 rounded border-gray-300" />
              <span className="text-sm">Featured</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {e.poster_url ? <a href={e.poster_url} target="_blank" className="underline">Current poster</a> : "No poster"}
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Save Changes</button>
            <form action={deleteEvent}>
              <input type="hidden" name="id" value={e.id} />
              <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
            </form>
          </div>
        </div>
      </form>
    </div>
  );
}

function Label(props: React.ComponentProps<"label">) {
  return <label {...props} className="block text-sm font-medium text-gray-700" />;
}
function Field({ id, label, type="text", required=false, defaultValue, ...rest }: { id: string; label: string; type?: string; required?: boolean; defaultValue?: any }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} name={id} type={type} required={required} defaultValue={defaultValue} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" {...rest} />
    </div>
  );
}
