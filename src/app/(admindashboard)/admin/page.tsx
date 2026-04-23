import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

export default async function AdminOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">Admin sign-in required</h3>
        <a href="/auth/login" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">Go to Login</a>
      </div>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">No access</h3>
        <p className="mt-1 text-sm text-gray-600">Your account is not an admin.</p>
        <a href="/" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">Back to Home</a>
      </div>
    );
  }

  const total   = (await supabase.from("events").select("*", { count: "exact", head: true })).count ?? 0;
  const pending = (await supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "pending")).count ?? 0;
  const approved= (await supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "approved")).count ?? 0;
  const rejected= (await supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "rejected")).count ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Admin Overview</h1>
          <p className="text-sm text-gray-500">Manage and approve events</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/events/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            + New Event
          </Link>
          <Link href="/admin/events" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            All Events
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Total Events" value={total} color="border-l-gray-400" dot="bg-gray-400" />
        <Stat label="Pending" value={pending} color="border-l-amber-400" dot="bg-amber-400" />
        <Stat label="Approved" value={approved} color="border-l-green-500" dot="bg-green-500" />
        <Stat label="Rejected" value={rejected} color="border-l-red-500" dot="bg-red-500" />
      </section>

      {pending > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">{pending} event{pending !== 1 ? "s" : ""}</span> awaiting review.{" "}
          <Link href="/admin/events?status=pending" className="underline hover:text-amber-900">Review now →</Link>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color, dot }: { label: string; value: number; color: string; dot: string }) {
  return (
    <div className={`rounded-xl border-l-4 border bg-white p-4 shadow-sm ${color}`}>
      <p className="text-xs font-medium text-gray-500 sm:text-sm">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900 sm:text-3xl">{value}</span>
        <span className={`h-2 w-2 rounded-full ${dot}`} />
      </div>
    </div>
  );
}
