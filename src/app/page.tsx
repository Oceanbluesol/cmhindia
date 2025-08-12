"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import HowItWorks from "@/components/how-it-works";
import FAQ from "@/components/faq";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null; // YYYY-MM-DD
  event_time: string | null; // HH:mm:ss
  location: string | null;
  poster_url: string | null;
};

export default function LandingPage() {
  const supabase = React.useMemo(() => createClient(), []);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [events7d, setEvents7d] = React.useState<EventRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Header auth state
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

  // Fetch approved events in the next 7 days (client-side)
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const today = new Date();
      const start = today.toISOString().slice(0, 10);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);
      const end = endDate.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("events")
        .select("id,name,description,event_date,event_time,location,poster_url")
        .eq("status", "approved")
        .gte("event_date", start)
        .lt("event_date", end)
        .order("is_featured", { ascending: false })
        .order("event_date", { ascending: true })
        .limit(48);

      if (!error) setEvents7d((data as EventRow[]) ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  return (
    <>
      <SiteHeader userId={userId} />

      {/* Section label above the hero */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-4 overflow-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Happening in the next 7 days
          </h1>
          <Link
            href="/events"
            className="rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Browse all
          </Link>
        </div>
      </div>

      {/* Full-bleed hero carousel (no background color) */}
      <HeroCarousel items={events7d} loading={loading} />

      {/* Teaser: show up to 5 cards + View more */}
      <EventsTeaser items={events7d} loading={loading} />

      {/* NEW: Partners/Sponsors */}
      <PartnersSection />

      {/* How it works & FAQ */}
      <main className="mx-auto max-w-6xl px-4 pb-12 space-y-14">
        <HowItWorks isAuthed={!!userId} />
        <FAQ />
      </main>

      <Footer />
    </>
  );
}

/* =========================
   Header (simple)
   ========================= */
function SiteHeader({ userId }: { userId: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="EventHub logo" className="h-8 w-48" />
        </a>

        <nav className="hidden gap-6 md:flex">
          <a href="/" className="text-sm text-gray-700 hover:text-indigo-600">Home</a>
          <a href="/events" className="text-sm text-gray-700 hover:text-indigo-600">All Events</a>
          <a href="/#how" className="text-sm text-gray-700 hover:text-indigo-600">How it works</a>
          <a href="/#faq" className="text-sm text-gray-700 hover:text-indigo-600">FAQ</a>
        </nav>

        {userId ? (
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </a>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <a
              href="/auth/login"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign in
            </a>
            <a
              href="/auth/signup"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Sign up
            </a>
          </div>
        )}
      </div>
    </header>
  );
}

/* =======================================================
   Full-bleed hero carousel (Embla + autoplay) — no bg
   ======================================================= */
function HeroCarousel({ items, loading }: { items: EventRow[]; loading: boolean }) {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
      <Carousel slides={items} loading={loading} />
    </section>
  );
}

