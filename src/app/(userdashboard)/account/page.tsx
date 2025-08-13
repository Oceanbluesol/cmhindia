// app/account/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // required for delete
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* =========================
   Server actions
   ========================= */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  return { supabase, user };
}

export async function updateProfile(formData: FormData) {
  "use server";
  const { supabase, user } = await requireUser();

  const full_name = (formData.get("full_name") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const avatar_url = (formData.get("avatar_url") as string)?.trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone, avatar_url })
    .eq("id", user.id);

  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/account");
  redirect("/account?success=profile");
}

export async function updateEmail(formData: FormData) {
  "use server";
  const { supabase } = await requireUser();
  const email = (formData.get("email") as string)?.trim();
  if (!email) redirect("/account?error=missing_email");

  const { error } = await supabase.auth.updateUser({ email });
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/account");
  // Supabase may send a confirmation email depending on your project settings
  redirect("/account?success=email");
}

export async function updatePassword(formData: FormData) {
  "use server";
  const { supabase } = await requireUser();
  const password = (formData.get("password") as string) ?? "";
  if (password.length < 6) redirect("/account?error=weak_password");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/account");
  redirect("/account?success=password");
}

export async function deleteAccount(formData: FormData) {
  "use server";
  const { user } = await requireUser();

  // DANGER: This permanently deletes the user (auth row).
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);

  // Optionally: clean up user rows you own (profiles/events) via RPC or policies

  redirect("/?account_deleted=1");
}

/* =========================
   Page
   ========================= */
export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url, role")
    .eq("id", user.id)
    .single();

  const fullName = profile?.full_name ?? "";
  const phone = profile?.phone ?? "";
  const avatarURL = profile?.avatar_url ?? "";
  const role = profile?.role ?? "user";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-sm text-gray-600">Manage your profile and security.</p>
        </div>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="destructive">Sign out</Button>
        </form>
      </header>

      {/* Basic info */}
      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Email</Label>
            <Input value={user.email ?? ""} readOnly className="mt-1 bg-gray-50" />
          </div>
          <div>
            <Label>Role</Label>
            <Input value={role} readOnly className="mt-1 bg-gray-50 capitalize" />
          </div>
        </div>
      </Card>

      {/* Profile form */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-gray-600">Your public details.</p>

        <form action={updateProfile} className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" defaultValue={fullName} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={phone} className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input id="avatar_url" name="avatar_url" defaultValue={avatarURL} className="mt-1" placeholder="https://..." />
            <p className="mt-1 text-xs text-gray-500">Paste a direct image URL. (You can wire up Storage later.)</p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Save profile</Button>
          </div>
        </form>
      </Card>

      {/* Email form */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Change email</h2>
        <p className="mt-1 text-sm text-gray-600">You may receive a verification email.</p>

        <form action={updateEmail} className="mt-4 grid gap-4 sm:max-w-md">
          <div>
            <Label htmlFor="email">New email</Label>
            <Input id="email" name="email" type="email" required className="mt-1" placeholder="you@example.com" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="secondary">Update email</Button>
          </div>
        </form>
      </Card>

      {/* Password form */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-gray-600">Use at least 6 characters.</p>

        <form action={updatePassword} className="mt-4 grid gap-4 sm:max-w-md">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" minLength={6} required className="mt-1" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="secondary">Update password</Button>
          </div>
        </form>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200 p-6">
        <h2 className="text-base font-semibold text-red-600">Danger zone</h2>
        <p className="mt-1 text-sm text-gray-600">
          Deleting your account is permanent and cannot be undone.
        </p>

        <form action={deleteAccount} className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <span className="text-sm text-red-700">I understand the consequences.</span>
          <Button type="submit" variant="destructive">Delete account</Button>
        </form>
      </Card>
    </div>
  );
}
