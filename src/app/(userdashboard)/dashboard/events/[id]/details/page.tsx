// app/(userdashboard)/dashboard/events/[id]/details/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

type PageParams = { id: string };

export default async function UserEventDetailsPage({
  // ✅ Next 15: params is a Promise you must await
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Only allow the owner to view their event details in dashboard
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Event not found</h2>
        <a
          href="/dashboard/events"
          className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
        >
          ← Back to My Events
        </a>
      </div>
    );
  }

  const e = data as any;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Poster */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {e.poster_url ? (
          <img
            src={e.poster_url}
            alt={e.name}
            className="h-72 w-full cursor-pointer object-cover sm:h-80"
            onClick={() => window.open(e.poster_url as string, "_blank")}
          />
        ) : (
          <div className="h-72 w-full bg-gray-100 sm:h-80" />
        )}
        <div className="p-4 text-sm text-gray-700">
          <p>
            {e.event_date ?? ""} {e.event_time ? `• ${e.event_time}` : ""}
          </p>
          {e.location && <p>{e.location}</p>}
          <p className="mt-1">
            {e.registration_fee_type === "paid" && e.registration_fee_amount ? (
              <span className="font-medium text-gray-900">
                Fee: ${Number(e.registration_fee_amount).toFixed(2)}
              </span>
            ) : (
              <span className="font-medium text-green-600">Free</span>
            )}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold">{e.name}</h1>
            <StatusBadge status={e.status} />
          </div>
          {e.organization_name ? (
            <p className="mt-1 text-sm text-gray-600">{e.organization_name}</p>
          ) : null}

          {Array.isArray(e.category) && e.category.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {e.category.map((c: string) => (
                <span
                  key={c}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                >
                  {c}
                </span>
              ))}
            </div>
          ) : null}

          {e.description ? (
            <p className="mt-4 whitespace-pre-line text-sm text-gray-700">
              {e.description}
            </p>
          ) : null}
        </div>

        {/* Organizer */}
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

        <div className="flex items-center justify-between">
          <a
            href="/dashboard/events"
            className="text-sm text-gray-600 hover:text-indigo-600"
          >
            ← Back to My Events
          </a>
          <a
            href={`/dashboard/events/${e.id}`}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Edit Event
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
