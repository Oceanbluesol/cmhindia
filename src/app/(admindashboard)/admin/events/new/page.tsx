import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { createEventAdmin } from "../actions";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminEventNew({ searchParams }: { searchParams?: SP }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const sp = (await searchParams) ?? {};
  const error = typeof sp.error === "string" ? decodeURIComponent(sp.error) : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">Create Event</h1>
        <a href="/admin/events" className="text-sm text-gray-500 hover:text-indigo-600">← Back</a>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={createEventAdmin} className="space-y-5 rounded-xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Event Name" required />
          <Field id="organization_name" label="Organization" />
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" name="description" rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200" />
          </div>
          <Field id="event_date" label="Date" type="date" />
          <Field id="event_time" label="Time" type="time" />
          <Field id="location" label="Location" />
          <Field id="category" label="Categories (comma separated)" placeholder="tech, meetup" />
          <div>
            <Label htmlFor="poster">Poster (image)</Label>
            <input id="poster" name="poster" type="file" accept="image/*" className="mt-1 w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-indigo-700" />
          </div>
          <div>
            <Label htmlFor="registration_fee_type">Registration Type</Label>
            <select id="registration_fee_type" name="registration_fee_type" defaultValue="free" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200">
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <Field id="registration_fee_amount" label="Fee Amount (if paid)" type="number" min="0" step="0.01" />
          <Field id="member_limit" label="Max Attendees (blank = unlimited)" type="number" min="0" />
          <Field id="organiser_name" label="Organizer Name" />
          <Field id="organiser_phone" label="Organizer Phone" />
          <Field id="organiser_email" label="Organizer Email" type="email" />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <a href="/admin/events" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</a>
          <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700">Create Event</button>
        </div>
      </form>
    </div>
  );
}

function Label(props: React.ComponentProps<"label">) {
  return <label {...props} className="block text-sm font-medium text-gray-700" />;
}

function Field({ id, label, type = "text", required = false, ...rest }: {
  id: string; label: string; type?: string; required?: boolean; placeholder?: string; min?: string; step?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} name={id} type={type} required={required} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200" {...rest} />
    </div>
  );
}
