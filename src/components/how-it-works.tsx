"use client";

import * as React from "react";
import { CalendarCheck, UserPlus, ShieldCheck, MousePointerClick } from "lucide-react";

export default function HowItWorks({ isAuthed }: { isAuthed: boolean }) {
  const ctaHref = isAuthed ? "/dashboard" : "/auth/signup";
  const ctaLabel = isAuthed ? "Open Dashboard" : "Create an account";

  return (
    <section id="how" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-1 text-sm text-gray-600">
            From browsing to going live—four quick steps.
          </p>
        </div>

        <a
          href={ctaHref}
          className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
        >
          {ctaLabel}
        </a>
      </div>

      {/* Steps */}
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Step
          index={1}
          icon={<MousePointerClick className="h-5 w-5" />}
          title="Browse"
          desc="See upcoming events instantly."
        />
        <Step
          index={2}
          icon={<UserPlus className="h-5 w-5" />}
          title="Sign up to Host"
          desc="Create an organizer account to submit your event."
        />
        <Step
          index={3}
          icon={<CalendarCheck className="h-5 w-5" />}
          title="Add Event Details"
          desc="Fill in date, location, poster, and capacity."
        />
        <Step
          index={4}
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Admin Approval"
          desc="Admins review and approve. Approved events go live."
        />
      </ol>
    </section>
  );
}

function Step({
  index,
  icon,
  title,
  desc,
}: {
  index: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="group relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Number badge */}
      <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
        {index}
      </span>

      {/* Icon chip */}
      <div className="inline-flex items-center justify-center rounded-xl bg-indigo-50 p-2 text-indigo-600 ring-1 ring-indigo-100 transition group-hover:bg-indigo-100">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{desc}</p>

      {/* Progress line accent (bottom) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 opacity-0 transition-opacity group-hover:opacity-100" />
    </li>
  );
}
