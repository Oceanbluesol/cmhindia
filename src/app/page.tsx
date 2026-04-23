"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";
import HowItWorks from "@/components/how-it-works";
import FAQ from "@/components/faq";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/share-button";

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  poster_url: string | null;
};

export default function LandingPage() {
  const supabase = React.useMemo(() => createClient(), []);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [events7d, setEvents7d] = React.useState<EventRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const today = new Date();
      const start = today.toISOString().slice(0, 10);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);
      const end = endDate.toISOString().slice(0, 10);
      const { data } = await supabase
        .from("events")
        .select("id,name,description,event_date,event_time,location,poster_url")
        .eq("status", "approved")
        .gte("event_date", start)
        .lt("event_date", end)
        .order("is_featured", { ascending: false })
        .order("event_date", { ascending: true })
        .limit(48);
      setEvents7d((data as EventRow[]) ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  return (
    /* overflow-x-hidden here kills the horizontal scroll from full-width sections */
    <div className="overflow-x-hidden">
      <SiteHeader userId={userId} />

      {/* ── Next 7 Days + Carousel ── */}
      <section className="w-full">
        {/* Section bar */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 pt-10 pb-4">
          <div className="flex items-center gap-4">
            <a href="https://www.oceanbluecorp.com/" target="_blank" rel="noreferrer" aria-label="Oceanblue" className="opacity-60 hover:opacity-100 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://oceanbluecorp.com/_next/image?url=%2Flogo.png&w=256&q=75" alt="Oceanblue" className="h-6 w-auto sm:h-7" />
            </a>
            <a href="https://www.inytes.com/" target="_blank" rel="noreferrer" aria-label="Inytes" className="opacity-60 hover:opacity-100 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://cdn.inytes.com/images/brand/inytes-logo.png" alt="Inytes" className="h-6 w-auto sm:h-7" />
            </a>
          </div>
          <h2 className="text-base font-bold text-gray-900 sm:text-xl">Happening in the next 7 days</h2>
          <Link href="/events" className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-all sm:px-4 sm:text-sm">
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Carousel — no breakout, just full-width inside overflow-x-hidden parent */}
        <div className="w-full border-y border-gray-100">
          <Carousel slides={events7d} loading={loading} />
        </div>
      </section>

      <EventsTeaser items={events7d} loading={loading} />
      <AllUpcomingEvents />
      <PartnersSection />

      <div className="bg-gray-50" id="how">
        <main className="mx-auto max-w-7xl px-4 py-16 space-y-20">
          <HowItWorks isAuthed={!!userId} />
          <div id="faq"><FAQ /></div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────
// Site Header
// ─────────────────────────────────────────────
function SiteHeader({ userId }: { userId: string | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="CMH India" className="h-8 w-auto sm:w-48" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Home</Link>
          <Link href="/events" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">All Events</Link>
          <Link href="/#how" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">How it works</Link>
          <Link href="/#faq" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">FAQ</Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {userId ? (
            <>
              <Link href="/dashboard" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">Dashboard</Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-all">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">Sign in</Link>
              <Link href="/auth/signup" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-all">Sign up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden" aria-label="Toggle menu">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="border-t bg-white shadow-lg md:hidden">
          <div className="space-y-0.5 px-4 py-3">
            {[
              { href: "/", label: "Home" },
              { href: "/events", label: "All Events" },
              { href: "/#how", label: "How it works" },
              { href: "/#faq", label: "FAQ" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">{label}</Link>
            ))}
            <div className="mt-1 border-t pt-2 space-y-0.5">
              {userId ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">Dashboard</Link>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">Sign out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">Sign in</Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">Sign up →</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────
// Carousel
// ─────────────────────────────────────────────
function Carousel({ slides, loading }: { slides: EventRow[]; loading: boolean }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: slides.length > 1, align: "start" },
    [Autoplay({ delay: 4500, stopOnInteraction: false })]
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
    <div className="relative bg-white">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {loading && <div className="min-w-0 flex-[0_0_100%]"><SkeletonSlide /></div>}
          {!loading && slides.length === 0 && <div className="min-w-0 flex-[0_0_100%]"><EmptySlide /></div>}
          {!loading && slides.map((e) => <Slide key={e.id} event={e} />)}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button aria-label="Previous" onClick={() => emblaApi?.scrollPrev()} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/95 p-2 shadow-md hover:bg-white border border-gray-100 transition-all sm:left-4 sm:p-2.5">
            <ChevronLeft className="h-4 w-4 text-gray-700 sm:h-5 sm:w-5" />
          </button>
          <button aria-label="Next" onClick={() => emblaApi?.scrollNext()} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/95 p-2 shadow-md hover:bg-white border border-gray-100 transition-all sm:right-4 sm:p-2.5">
            <ChevronRight className="h-4 w-4 text-gray-700 sm:h-5 sm:w-5" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2.5">
          {slides.map((_, i) => (
            <button key={i} aria-label={`Go to slide ${i + 1}`} onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? "w-5 bg-indigo-600" : "w-1.5 bg-gray-300 hover:bg-gray-400"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Slide({ event: e }: { event: EventRow }) {
  return (
    <div className="group flex min-w-0 flex-[0_0_100%] flex-col sm:flex-row">
      <Link href={`/events/${e.id}`} className="block w-full sm:w-1/2" tabIndex={-1} aria-hidden>
        <div className="h-[55vw] max-h-[420px] min-h-[200px] w-full overflow-hidden bg-gray-100">
          {e.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.poster_url} alt={e.name} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100" />
          )}
        </div>
      </Link>

      <div className="flex w-full flex-col justify-center bg-white px-5 py-6 sm:w-1/2 sm:px-8 sm:py-10 lg:px-12">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(e.event_date || e.event_time) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              <Calendar className="h-3 w-3" />
              {e.event_date ?? ""}{e.event_time ? ` · ${e.event_time.slice(0, 5)}` : ""}
            </span>
          )}
          {e.location && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1 max-w-[160px]">{e.location}</span>
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold leading-tight text-gray-900 line-clamp-2 sm:text-2xl lg:text-3xl">
          {e.name}
        </h3>

        {e.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500 sm:mt-3 sm:line-clamp-3 sm:text-base">
            {e.description}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Button asChild size="sm" className="rounded-full px-5 font-semibold shadow sm:px-6">
            <Link href={`/events/${e.id}`}>View Details</Link>
          </Button>
          <ShareButton path={`/events/${e.id}`} title={e.name} text={e.description ?? ""} />
        </div>
      </div>
    </div>
  );
}

function SkeletonSlide() {
  return (
    <div className="flex min-w-0 flex-[0_0_100%] flex-col sm:flex-row">
      <div className="h-[55vw] max-h-[420px] min-h-[200px] w-full animate-pulse bg-gray-200 sm:w-1/2" />
      <div className="flex w-full flex-col justify-center gap-3 bg-white px-5 py-6 sm:w-1/2 sm:px-8">
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-gray-100" />
        <div className="h-7 w-3/4 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-3.5 w-full animate-pulse rounded-full bg-gray-100" />
        <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-gray-100" />
        <div className="mt-2 h-9 w-32 animate-pulse rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

function EmptySlide() {
  return (
    <div className="flex min-w-0 flex-[0_0_100%] items-center justify-center bg-gray-50 py-16 px-6 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <Calendar className="h-7 w-7 text-gray-400" />
        </div>
        <p className="font-semibold text-gray-800">No events in the next 7 days</p>
        <p className="mt-1 text-sm text-gray-500 mb-5">Check out all upcoming events!</p>
        <Link href="/events" className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
          Browse all events <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Events Teaser
// ─────────────────────────────────────────────
function EventsTeaser({ items, loading }: { items: EventRow[]; loading: boolean }) {
  const subset = items.slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 sm:text-sm">
          <Sparkles className="h-3.5 w-3.5" /> This week&apos;s highlights
        </span>
        <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">Featured Events</h2>
        <p className="mt-2 max-w-lg text-sm text-gray-500 sm:text-base">
          Don&apos;t miss these amazing events happening in the next 7 days
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      ) : subset.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <Calendar className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h3 className="mb-1 text-base font-bold text-gray-900">No Featured Events Right Now</h3>
          <p className="mb-5 text-sm text-gray-500">Check out all upcoming events instead!</p>
          <Link href="/events" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-700 transition-all">
            View All Events
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subset.map((e) => <EventCard key={e.id} e={e} />)}
          </div>
          <div className="mt-8 text-center">
            <Link href="/events" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
              View All Events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// All Upcoming Events
// ─────────────────────────────────────────────
function AllUpcomingEvents() {
  const supabase = React.useMemo(() => createClient(), []);
  const PAGE_SIZE = 12;

  const [q, setQ] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [items, setItems] = React.useState<EventRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const pageRef = React.useRef(0);

  React.useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 350);
    return () => clearTimeout(t);
  }, [q]);

  const fetchPage = React.useCallback(async (reset = false) => {
    if (reset) pageRef.current = 0;
    const from = pageRef.current * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const today = new Date().toISOString().slice(0, 10);
    const like = q ? `%${q}%` : "";
    const base = supabase
      .from("events")
      .select("id,name,description,event_date,event_time,location,poster_url")
      .eq("status", "approved")
      .gte("event_date", today);
    const finalQuery = q
      ? base.or(`name.ilike.${like},description.ilike.${like},location.ilike.${like}`)
      : base;
    const { data } = await finalQuery.order("event_date", { ascending: true }).range(from, to);
    const newItems = (data as EventRow[]) ?? [];
    setItems((prev) => (reset ? newItems : [...prev, ...newItems]));
    setHasMore(newItems.length === PAGE_SIZE);
    pageRef.current += 1;
  }, [q, supabase]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetchPage(true);
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [fetchPage]);

  const showLoading = loading || typing;

  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">All Upcoming Events</h2>
          <p className="mt-2 max-w-lg text-sm text-gray-500 sm:text-base">
            Discover all the amazing events coming up in your area
          </p>
          <div className="relative mt-6 w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, location…"
              className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Clear search">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <p className="mb-5 text-center text-xs text-gray-400">
          {showLoading ? "Searching…" : `${items.length} event${items.length !== 1 ? "s" : ""} found${q ? ` for "${q}"` : ""}`}
        </p>

        {showLoading && items.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <h3 className="mb-1 text-base font-bold text-gray-900">No Events Found</h3>
            <p className="mb-5 text-sm text-gray-500">Try adjusting your search or check back later.</p>
            <button onClick={() => setQ("")} className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-700 transition-all">
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((e) => <EventCard key={e.id} e={e} />)}
            </div>
            {hasMore && (
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg" onClick={async () => { setLoadingMore(true); await fetchPage(false); setLoadingMore(false); }} disabled={loadingMore} className="rounded-full px-8 font-semibold">
                  {loadingMore ? "Loading…" : "Load More Events"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Event Card
// ─────────────────────────────────────────────
function EventCard({ e }: { e: EventRow }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-100">
      <Link href={`/events/${e.id}`} className="block overflow-hidden" tabIndex={-1}>
        {e.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.poster_url} alt={e.name} className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-48" />
        ) : (
          <div className="h-44 w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 sm:h-48" />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="mb-1.5 text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
          {e.name}
        </h3>

        {e.description && (
          <p className="mb-3 flex-1 text-xs leading-relaxed text-gray-500 line-clamp-2">
            {e.description}
          </p>
        )}

        <div className="mb-3 space-y-1">
          {(e.event_date || e.event_time) && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <span>{e.event_date ?? ""}{e.event_time ? ` · ${e.event_time.slice(0, 5)}` : ""}</span>
            </div>
          )}
          {e.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-purple-400" />
              <span className="line-clamp-1">{e.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <Link href={`/events/${e.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all">
            View Event <ArrowRight className="h-3 w-3" />
          </Link>
          <ShareButton path={`/events/${e.id}`} title={e.name} text={e.description ?? undefined} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Partners
// ─────────────────────────────────────────────
function PartnersSection() {
  const SPONSORS = [
    {
      name: "Oceanblue Solutions",
      logo: "https://oceanbluecorp.com/_next/image?url=%2Flogo.png&w=256&q=75",
      href: "https://www.oceanbluecorp.com/",
      tagline: "Sustainability & Technology",
      description: "Leading provider of sustainable technology solutions for modern businesses.",
    },
    {
      name: "Inytes",
      logo: "https://cdn.inytes.com/images/brand/inytes-logo.png",
      href: "https://www.inytes.com/",
      tagline: "Invitation & Event Management",
      description: "Professional event management and invitation platform for seamless experiences.",
    },
  ];

  return (
    <section className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Our Trusted Partners</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto sm:text-base">
            Organizations who make our events possible
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {SPONSORS.map((s) => (
            <div key={s.name} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-100 sm:p-8">
              <div className="pointer-events-none absolute -top-5 -right-5 h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 transition-transform group-hover:scale-125" />
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 transition-colors group-hover:bg-indigo-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.logo} alt={`${s.name} logo`} className="h-9 w-auto max-w-[72px] transition-transform group-hover:scale-110" />
                </div>
                <h3 className="mb-0.5 text-base font-bold text-gray-900">{s.name}</h3>
                <p className="mb-2 text-xs font-semibold text-indigo-600">{s.tagline}</p>
                <p className="mb-4 text-xs text-gray-500 line-clamp-2 leading-relaxed">{s.description}</p>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md">
                  Visit Website <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-center sm:p-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            <Users className="h-4 w-4" /> Interested in Partnering?
          </div>
          <h3 className="mb-2 text-lg font-extrabold text-gray-900 sm:text-xl">Join Our Partner Network</h3>
          <p className="mx-auto mb-5 max-w-sm text-sm text-gray-500">
            Connect with us to explore partnership opportunities.
          </p>
          <a href="mailto:gagankarthik123@gmail.com" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  );
}
