import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseServer";
import { Calendar, Clock, MapPin, DollarSign, Ticket, ArrowLeft } from "lucide-react";
import RsvpStatus from "@/components/rsvp-status";
import Link from "next/link";

type Params = { params: { id: string } };

async function submitRSVP(formData: FormData) {
  "use server";
  const supabase = await createClient();

  const event_id = formData.get("event_id") as string;
  const guest_name = (formData.get("guest_name") as string)?.trim();
  const guest_email = (formData.get("guest_email") as string)?.trim();
  const guest_phone = (formData.get("guest_phone") as string)?.trim() || null;

  if (!event_id || !guest_name || !guest_email) {
    redirect(`/events/${event_id}?error=Please%20fill%20name%20and%20email`);
  }

  const { error } = await supabase.from("rsvps").insert([
    { event_id, guest_name, guest_email, guest_phone },
  ]);

  if (error) {
    redirect(`/events/${event_id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/events/${event_id}`);
  redirect(`/events/${event_id}?success=1`);
}

export default async function EventDetailPage({ params }: Params) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .eq("status", "approved")    // public only
    .gte("event_date", today)    // hide completed
    .single();

  if (!data) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Event not available</h2>
        <p className="mt-1 text-sm text-gray-600">
          This event may be pending approval or already completed.
        </p>
        <a href="/events" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
          Back to all events
        </a>
      </div>
    );
  }

  const e = data as any;
  const isPaid = e.registration_fee_type === "paid" && e.registration_fee_amount;

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-2xl border p-8 bg-white shadow-sm">
         {/* Back link */}
      <div>
        <a href="/events" className="text-sm text-gray-600 hover:text-indigo-600">
          ← Back to all events
        </a>
      </div>
      <div className="relative mt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {e.poster_url ? (
          <Link
  href={e.poster_url ?? "#"}
  target="_blank"
  rel="noopener noreferrer"
  className="block"
>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src={e.poster_url ?? ""}
    alt={e.name}
    className="h-72 w-full cursor-zoom-in object-cover sm:h-80"
  />
</Link>

        ) : (
          <div className="h-72 w-full bg-gray-100 sm:h-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
              {isPaid ? "Paid" : "Free"}
            </span>
            {Array.isArray(e.category) && e.category.length
              ? e.category.slice(0, 3).map((c: string) => (
                  <span
                    key={c}
                    className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur"
                  >
                    {c}
                  </span>
                ))
              : null}
          </div>

          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{e.name}</h1>

          <div className="mt-2 grid gap-2 text-sm sm:flex sm:flex-wrap sm:items-center sm:gap-4">
            {(e.event_date || e.event_time) && (
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {e.event_date ?? ""} {e.event_time ? `• ${e.event_time}` : ""}
                </span>
              </p>
            )}
            {e.location && (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{e.location}</span>
              </p>
            )}
            {isPaid ? (
              <p className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">
                  ${Number(e.registration_fee_amount).toFixed(2)}
                </span>
              </p>
            ) : null}
          </div>
        </div>
        </div>  
      </section>

      {/* Content grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            {e.organization_name ? (
              <p className="text-sm text-gray-600">
                Hosted by <span className="font-medium">{e.organization_name}</span>
              </p>
            ) : null}

            {e.description ? (
              <p className="mt-4 text-sm text-gray-800 whitespace-pre-line leading-6">
                {e.description}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No description provided.</p>
            )}
          </div>

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

        {/* Right: RSVP card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">RSVP</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                <Ticket className="h-3.5 w-3.5" /> 1-click RSVP
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              No account required. Your details go only to the organizer.
            </p>

            <form action={submitRSVP} className="mt-4 grid gap-4">
              <input type="hidden" name="event_id" value={e.id} />
              <Field id="guest_name" label="Full Name" placeholder="Jane Doe" required />
              <Field id="guest_email" label="Email" type="email" placeholder="jane@example.com" required />
              <Field id="guest_phone" label="Phone (optional)" placeholder="+1 555-123-4567" />
              <button
                type="submit"
                className="mt-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Submit RSVP
              </button>
            </form>

            <RsvpStatus className="mt-4" />
          </div>
        </aside>
      </div>

     
    </div>
  );
}

function Label(props: React.ComponentProps<"label">) {
  return <label {...props} className="block text-sm font-medium text-gray-700" />;
}
function Field({
  id,
  label,
  type = "text",
  placeholder,
  required = false,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}
