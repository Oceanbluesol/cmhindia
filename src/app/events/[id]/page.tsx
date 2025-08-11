import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .gte("event_date", today)
    .single();

  if (!data) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Event not available</h2>
        <p className="mt-1 text-sm text-gray-600">This event may be pending approval or already completed.</p>
        <a href="/events" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
          Back to all events
        </a>
      </div>
    );
  }

  const e = data as any;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Poster */}
      <div className="lg:col-span-1 overflow-hidden rounded-xl border bg-white shadow-sm">
        {e.poster_url ? (
          <a href={e.poster_url} target="_blank" rel="noreferrer" aria-label="Open poster in new tab">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.poster_url} alt={e.name} className="h-72 w-full object-cover sm:h-80" />
          </a>
        ) : (
          <div className="h-72 w-full bg-gray-100 sm:h-80" />
        )}
        <div className="p-4">
          <p className="text-sm text-gray-600">
            {e.event_date ?? ""} {e.event_time ? `• ${e.event_time}` : ""}
          </p>
          {e.location && <p className="text-sm text-gray-600">{e.location}</p>}
          {e.registration_fee_type === "paid" && e.registration_fee_amount ? (
            <p className="mt-1 text-sm font-medium text-gray-900">Fee: ${Number(e.registration_fee_amount).toFixed(2)}</p>
          ) : (
            <p className="mt-1 text-sm font-medium text-green-600">Free</p>
          )}
        </div>
      </div>

      {/* Details + RSVP */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{e.name}</h1>
          {e.organization_name && <p className="mt-1 text-sm text-gray-600">{e.organization_name}</p>}
          {Array.isArray(e.category) && e.category.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {e.category.map((c: string) => (
                <span key={c} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {c}
                </span>
              ))}
            </div>
          ) : null}
          {e.description && <p className="mt-4 text-sm text-gray-700 whitespace-pre-line">{e.description}</p>}
        </div>

        <RSVPForm eventId={e.id} />
        {(e.organiser_name || e.organiser_email || e.organiser_phone) && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold">Organizer</h3>
            <div className="mt-2 grid gap-1 text-sm text-gray-700">
              {e.organiser_name && <p>Name: {e.organiser_name}</p>}
              {e.organiser_email && <p>Email: {e.organiser_email}</p>}
              {e.organiser_phone && <p>Phone: {e.organiser_phone}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------- server action + form kept in same file for convenience ------- */
async function submitRSVP(formData: FormData) {
  "use server";
  const supabase = await createClient();

  const event_id = formData.get("event_id") as string;
  const guest_name = (formData.get("guest_name") as string)?.trim();
  const guest_email = (formData.get("guest_email") as string)?.trim();
  const guest_phone = (formData.get("guest_phone") as string)?.trim() || null;

  if (!event_id || !guest_name || !guest_email) {
    redirect(`/events/${event_id}?error=missing`);
  }

  const { error } = await supabase.from("rsvps").insert([{ event_id, guest_name, guest_email, guest_phone }]);
  if (error) redirect(`/events/${event_id}?error=${encodeURIComponent(error.message)}`);

  redirect(`/events/${event_id}?success=1`);
}

function Label(props: React.ComponentProps<"label">) {
  return <label {...props} className="block text-sm font-medium text-gray-700" />;
}
function Field({
  id,
  label,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-200"
      />
    </div>
  );
}

function RSVPForm({ eventId }: { eventId: string }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">RSVP</h2>
      <p className="mt-1 text-sm text-gray-600">No account required. Your details go only to the organizer.</p>

      <form action={submitRSVP} className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="event_id" value={eventId} />
        <Field id="guest_name" label="Full Name" required />
        <Field id="guest_email" label="Email" type="email" required />
        <Field id="guest_phone" label="Phone (optional)" />
        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Submit RSVP
          </button>
          <a href="/events" className="text-sm text-gray-600 hover:text-indigo-600">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
