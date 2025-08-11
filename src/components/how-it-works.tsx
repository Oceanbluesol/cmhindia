"use client";

import { CalendarCheck, UserPlus, ShieldCheck, MousePointerClick } from "lucide-react";

export default function HowItWorks({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section id="how" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">How it works</h2>
        <a
          href={isAuthed ? "/dashboard" : "/auth/signup"}
          className="text-sm text-indigo-600 hover:underline"
        >
          {isAuthed ? "Open Dashboard" : "Create an account"}
        </a>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Step
          icon={<MousePointerClick className="h-5 w-5" />}
          title="Browse & RSVP"
          desc="See upcoming events and RSVP instantly—no account required."
        />
        <Step
          icon={<UserPlus className="h-5 w-5" />}
          title="Sign up to Host"
          desc="Create an organizer account to submit your event."
        />
        <Step
          icon={<CalendarCheck className="h-5 w-5" />}
          title="Add Event Details"
          desc="Fill in date, location, poster, and capacity."
        />
        <Step
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Admin Approval"
          desc="Admins review and approve. Approved events go live."
        />
      </ol>
    </section>
  );
}

function Step({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-indigo-600">{icon}<span className="font-medium">{title}</span></div>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </li>
  );
}
