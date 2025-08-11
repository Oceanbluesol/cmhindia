"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

// gate
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");
  return { supabase, user };
}

function s(v: FormDataEntryValue | null) { return (v as string | null)?.toString().trim() || null; }
function csv(x: string | null) { return x ? x.split(",").map(t=>t.trim()).filter(Boolean) : []; }
function num(x: string | null) { if (!x) return null; const n = Number(x); return Number.isFinite(n) ? n : null; }
function bool(x: string | null, fallback=false) { if (x==null) return fallback; return ["true","1","on","yes"].includes(x); }

// CREATE
export async function adminCreateEvent(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  // poster upload (optional)
  let poster_url: string | null = null;
  const file = formData.get("poster") as File | null;
  if (file && file.size > 0) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("event-posters").upload(path, file, {
      upsert: false, contentType: file.type || `image/${ext}`,
    });
    if (upErr) redirect(`/error?m=${encodeURIComponent(upErr.message)}`);
    const { data: pub } = await supabase.storage.from("event-posters").getPublicUrl(path);
    poster_url = pub?.publicUrl ?? null;
  }

  const registration_fee_type = (s(formData.get("registration_fee_type")) as "free"|"paid") || "free";
  const registration_fee_amount = registration_fee_type === "paid" ? num(s(formData.get("registration_fee_amount"))) : null;

  const member_limit = num(s(formData.get("member_limit")));
  const is_unlimited = !member_limit;

  const insertRow = {
    user_id: user.id,
    name: s(formData.get("name")),
    organization_name: s(formData.get("organization_name")),
    description: s(formData.get("description")),
    event_date: s(formData.get("event_date")),
    event_time: s(formData.get("event_time")),
    location: s(formData.get("location")),
    category: csv(s(formData.get("category"))),
    poster_url,
    registration_fee_type,
    registration_fee_amount,
    member_limit,
    is_unlimited,
    organiser_name: s(formData.get("organiser_name")),
    organiser_phone: s(formData.get("organiser_phone")),
    organiser_email: s(formData.get("organiser_email")),
    status: (s(formData.get("status")) as "pending"|"approved"|"rejected") || "approved",
    is_featured: bool(s(formData.get("is_featured")), false),
  };

  const { error } = await supabase.from("events").insert(insertRow);
  if (error) redirect(`/error?m=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

// UPDATE
export async function adminUpdateEvent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData.get("id"));
  if (!id) redirect(`/error?m=${encodeURIComponent("Missing event id")}`);

  const { data: existing, error: exErr } = await supabase.from("events").select("poster_url,user_id,is_featured").eq("id", id).single();
  if (exErr || !existing) redirect(`/error?m=${encodeURIComponent(exErr?.message || "Event not found")}`);

  let poster_url = s(formData.get("poster_url")) || (existing.poster_url ?? null);
  const file = formData.get("poster") as File | null;
  if (file && file.size > 0) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${existing.user_id || "misc"}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("event-posters").upload(path, file, {
      upsert: false, contentType: file.type || `image/${ext}`,
    });
    if (upErr) redirect(`/error?m=${encodeURIComponent(upErr.message)}`);
    const { data: pub } = await supabase.storage.from("event-posters").getPublicUrl(path);
    poster_url = pub?.publicUrl ?? poster_url;

    // try remove old
    try {
      const old = existing.poster_url as string | null;
      if (old && old.includes("/object/public/event-posters/")) {
        const key = old.split("/object/public/event-posters/")[1];
        if (key) await supabase.storage.from("event-posters").remove([key]);
      }
    } catch {}
  }

  const registration_fee_type = (s(formData.get("registration_fee_type")) as "free"|"paid") || "free";
  const registration_fee_amount = registration_fee_type === "paid" ? num(s(formData.get("registration_fee_amount"))) : null;

  const member_limit = num(s(formData.get("member_limit")));
  const is_unlimited = !member_limit;
  const status = (s(formData.get("status")) as "pending"|"approved"|"rejected") || "pending";

  const updates = {
    name: s(formData.get("name")),
    organization_name: s(formData.get("organization_name")),
    description: s(formData.get("description")),
    event_date: s(formData.get("event_date")),
    event_time: s(formData.get("event_time")),
    location: s(formData.get("location")),
    category: csv(s(formData.get("category"))),
    poster_url,
    registration_fee_type,
    registration_fee_amount,
    member_limit,
    is_unlimited,
    organiser_name: s(formData.get("organiser_name")),
    organiser_phone: s(formData.get("organiser_phone")),
    organiser_email: s(formData.get("organiser_email")),
    status,
    is_featured: bool(s(formData.get("is_featured")), !!existing.is_featured),
  };

  const { error } = await supabase.from("events").update(updates).eq("id", id);
  if (error) redirect(`/error?m=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  redirect(`/admin/events/${id}`);
}

// STATUS
async function setStatus(id: string, status: "pending"|"approved"|"rejected") {
  const { supabase } = await requireAdmin();
  await supabase.from("events").update({ status }).eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
}
export async function approveEvent(formData: FormData){ await setStatus((s(formData.get("id")) as string), "approved"); }
export async function pendingEvent(formData: FormData){ await setStatus((s(formData.get("id")) as string), "pending"); }
export async function rejectEvent(formData: FormData){ await setStatus((s(formData.get("id")) as string), "rejected"); }

// FEATURE TOGGLE
export async function featureEvent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData.get("id")) as string;
  const is_featured = s(formData.get("is_featured")) === "true";
  await supabase.from("events").update({ is_featured: !is_featured }).eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
}

// DELETE
export async function deleteEvent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = s(formData.get("id")) as string;

  const { data: row } = await supabase.from("events").select("poster_url").eq("id", id).single();
  await supabase.from("events").delete().eq("id", id);

  try {
    const old = row?.poster_url as string | null;
    if (old && old.includes("/object/public/event-posters/")) {
      const key = old.split("/object/public/event-posters/")[1];
      if (key) await supabase.storage.from("event-posters").remove([key]);
    }
  } catch {}

  revalidatePath("/admin/events");
  redirect("/admin/events");
}
