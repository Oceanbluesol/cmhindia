'use server';

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ActionState = { ok: boolean; message: string };

export async function createEventAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please sign in to create events." };

  // Required fields
  const name = (formData.get("name") as string)?.trim();
  const organization_name = (formData.get("organization_name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const event_date = (formData.get("event_date") as string) || null;
  const event_time = (formData.get("event_time") as string) || null;
  const location = (formData.get("location") as string)?.trim();

  if (!name || !organization_name || !description || !event_date || !event_time || !location) {
    return { ok: false, message: "Please fill all required fields." };
  }

  // Categories (checkboxes named "category")
  const category = (formData.getAll("category") as string[]) || [];
  const finalCategories = category.length ? category : ["general"];

  // Registration
  const registration_fee_type =
    ((formData.get("registration_fee_type") as string) || "free") as "free" | "paid";
  const registration_fee_amount =
    registration_fee_type === "paid"
      ? Number(formData.get("registration_fee_amount") || 0)
      : null;

  // Capacity
  const is_unlimited = (formData.get("is_unlimited") as string) === "on";
  const member_limit = is_unlimited
    ? null
    : (() => {
        const v = formData.get("member_limit") as string | null;
        return v ? Number(v) : null;
      })();

  // Organiser (optional)
  const organiser_name = (formData.get("organiser_name") as string) || null;
  const organiser_phone = (formData.get("organiser_phone") as string) || null;
  const organiser_email = (formData.get("organiser_email") as string) || null;

  // Poster (required)
  const posterFile = formData.get("poster") as File | null;
  if (!posterFile || posterFile.size === 0) {
    return { ok: false, message: "Please upload an event poster image." };
  }
  if (posterFile.type && !posterFile.type.startsWith("image/")) {
    return { ok: false, message: "Poster must be an image file." };
  }

  // Upload with SERVICE ROLE (bypasses Storage RLS)
  const ext = (posterFile.name.split(".").pop() || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${safeExt}`;

  const { error: uploadErr } = await supabaseAdmin
    .storage
    .from("event-posters")
    .upload(path, posterFile, {
      upsert: false,
      contentType: posterFile.type || `image/${safeExt}`,
      cacheControl: "3600",
    });

  if (uploadErr) {
    return { ok: false, message: `Poster upload failed: ${uploadErr.message}` };
  }

  const { data: pub } = await supabaseAdmin
    .storage
    .from("event-posters")
    .getPublicUrl(path);

  const poster_url = pub?.publicUrl ?? null;

  // Insert event (with user session; respects your events RLS)
  const { error: insertErr } = await supabase.from("events").insert([
    {
      user_id: user.id,
      name,
      organization_name,
      description,
      event_date,
      event_time,
      location,
      category: finalCategories,
      poster_url,
      registration_fee_type,
      registration_fee_amount,
      member_limit,
      is_unlimited,
      organiser_name,
      organiser_phone,
      organiser_email,
      status: "pending",
      is_featured: false,
    },
  ]);

  if (insertErr) {
    return { ok: false, message: insertErr.message };
  }

  revalidatePath("/dashboard/events");
  return { ok: true, message: "Event submitted for approval." };
}
