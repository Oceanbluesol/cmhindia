// app/events/[id]/page.tsx
import { createClient } from "@/lib/supabaseServer";
import { Calendar, Clock, MapPin, Mail, Phone, Tag } from "lucide-react";

export default async function EventDetailPage({
  params,
}: {
  // Next 15: params is a Promise
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
      <div className=" rounded-xl border bg-white p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Event not available</h2>
        <p className="mt-1 text-sm text-gray-600">
          This event may be pending approval or already completed.
        </p>
        <a
          href="/events"
          className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
        >
          Back to all events
        </a>
      </div>
    );
  }

  const e = data as any;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <a href="/events" className="text-sm text-indigo-600 hover:underline">
          ← Back to All Events
        </a>
       
      </div>

      {/* Poster on top */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {e.poster_url ? (
          <a
            href={e.poster_url}
            target="_blank"
            rel="noreferrer"
            aria-label="Open poster in new tab"
            className="block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={e.poster_url}
              alt={e.name}
              className="h-96 w-full object-cover"
            />
          </a>
        ) : (
          <div className="h-96 w-full bg-gray-100" />
        )}
      </div>

      {/* Details below */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{e.name}</h1>
        {e.organization_name ? (
          <p className="mt-1 text-sm text-gray-600">{e.organization_name}</p>
        ) : null}

        {Array.isArray(e.category) && e.category.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {e.category.map((c: string) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
              >
                <Tag className="h-3.5 w-3.5" />
                {c}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 text-sm text-gray-800 sm:grid-cols-2">
          <InfoRow
            icon={<Calendar className="h-4 w-4 text-gray-400" />}
            label="Date"
            value={e.event_date ?? "—"}
          />
          {e.event_time ? (
            <InfoRow
              icon={<Clock className="h-4 w-4 text-gray-400" />}
              label="Time"
              value={(e.event_time as string).slice(0, 5)}
            />
          ) : null}
          {e.location ? (
            <InfoRow
              icon={<MapPin className="h-4 w-4 text-gray-400" />}
              label="Location"
              value={e.location}
            />
          ) : null}
          <InfoRow
            label="Registration"
            value={
              e.registration_fee_type === "paid" && e.registration_fee_amount
                ? `Fee: $${Number(e.registration_fee_amount).toFixed(2)}`
                : "Free"
            }
          />
        </div>

        {e.description ? (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900">About</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
              {e.description}
            </p>
          </div>
        ) : null}
      </div>

      {/* Organizer */}
      {(e.organiser_name || e.organiser_email || e.organiser_phone) && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold">Organizer</h3>
          <div className="mt-3 grid gap-2 text-sm text-gray-700">
            {e.organiser_name ? (
              <InfoRow label="Name" value={e.organiser_name} />
            ) : null}
            {e.organiser_email ? (
              <InfoRow
                icon={<Mail className="h-4 w-4 text-gray-400" />}
                label="Email"
                value={
                  <a
                    href={`mailto:${e.organiser_email}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {e.organiser_email}
                  </a>
                }
              />
            ) : null}
            {e.organiser_phone ? (
              <InfoRow
                icon={<Phone className="h-4 w-4 text-gray-400" />}
                label="Phone"
                value={
                  <a
                    href={`tel:${e.organiser_phone}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {e.organiser_phone}
                  </a>
                }
              />
            ) : null}
          </div>
        </div>
      )}

      {/* --- RSVP temporarily disabled ---
      <RSVPForm eventId={e.id} />
      ----------------------------------- */}
    </div>
  );
}

/* ---------- tiny helpers ---------- */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label?: string;
  value: React.ReactNode;
}) {
  return (
    <p className="flex items-start gap-2">
      {icon ? <span className="mt-0.5">{icon}</span> : null}
      {label ? (
        <span className="min-w-20 shrink-0 text-gray-500">{label}:</span>
      ) : null}
      <span className="font-medium text-gray-900">{value}</span>
    </p>
  );
}

/* ---------- RSVP (commented out) ----------
async function submitRSVP(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const event_id = formData.get("event_id") as string;
  const guest_name = (formData.get("guest_name") as string)?.trim();
  const guest_email = (formData.get("guest_email") as string)?.trim();
  const guest_phone = (formData.get("guest_phone") as string)?.trim() || null;

  // ... insert into rsvps and redirect
}

function RSVPForm({ eventId }: { eventId: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">RSVP</h2>
      <form action={submitRSVP} className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="event_id" value={eventId} />
        // fields...
      </form>
    </div>
  );
}
------------------------------------------- */