function Carousel({ slides, loading }: { slides: EventRow[]; loading: boolean }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: slides.length > 1, align: "start" },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {loading && (
            <div className="min-w-0 flex-[0_0_100%]">
              <SkeletonSlide />
            </div>
          )}

          {!loading && slides.length === 0 && (
            <div className="min-w-0 flex-[0_0_100%]">
              <EmptySlide />
            </div>
          )}

          {!loading && slides.map((e) => <Slide key={e.id} event={e} />)}
        </div>
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === selectedIndex ? "bg-gray-900" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Slide({ event: e }: { event: EventRow }) {
  return (
    <a
      href={`/events/${e.id}`}
      className="group relative min-w-0 flex-[0_0_100%]"
      aria-label={`View ${e.name}`}
    >
      {/* Poster */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {e.poster_url ? (
        <img
          src={e.poster_url}
          alt={e.name}
          className="h-[60vh] w-full object-cover sm:h-[70vh]"
        />
      ) : (
        <div className="h-[60vh] w-full bg-gray-200 sm:h-[70vh]" />
      )}

      {/* Gradient only over the image for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Details on image */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-white">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
            {e.event_date ?? ""}
            {e.event_time ? ` • ${e.event_time.slice(0, 5)}` : ""}
          </span>
          {e.location && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
              <MapPin className="h-3.5 w-3.5" />
              {e.location}
            </span>
          )}
        </div>

        <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{e.name}</h3>

        {e.description ? (
          <p className="mt-2 line-clamp-2 max-w-3xl text-sm text-white/90">
            {e.description}
          </p>
        ) : null}

        <div className="mt-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-black shadow">
            <Calendar className="h-3.5 w-3.5" />
            {e.event_date ?? ""} {e.event_time ? `• ${e.event_time.slice(0, 5)}` : ""}
          </span>
          <Button className="ml-3" variant="secondary" size="sm">
            View
          </Button>
        </div>
      </div>
    </a>
  );
}

function SkeletonSlide() {
  return (
    <div className="relative min-w-0 flex-[0_0_100%]">
      <div className="h-[60vh] w-full animate-pulse bg-gray-200 sm:h-[70vh]" />
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-white">
        <div className="h-6 w-3/4 animate-pulse rounded bg-white/40" />
        <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-white/30" />
      </div>
    </div>
  );
}

function EmptySlide() {
  return (
    <div className="relative min-w-0 flex-[0_0_100%]">
      <div className="h-[60vh] w-full bg-gray-100 sm:h-[70vh]" />
      <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-gray-700">
        <div>
          <p className="text-sm">No events in the next 7 days.</p>
          <a
            href="/events"
            className="mt-3 inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Browse all events
          </a>
        </div>
      </div>
    </div>
  );
}

/* =====================================
   Teaser grid: show up to 5 event cards
   ===================================== */
function EventsTeaser({ items, loading }: { items: EventRow[]; loading: boolean }) {
  const subset = items.slice(0, 5);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Next 7 days</h2>
        <Link href="/events" className="text-sm text-indigo-600 hover:underline">
          View more
        </Link>
      </div>

      {loading ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </ul>
      ) : subset.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-gray-600">No events found in this window.</p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subset.map((e) => (
            <li
              key={e.id}
              className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {e.poster_url ? (
                <img
                  src={e.poster_url}
                  alt={e.name}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-40 w-full bg-gray-100" />
              )}
              <div className="space-y-2 p-4">
                <h3 className="line-clamp-1 text-base font-semibold">{e.name}</h3>
                {e.description ? (
                  <p className="line-clamp-2 text-sm text-gray-600">{e.description}</p>
                ) : null}
                <p className="text-sm text-gray-700">
                  {e.event_date ?? ""} {e.event_time ? `• ${e.event_time.slice(0, 5)}` : ""}
                </p>
                {e.location ? (
                  <p className="text-sm text-gray-500">{e.location}</p>
                ) : null}
                <div className="pt-1">
                  <a
                    href={`/events/${e.id}`}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    View
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ===========================
   NEW: Our Partners section
   =========================== */
function PartnersSection() {
  // Swap these with your real sponsors
  const SPONSORS = [
    {
      name: "Oceanblue Solutions",
      logo: "https://oceanbluecorp.com/images/logo.png",
      href: "https://oceanbluecorp.com/",
      tagline: "Sustainability & tech",
    },
    {
      name: "Inytes",
      logo: "https://cdn.inytes.com/images/brand/inytes-logo.png",
      href: "https://www.inytes.com/",
      tagline: "Invitation & events",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Our Partners</h2>
        <p className="text-xs text-gray-500">We’re grateful for their support.</p>
      </div>

      <ul className=" grid gap-6 sm:grid-cols-2">
        {SPONSORS.map((s) => (
          <li
            key={s.name}
            className="group flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.logo}
              alt={`${s.name} logo`}
              className="h-10 w-auto flex-none transition group-hover:grayscale-0"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{s.name}</p>
              {s.tagline ? (
                <p className="truncate text-sm text-gray-600">{s.tagline}</p>
              ) : null}
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline"
              >
                Visit website
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
