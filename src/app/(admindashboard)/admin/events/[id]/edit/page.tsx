import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { updateEventAdmin, deleteEventAdmin } from "../../actions";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminEventEdit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: SP;
}) {
  const { id } = await params;
  if (!id) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
  if (error || !data) notFound();

  const sp = (await searchParams) ?? {};
  const urlError = typeof sp.error === "string" ? decodeURIComponent(sp.error) : null;
  const e = data as any;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">Edit Event</h1>
        <a href={`/admin/events/${e.id}`} className="text-sm text-gray-500 hover:text-indigo-600">← Back</a>
      </div>

      {urlError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {urlError}
        </div>
      )}

      <form action={updateEventAdmin} className="space-y-5 rounded-xl border bg-white p-5 shadow-sm sm:p-6">
        <input type="hidden" name="id" value={e.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Event Name" required defaultValue={e.name} />
          <Field id="organization_name" label="Organization" defaultValue={e.organization_name ?? ""} />
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" name="description" rows={4} defaultValue={e.description ?? ""} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200" />
          </div>
          <Field id="event_date" label="Date" type="date" defaultValue={e.event_date ?? ""} />
          <Field id="event_time" label="Time" type="time" defaultValue={e.event_time ?? ""} />
          <Field id="location" label="Location" defaultValue={e.location ?? ""} />
          <Field id="category" label="Categories (comma separated)" defaultValue={(e.category ?? []).join(", ")} placeholder="tech, meetup" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="poster">Upload New Poster (optional)</Label>
            <input id="poster" name="poster" type="file" accept="image/*" className="mt-1 w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-indigo-700" />
            <p className="mt-1 text-xs text-gray-500">Uploading replaces the current poster.</p>
          </div>
          <div className="flex items-end">
            {e.poster_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <a href={e.poster_url} target="_blank" className="block w-full">
                <img src={e.poster_url} alt={e.name} className="h-28 w-full rounded-lg object-cover ring-1 ring-gray-200 hover:opacity-90 sm:h-32" />
                <span className="mt-1 block text-xs text-indigo-600 underline">Open current poster</span>
              </a>
            ) : (
              <div className="h-28 w-full rounded-lg bg-gray-100 ring-1 ring-gray-200 sm:h-32" />
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="registration_fee_type">Registration Type</Label>
            <select id="registration_fee_type" name="registration_fee_type" defaultValue={e.registration_fee_type ?? "free"} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200">
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <Field id="registration_fee_amount" label="Fee Amount (if paid)" type="number" min="0" step="0.01" defaultValue={e.registration_fee_amount ?? ""} />
          <Field id="member_limit" label="Max Attendees (blank = unlimited)" type="number" min="0" defaultValue={e.member_limit ?? ""} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" defaultValue={e.status} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200">
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" name="is_featured" defaultChecked={!!e.is_featured} className="h-4 w-4 rounded border-gray-300 accent-indigo-600" />
              Feature on homepage
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <a href={`/admin/events/${e.id}`} className="text-sm text-gray-500 hover:text-indigo-600">Cancel</a>
          <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">Save Changes</button>
        </div>
      </form>

      <div className="mt-4 flex justify-end">
        <form action={deleteEventAdmin}>
          <input type="hidden" name="id" value={e.id} />
          <button type="submit" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
            Delete Event
          </button>
        </form>
      </div>
    </div>
  );
}

function Label(props: React.ComponentProps<"label">) {
  return <label {...props} className="block text-sm font-medium text-gray-700" />;
}

function Field({ id, label, type = "text", required = false, defaultValue, ...rest }: {
  id: string; label: string; type?: string; required?: boolean; defaultValue?: any; placeholder?: string; min?: string; step?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} name={id} type={type} required={required} defaultValue={defaultValue} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200" {...rest} />
    </div>
  );
}
