export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { updateProfile } from "./action";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, bio, avatar_url, email")
    .eq("id", user.id)
    .single();

  const p = profile || { full_name: "", phone: "", bio: "", avatar_url: "" };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Account</h1>
        <a
          href="/dashboard"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to Dashboard
        </a>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.avatar_url ? (
            <img
              src={p.avatar_url}
              alt="Avatar"
              className="h-16 w-16 rounded-full object-cover ring-1 ring-gray-200"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-100 ring-1 ring-gray-200" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {p.full_name || user.email}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* ✅ Server Action from actions.ts */}
        <form action={updateProfile} className="space-y-5">
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={p.full_name ?? ""}
              placeholder="Your name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={p.phone ?? ""}
                placeholder="e.g. +91 90000 00000"
              />
            </div>
            <div>
              <Label htmlFor="avatar">Avatar (optional)</Label>
              <Input id="avatar" name="avatar" type="file" accept="image/*" />
              <p className="mt-1 text-xs text-gray-500">
                PNG/JPG/WebP. Max a few MB.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={p.bio ?? ""}
              placeholder="Tell people about yourself…"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <a href="/" className="text-sm text-gray-600 hover:text-indigo-600">
              Cancel
            </a>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --- tiny UI helpers (no external deps needed) --- */
function Label(props: React.ComponentProps<"label">) {
  return (
    <label
      {...props}
      className="mb-1 block text-sm font-medium text-gray-700"
    />
  );
}

function Input(props: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
    />
  );
}

function Textarea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
    />
  );
}
