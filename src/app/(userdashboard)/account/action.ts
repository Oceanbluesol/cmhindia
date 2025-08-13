"use server";

import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  // server action
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const full_name = (formData.get("full_name") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;

  const avatarFile = formData.get("avatar") as File | null;

  let avatar_url: string | null = null;

  // Optional avatar upload (bucket: "avatars")
  if (avatarFile && avatarFile.size > 0) {
    const ext = (avatarFile.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
    const key = `${user.id}/${crypto.randomUUID()}.${safeExt}`;

    const { error: uploadErr } = await supabase
      .storage
      .from("avatars")
      .upload(key, avatarFile, {
        upsert: false,
        cacheControl: "3600",
        contentType: avatarFile.type || `image/${safeExt}`,
      });

    if (uploadErr) {
      redirect(`/account?error=${encodeURIComponent(uploadErr.message)}`);
    }

    const { data: pub } = await supabase.storage.from("avatars").getPublicUrl(key);
    avatar_url = pub?.publicUrl ?? null;
  }

  // Update profile row
  const updates: Record<string, any> = {
    full_name,
    phone,
    bio,
    updated_at: new Date().toISOString(),
  };
  if (avatar_url) updates.avatar_url = avatar_url;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    redirect(`/account?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/account");
  redirect("/account?updated=1");
}
