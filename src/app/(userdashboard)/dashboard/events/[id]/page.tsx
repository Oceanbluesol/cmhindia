// app/(userdashboard)/dashboard/events/[id]/page.tsx
import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Params = { params: { id: string } };

// -------- SERVER ACTIONS --------
async function updateEvent(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;

  // fetch existing (for previous poster cleanup)
  const { data: existing, error: exErr } = await supabase
    .from("events")
    .select("poster_url, user_id")
    .eq("id", id)
    .single();

  if (exErr) redirect(`/error?m=${encodeURIComponent(exErr.message)}`);

  const updates: any = {
    name: (formData.get("name") as string) || null,
    organization_name: (formData.get("organization_name") as string) || null,
    description: (formData.get("description") as string) || null,
    event_date: (formData.get("event_date") as string) || null,
    event_time: (formData.get("event_time") as string) || null,
    location: (formData.get("location") as string) || null,
    poster_url: (formData.get("poster_url") as string) || (existing?.poster_url ?? null),
    registration_fee_type: (formData.get("registration_fee_type") as string) || "free",
    registration_fee_amount:
      (formData.get("registration_fee_amount") as string) !== ""
        ? Number(formData.get("registration_fee_amount"))
        : null,
    organiser_name: (formData.get("organiser_name") as string) || null,
    organiser_phone: (formData.get("organiser_phone") as string) || null,
    organiser_email: (formData.get("organiser_email") as string) || null,
  };

  // categories CSV -> text[]
  const categoryCSV = (formData.get("category") as string) || "";
  updates.category =
    categoryCSV
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean) || [];

  // member limit
  const member_limit_raw = formData.get("member_limit") as string;
  updates.is_unlimited = !member_limit_raw || Number(member_limit_raw) <= 0;
  updates.member_limit = updates.is_unlimited ? null : Number(member_limit_raw);

  // Handle new poster (if provided) — use admin client to bypass Storage RLS
  const posterFile = formData.get("poster") as File | null;
  if (posterFile && posterFile.size > 0) {
    const userId = existing?.user_id || "misc";
    const ext = (posterFile.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${safeExt}`;

    const { error: upErr } = await supabaseAdmin
      .storage
      .from("event-posters")
      .upload(path, posterFile, {
        upsert: false,
        contentType: posterFile.type || `image/${safeExt}`,
        cacheControl: "3600",
      });

    if (upErr) redirect(`/error?m=${encodeURIComponent(upErr.message)}`);

    const { data: pub } = await supabaseAdmin
      .storage
      .from("event-posters")
      .getPublicUrl(path);

    updates.poster_url = pub?.publicUrl ?? updates.poster_url;

    // Optional: delete previous poster if it was in this bucket
    try {
      const old = existing?.poster_url as string | null;
      if (old && old.includes("/object/public/event-posters/")) {
        const key = old.split("/object/public/event-posters/")[1]; // path after bucket
        if (key) await supabaseAdmin.storage.from("event-posters").remove([key]);
      }
    } catch {}
  }

  const { error } = await supabase.from("events").update(updates).eq("id", id);
  if (error) redirect(`/error?m=${encodeURIComponent(error.message)}`);

  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}

async function deleteEvent(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) redirect(`/error?m=${encodeURIComponent(error.message)}`);

  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}

// -------- PAGE --------
export default async function EditEventPage({ params }: Params) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("events").select("*").eq("id", params.id).single();
  if (error || !data) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">Event not found</h2>
        <a href="/dashboard/events" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
          Back to My Events
        </a>
      </div>
    );
  }

  const e = data as any;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Event</h1>
        <a href="/dashboard/events" className="text-sm text-gray-600 hover:text-indigo-600">← Back</a>
      </div>

      <Card className="border-0 shadow-sm">
        {/* UPDATE FORM (do NOT set encType/method; server actions handle it) */}
        <form action={updateEvent} className="space-y-6 p-6">
          <input type="hidden" name="id" value={e.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Event Name" defaultValue={e.name} required />
            <Field id="organization_name" label="Organization" defaultValue={e.organization_name ?? ""} />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={e.description ?? ""}
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="event_date" label="Date" type="date" defaultValue={e.event_date ?? ""} />
            <Field id="event_time" label="Time" type="time" defaultValue={e.event_time ?? ""} />
          </div>

          <Field id="location" label="Location" defaultValue={e.location ?? ""} />

          {/* Categories CSV */}
          <Field
            id="category"
            label="Categories (comma separated)"
            defaultValue={(e.category ?? []).join(", ")}
            placeholder="tech, meetup"
          />

          {/* Poster controls */}
          <Field id="poster_url" label="Poster URL (optional)" defaultValue={e.poster_url ?? ""} />
          <div>
            <Label htmlFor="poster">Upload New Poster (optional)</Label>
            <Input id="poster" name="poster" type="file" accept="image/*" className="mt-1" />
            <p className="mt-1 text-xs text-gray-500">Uploading a file replaces the current poster.</p>
          </div>

          {/* Registration */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="registration_fee_type">Registration Type</Label>
              <select
                id="registration_fee_type"
                name="registration_fee_type"
                defaultValue={e.registration_fee_type ?? "free"}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <Field
              id="registration_fee_amount"
              label="Fee Amount (if paid)"
              type="number"
              min="0"
              step="0.01"
              defaultValue={e.registration_fee_amount ?? ""}
            />
          </div>

          <Field
            id="member_limit"
            label="Max Attendees (leave blank = unlimited)"
            type="number"
            min="0"
            defaultValue={e.member_limit ?? ""}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="organiser_name" label="Organizer Name" defaultValue={e.organiser_name ?? ""} />
            <Field id="organiser_email" label="Organizer Email" type="email" defaultValue={e.organiser_email ?? ""} />
            <Field id="organiser_phone" label="Organizer Phone" defaultValue={e.organiser_phone ?? ""} />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {e.poster_url ? (
                <a href={e.poster_url} target="_blank" className="underline">
                  Current poster
                </a>
              ) : (
                "No poster"
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* DELETE FORM — separate (avoid nested forms) */}
      <div className="mt-4 flex justify-end">
        <form action={deleteEvent}>
          <input type="hidden" name="id" value={e.id} />
          <Button type="submit" className="bg-red-500 hover:bg-red-600">
            Delete
          </Button>
        </form>
      </div>
    </div>
  );
}

// ---- tiny field helpers using shadcn UI ----
function Field(
  { id, label, type = "text", required = false, defaultValue, ...rest }:
  React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }
) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        defaultValue={defaultValue as any}
        className="mt-1"
        {...rest}
      />
    </div>
  );
}
