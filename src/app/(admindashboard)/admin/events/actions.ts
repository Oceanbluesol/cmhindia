"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

/* ---------- auth guard ---------- */
async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");
  return { supabase, user };
}

/* ---------- status helpers ---------- */
async function setStatus(id: string, status: "pending" | "approved" | "rejected") {
  const { supabase } = await ensureAdmin();
  const { error } = await supabase.from("events").update({ status }).eq("id", id);
  if (error) redirect(`/admin/events/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/admin/events");
}

export async function approveEvent(formData: FormData) {
  const id = (formData.get("id") as string) || "";
  if (!id) redirect("/admin/events?error=missing_id");
  await setStatus(id, "approved");
  redirect(`/admin/events/${id}`);
}

export async function rejectEvent(formData: FormData) {
  const id = (formData.get("id") as string) || "";
  if (!id) redirect("/admin/events?error=missing_id");
  await setStatus(id, "rejected");
  redirect(`/admin/events/${id}`);
}

export async function pendingEvent(formData: FormData) {
  const id = (formData.get("id") as string) || "";
  if (!id) redirect("/admin/events?error=missing_id");
  await setStatus(id, "pending");
  redirect(`/admin/events/${id}`);
}

export async function featureEvent(formData: FormData) {
  const { supabase } = await ensureAdmin();
  const id = (formData.get("id") as string) || "";
  const current = (formData.get("is_featured") as string) === "true";
  if (!id) redirect("/admin/events?error=missing_id");

  const { error } = await supabase.from("events").update({ is_featured: !current }).eq("id", id);
  if (error) redirect(`/admin/events/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/admin/events");
  redirect(`/admin/events/${id}`);
}

export async function deleteEventAdmin(formData: FormData) {
  const { supabase } = await ensureAdmin();
  const id = (formData.get("id") as string) || "";
  if (!id) redirect("/admin/events?error=missing_id");

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) redirect(`/admin/events/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function updateEventAdmin(formData: FormData) {
  const { supabase } = await ensureAdmin();

  const id = (formData.get("id") as string) || "";
  if (!id) redirect("/admin/events?error=missing_id");

  const { data: existing, error: exErr } = await supabase
    .from("events")
    .select("poster_url,user_id")
    .eq("id", id)
    .single();

  if (exErr || !existing) redirect(`/admin/events/${id}?error=not_found`);

  const updates: any = {
    name: (formData.get("name") as string)?.trim(),
    organization_name: (formData.get("organization_name") as string) || null,
    description: (formData.get("description") as string) || null,
    event_date: (formData.get("event_date") as string) || null,
    event_time: (formData.get("event_time") as string) || null,
    location: (formData.get("location") as string) || null,
    registration_fee_type: (formData.get("registration_fee_type") as "free" | "paid") || "free",
    registration_fee_amount:
      (formData.get("registration_fee_amount") as string) !== ""
        ? Number(formData.get("registration_fee_amount"))
        : null,
    organiser_name: (formData.get("organiser_name") as string) || null,
    organiser_phone: (formData.get("organiser_phone") as string) || null,
    organiser_email: (formData.get("organiser_email") as string) || null,
    status: (formData.get("status") as "pending" | "approved" | "rejected") || "pending",
    is_featured: (formData.get("is_featured") as string) === "on",
  };

  const csv = (formData.get("category") as string) || "";
  updates.category = csv.split(",").map((c) => c.trim()).filter(Boolean);

  const mlRaw = (formData.get("member_limit") as string) || "";
  const ml = mlRaw ? Number(mlRaw) : 0;
  updates.is_unlimited = !ml || ml <= 0;
  updates.member_limit = updates.is_unlimited ? null : ml;

  // Poster (optional)
  const posterFile = formData.get("poster") as File | null;
  if (posterFile && posterFile.size > 0) {
    const ext = posterFile.name.split(".").pop() || "jpg";
    const folder = existing.user_id ?? "misc";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage.from("event-posters").upload(path, posterFile, { upsert: false });
    if (upErr) redirect(`/admin/events/${id}?error=${encodeURIComponent(upErr.message)}`);

    const { data: pub } = await supabase.storage.from("event-posters").getPublicUrl(path);
    updates.poster_url = pub?.publicUrl ?? existing.poster_url;

    // optional cleanup of old file
    try {
      const old = existing.poster_url as string | null;
      if (old && old.includes("/object/public/event-posters/")) {
        const key = old.split("/object/public/event-posters/")[1];
        if (key) await supabase.storage.from("event-posters").remove([key]);
      }
    } catch {}
  }

  const { error } = await supabase.from("events").update(updates).eq("id", id);
  if (error) redirect(`/admin/events/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/admin/events");
  redirect(`/admin/events/${id}`);
}

export async function createEventAdmin(formData: FormData) {
  const { supabase, user } = await ensureAdmin();

  const name = (formData.get("name") as string)?.trim();
  if (!name) redirect("/admin/events/new?error=missing_name");

  const posterFile = formData.get("poster") as File | null;
  let poster_url: string | null = null;

  if (posterFile && posterFile.size > 0) {
    const ext = posterFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("event-posters").upload(path, posterFile, { upsert: false });
    if (upErr) redirect(`/admin/events/new?error=${encodeURIComponent(upErr.message)}`);
    const { data: pub } = await supabase.storage.from("event-posters").getPublicUrl(path);
    poster_url = pub?.publicUrl ?? null;
  }

  const registration_fee_type = (formData.get("registration_fee_type") as "free" | "paid") || "free";
  const registration_fee_amount =
    registration_fee_type === "paid" ? Number(formData.get("registration_fee_amount") || 0) : null;

  const member_limit_raw = (formData.get("member_limit") as string) || "";
  const is_unlimited = !member_limit_raw || Number(member_limit_raw) <= 0;
  const member_limit = is_unlimited ? null : Number(member_limit_raw);

  const csv = (formData.get("category") as string) || "";
  const category = csv.split(",").map((c) => c.trim()).filter(Boolean);

  const { error } = await supabase.from("events").insert([
    {
      user_id: user.id,
      name,
      organization_name: (formData.get("organization_name") as string) || null,
      description: (formData.get("description") as string) || null,
      event_date: (formData.get("event_date") as string) || null,
      event_time: (formData.get("event_time") as string) || null,
      location: (formData.get("location") as string) || null,
      category,
      poster_url,
      registration_fee_type,
      registration_fee_amount,
      member_limit,
      is_unlimited,
      organiser_name: (formData.get("organiser_name") as string) || null,
      organiser_phone: (formData.get("organiser_phone") as string) || null,
      organiser_email: (formData.get("organiser_email") as string) || null,
      status: "pending",
      is_featured: false,
    },
  ]);

  if (error) redirect(`/admin/events/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/events");
  redirect("/admin/events");
}
