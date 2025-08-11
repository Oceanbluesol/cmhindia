import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

export default async function AdminOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">Admin sign-in required</h3>
        <a href="/auth/login" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
          Go to Login
        </a>
      </div>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return (
      <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold">No access</h3>
        <p className="mt-1 text-sm text-gray-600">Your account is not an admin.</p>
        <a href="/" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
          Back to Home
        </a>
      </div>
    );
  }

  const total = (await supabase.from("events").select("*", { count: "exact", head: true })).count ?? 0;
  const pending = (await supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "pending"))
    .count ?? 0;
  const approved = (await supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "approved"))
    .count ?? 0;
  const rejected = (await supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "rejected"))
    .count ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Overview</h1>
          <p className="text-sm text-gray-600">Approve events and monitor RSVPs.</p>
        </div>
        <Link
          href="/admin/events"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Review Events
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total" value={total} />
        <Stat label="Pending" value={pending} badge="bg-amber-500" />
        <Stat label="Approved" value={approved} badge="bg-green-500" />
        <Stat label="Rejected" value={rejected} badge="bg-red-500" />
      </section>
    </div>
  );
}

function Stat({ label, value, badge }: { label: string; value: number; badge?: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        {badge ? <span className={`h-2.5 w-2.5 rounded-full ${badge}`} /> : null}
      </div>
    </div>
  );
}
