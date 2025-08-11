import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Params = { params: { id: string } };

export default async function EventDetailsPage({ params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Please sign in</h2>
        <a
          href="/auth/login"
          className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go to Login
        </a>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, user_id, name, organization_name, description, event_date, event_time, location, category, poster_url, registration_fee_type, registration_fee_amount, member_limit, is_unlimited, organiser_name, organiser_phone, organiser_email, status, created_at"
    )
    .eq("id", params.id)
    .eq("user_id", user.id) // ensure it belongs to the user
    .single();

  if (error || !data) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Event not found</h2>
        <Link href="/dashboard/events" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
          Back to My Events
        </Link>
      </div>
    );
  }

  const e = data as any;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{e.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            {e.organization_name ? <span>by <span className="font-medium">{e.organization_name}</span></span> : null}
            <StatusBadge status={e.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/events/${e.id}`} className="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">
            Edit Event
          </Link>
          <a href={`/events/${e.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            View public
          </a>
        </div>
      </div>

      {/* Poster + quick meta */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="bg-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {e.poster_url ? (
              <a href={`/dashboard/events/${e.id}/poster`} aria-label="Open full poster">
                <img src={e.poster_url} alt={e.name} className="h-full w-full max-h-[420px] object-cover" />
              </a>
            ) : (
              <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-gray-100 text-sm text-gray-500">
                No poster
              </div>
            )}
          </div>
          <div className="p-5">
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">Date</dt>
                <dd className="font-medium">{e.event_date || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Time</dt>
                <dd className="font-medium">{e.event_time || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Location</dt>
                <dd className="font-medium">{e.location || "—"}</dd>
              </div>

              <div>
                <dt className="text-gray-500">Registration</dt>
                <dd className="font-medium capitalize">
                  {e.registration_fee_type}
                  {e.registration_fee_type === "paid" && e.registration_fee_amount != null
                    ? ` • $${Number(e.registration_fee_amount).toFixed(2)}`
                    : ""}
                </dd>
              </div>

              <div>
                <dt className="text-gray-500">Capacity</dt>
                <dd className="font-medium">
                  {e.is_unlimited ? "Unlimited" : e.member_limit ?? "—"}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-gray-500">Categories</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {(e.category ?? []).length ? (
                    (e.category as string[]).map((c: string) => (
                      <Badge key={c} variant="secondary" className="capitalize">
                        {c}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card className="border-0 p-5 shadow-sm">
        <h2 className="mb-2 text-base font-semibold">Description</h2>
        <p className="whitespace-pre-wrap text-sm text-gray-800">
          {e.description || "—"}
        </p>
      </Card>

      {/* Organiser */}
      <Card className="border-0 p-5 shadow-sm">
        <h2 className="mb-2 text-base font-semibold">Organizer</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium">{e.organiser_name || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium">{e.organiser_email || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Phone</dt>
            <dd className="font-medium">{e.organiser_phone || "—"}</dd>
          </div>
        </dl>
      </Card>

      <div className="flex justify-between">
        <div className="text-xs text-gray-500">
          Created: {e.created_at?.slice(0, 19)?.replace("T", " ") ?? "—"}
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/events/${e.id}`} className="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">
            Edit Event
          </Link>
          <a href={`/events/${e.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            View public
          </a>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : status === "pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
