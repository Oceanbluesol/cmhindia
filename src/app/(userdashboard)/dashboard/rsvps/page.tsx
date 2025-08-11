// app/(userdashboard)/dashboard/rsvps/page.tsx
import { createClient } from "@/lib/supabaseServer";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RSVP = {
  id: string;
  event_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  created_at: string;
};

type EventRow = { id: string; name: string };

export default async function RSVPsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Please sign in</h2>
        <p className="mt-1 text-sm text-gray-600">
          You need to be logged in to view RSVPs.
        </p>
        <a
          href="/auth/login"
          className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go to Login
        </a>
      </div>
    );
  }

  // 1) fetch user's events
  const { data: eventsData } = await supabase
    .from("events")
    .select("id,name")
    .eq("user_id", user.id);

  const events = (eventsData as EventRow[]) ?? [];
  const eventMap = new Map(events.map((e) => [e.id, e.name]));

  // 2) fetch RSVPs limited by those events (RLS will also enforce this)
  const eventIds = events.map((e) => e.id);
  let rsvps: RSVP[] = [];
  if (eventIds.length > 0) {
    const { data } = await supabase
      .from("rsvps")
      .select("id,event_id,guest_name,guest_email,guest_phone,created_at")
      .in("event_id", eventIds)
      .order("created_at", { ascending: false });

    rsvps = (data as RSVP[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">RSVPs</h1>
          <p className="text-sm text-gray-600">
            All RSVPs collected for your events.
          </p>
        </div>
        <a
          href="/dashboard/events"
          className="text-sm text-indigo-600 hover:underline"
        >
          Back to Events
        </a>
      </div>

      {rsvps.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold">No RSVPs yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">
            Share your public event links to start collecting RSVPs.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <Table>
            <TableCaption className="text-xs text-gray-500">
              RSVPs for events you created
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rsvps.map((r) => (
                <TableRow key={r.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {eventMap.get(r.event_id) ?? "—"}
                  </TableCell>
                  <TableCell>{r.guest_name}</TableCell>
                  <TableCell className="text-gray-600">
                    {r.guest_email}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {r.guest_phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {new Date(r.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
