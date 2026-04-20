// app/events/[id]/page.tsx
import ShareButton from "@/components/share-button";
import PublicHeader from "@/components/public-header";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabaseServer";
import { Calendar, Clock, MapPin, Mail, Phone, Tag, ArrowLeft } from "lucide-react";

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
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="rounded-2xl border bg-white p-12 shadow-sm">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h2 className="mb-2 text-xl font-bold text-gray-900">Event Not Available</h2>
            <p className="mb-6 text-sm text-gray-600">
              This event may be pending approval or has already completed.
            </p>
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all events
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = data as any;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Back + Share row */}
        <div className="flex items-center justify-between">
          <a href="/events" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to All Events
          </a>
          <ShareButton
            path={`/events/${e.id}`}
            title={e.name}
            text={e.description ?? undefined}
          />
        </div>

        {/* Poster */}
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
                className="max-h-[500px] w-full object-contain"
              />
            </a>
          ) : (
            <div className="h-64 w-full bg-gradient-to-br from-indigo-50 to-purple-50" />
          )}
        </div>

        {/* Main details */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{e.name}</h1>
            {e.organization_name && (
              <p className="mt-1 text-sm font-medium text-indigo-600">{e.organization_name}</p>
            )}
          </div>

          {Array.isArray(e.category) && e.category.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {e.category.map((c: string) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                >
                  <Tag className="h-3 w-3" />
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Info grid */}
          <div className="grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
            <InfoRow
              icon={<Calendar className="h-4 w-4 text-indigo-500" />}
              label="Date"
              value={e.event_date ?? "—"}
            />
            {e.event_time && (
              <InfoRow
                icon={<Clock className="h-4 w-4 text-indigo-500" />}
                label="Time"
                value={(e.event_time as string).slice(0, 5)}
              />
            )}
            {e.location && (
              <InfoRow
                icon={<MapPin className="h-4 w-4 text-purple-500" />}
                label="Location"
                value={e.location}
              />
            )}
            <InfoRow
              label="Registration"
              value={
                e.registration_fee_type === "paid" && e.registration_fee_amount
                  ? `₹${Number(e.registration_fee_amount).toFixed(2)}`
                  : "Free"
              }
            />
          </div>

          {e.description && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">About this event</h2>
              <p className="whitespace-pre-line text-sm leading-7 text-gray-700">
                {e.description}
              </p>
            </div>
          )}
        </div>

        {/* Organizer */}
        {(e.organiser_name || e.organiser_email || e.organiser_phone) && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
            <h3 className="mb-4 text-base font-bold text-gray-900">Organizer</h3>
            <div className="space-y-2.5">
              {e.organiser_name && (
                <InfoRow label="Name" value={e.organiser_name} />
              )}
              {e.organiser_email && (
                <InfoRow
                  icon={<Mail className="h-4 w-4 text-gray-400" />}
                  label="Email"
                  value={
                    <a href={`mailto:${e.organiser_email}`} className="text-indigo-600 hover:underline">
                      {e.organiser_email}
                    </a>
                  }
                />
              )}
              {e.organiser_phone && (
                <InfoRow
                  icon={<Phone className="h-4 w-4 text-gray-400" />}
                  label="Phone"
                  value={
                    <a href={`tel:${e.organiser_phone}`} className="text-indigo-600 hover:underline">
                      {e.organiser_phone}
                    </a>
                  }
                />
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

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
    <div className="flex items-start gap-2.5">
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      {label && (
        <span className="min-w-[5rem] shrink-0 text-sm text-gray-500">{label}:</span>
      )}
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
