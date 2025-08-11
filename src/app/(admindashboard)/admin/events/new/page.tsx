import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { createEventAdmin } from "../actions";

export default async function AdminEventNew() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Event</h1>
        <a href="/admin/events" className="text-sm text-gray-600 hover:text-indigo-600">← Back</a>
      </div>

      {/* Do NOT set encType with function action; React will add it */}
      <form action={createEventAdmin} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Event Name" required />
          <Field id="organization_name" label="Organization" />
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" name="description" rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-200" />
          </div>
          <Field id="event_date" label="Date" type="date" />
          <Field id="event_time" label="Time" type="time" />
          <Field id="location" label="Location" />
          <Field id="category" label="Categories (comma separated)" placeholder="tech, meetup" />
          <div>
            <Label htmlFor="poster">Poster (image)</Label>
            <input id="poster" name="poster" type="file" accept="image/*" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <Label htmlFor="registration_fee_type">Registration Type</Label>
            <select id="registration_fee_type" name="registration_fee_type" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-200" defaultValue="free">
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <Field id="registration_fee_amount" label="Fee Amount (if paid)" type="number" min="0" step="0.01" />
          <Field id="member_limit" label="Max Attendees (leave blank = unlimited)" type="number" min="0" />
          <Field id="organiser_name" label="Organizer Name" />
          <Field id="organiser_phone" label="Organizer Phone" />
          <Field id="organiser_email" label="Organizer Email" type="email" />
        </div>

        <div className="flex items-center justify-end gap-3">
          <a href="/admin/events" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</a>
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Create</button>
        </div>
      </form>
    </div>
  );
}

function Label(props: React.ComponentProps<"label">) {
  return <label {...props} className="block text-sm font-medium text-gray-700" />;
}
function Field({
  id, label, type = "text", required = false, ...rest
}: {
  id: string; label: string; type?: string; required?: boolean; placeholder?: string; min?: string; step?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} name={id} type={type} required={required} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-200" {...rest} />
    </div>
  );
}
