'use client';

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { createEventAction, type ActionState } from "./action";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function NewEventPage() {
  const [state, formAction] = React.useActionState<ActionState, FormData>(
    createEventAction,
    { ok: false, message: "" }
  );
  const router = useRouter();

  // Render gating to avoid any SSR/CSR attribute drift
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Local UI state mirrored via hidden inputs
  const [feeType, setFeeType] = React.useState<"free" | "paid">("free");
  const [unlimited, setUnlimited] = React.useState(true);
  const [posterPreview, setPosterPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!state?.message) return;
    if (state.ok) {
      toast.success(state.message);
      const t = setTimeout(() => router.push("/dashboard/events"), 700);
      return () => clearTimeout(t);
    } else {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <Toaster richColors closeButton position="top-right" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Event</h1>
        <a href="/dashboard/events" className="text-sm text-gray-600 hover:text-indigo-600">
          ← Back to My Events
        </a>
      </div>

      <Card className="border-0 shadow-sm">
        {!mounted ? (
          <div className="p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-100" />
            <div className="mt-4 h-10 w-full animate-pulse rounded bg-gray-100" />
            <div className="mt-3 h-10 w-full animate-pulse rounded bg-gray-100" />
            <div className="mt-6 h-40 w-full animate-pulse rounded bg-gray-100" />
          </div>
        ) : (
          <form
            // IMPORTANT: do NOT set encType or method here; React will set them for server actions.
            action={formAction}
            className="p-6 space-y-8"
          >
            {/* Basics */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Event Name *" required />
              <Field id="organization_name" label="Organization *" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="event_date" label="Date *" type="date" required />
              <Field id="event_time" label="Time *" type="time" required />
            </div>

            <Field id="location" label="Location *" required />

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" name="description" rows={4} required className="mt-1" />
            </div>

            {/* Poster */}
            <div>
              <Label htmlFor="poster">Event Poster *</Label>
              <div className="mt-1 rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-gray-600">PNG/JPG/WebP up to 5MB</p>
                <input
                  id="poster"
                  name="poster"
                  type="file"
                  accept="image/*"
                  required
                  className="mt-3"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) setPosterPreview(URL.createObjectURL(file));
                  }}
                />
                {posterPreview && (
                  <img
                    src={posterPreview}
                    alt="Poster preview"
                    className="mx-auto mt-4 h-40 w-full max-w-sm rounded-md border object-cover"
                  />
                )}
              </div>
            </div>

            {/* Registration */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Registration Type *</Label>
                <Select value={feeType} onValueChange={(v) => setFeeType(v as "free" | "paid")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Free or Paid" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                {/* mirror into the form for the server action */}
                <input type="hidden" name="registration_fee_type" value={feeType} />
              </div>

              {feeType === "paid" && (
                <Field
                  id="registration_fee_amount"
                  label="Fee Amount ($) *"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              )}
            </div>

            {/* Capacity */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block">Maximum Attendees</Label>
                <Input
                  id="member_limit"
                  name="member_limit"
                  type="number"
                  min={1}
                  disabled={unlimited}
                  placeholder={unlimited ? "Unlimited" : "Enter a number"}
                />
              </div>
              <div className="flex items-end justify-start gap-2">
                <Switch id="is_unlimited_switch" checked={unlimited} onCheckedChange={setUnlimited} />
                <Label htmlFor="is_unlimited_switch">Unlimited attendees</Label>
                {/* mirror into the form for the server action */}
                <input type="hidden" name="is_unlimited" value={unlimited ? "on" : ""} />
              </div>
            </div>

            {/* Organiser */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="organiser_name" label="Organiser Name" />
              <Field id="organiser_email" label="Organiser Email" type="email" />
              <Field id="organiser_phone" label="Organiser Phone" type="tel" />
            </div>

            {/* Categories */}
            <div>
              <Label>Categories</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["general","conference","workshop","seminar","meetup","concert","sports","other"].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="category"
                      value={cat}
                      defaultChecked={cat === "general"}
                      className="rounded border-gray-300"
                    />
                    <span className="capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <a href="/dashboard/events" className="inline-flex items-center rounded-md border px-4 py-2 text-sm">
                Cancel
              </a>
              <SubmitButton />
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

function Field(
  { id, label, type = "text", required = false, ...rest }:
  React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }
) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} required={required} className="mt-1" {...rest} />
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit for Approval"}
    </Button>
  );
}
