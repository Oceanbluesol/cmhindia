"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

export default function RsvpStatus({ className = "" }: { className?: string }) {
  const sp = useSearchParams();
  const success = sp.get("success") === "1";
  const error = sp.get("error");

  if (!success && !error) return null;

  return success ? (
    <div
      className={`rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 ${className}`}
      role="status"
    >
      RSVP submitted! Check your email for any organizer updates.
    </div>
  ) : (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 ${className}`}
      role="alert"
    >
      {error}
    </div>
  );
}
