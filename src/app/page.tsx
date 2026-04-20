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
  Star,
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
    <>
      <SiteHeader userId={userId} />

      {/* "Next 7 days" section header */}
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Sponsor logos */}
          <div className="flex items-center gap-5">
            <a href="https://www.oceanbluecorp.com/" target="_blank" rel="noreferrer" aria-label="Oceanblue" className="opacity-70 hover:opacity-100 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://oceanbluecorp.com/_next/image?url=%2Flogo.png&w=256&q=75" alt="Oceanblue" className="h-7 w-auto" />
            </a>
            <a href="https://www.inytes.com/" target="_blank" rel="noreferrer" aria-label="Inytes" className="opacity-70 hover:opacity-100 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://cdn.inytes.com/images/brand/inytes-logo.png" alt="Inytes" className="h-7 w-auto" />
            </a>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Happening in the next 7 days
          </h2>

          {/* Browse link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <HeroCarousel items={events7d} loading={loading} />
      <EventsTeaser items={events7d} loading={loading} />
      <AllUpcomingEvents />
      <PartnersSection />

      <div className="bg-gray-50" id="how">
        <main className="mx-auto max-w-7xl px-4 py-16 space-y-20">
          <HowItWorks isAuthed={!!userId} />
          <div id="faq">
            <FAQ />
          </div>
        </main>
      </div>

      <Footer />
    </>
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
        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Home</Link>
          <Link href="/events" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">All Events</Link>
          <Link href="/#how" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">How it works</Link>
          <Link href="/#faq" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">FAQ</Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {userId ? (
            <>
              <Link href="/dashboard" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Dashboard
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-all">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Sign in
              </Link>
              <Link href="/auth/signup" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 hover:shadow-md transition-all">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="border-t bg-white shadow-lg md:hidden">
          <div className="space-y-0.5 px-4 py-3">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">Home</Link>
            <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">All Events</Link>
            <Link href="/#how" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">How it works</Link>
            <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">FAQ</Link>
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
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">Sign up</Link>
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
// Hero Carousel
// ─────────────────────────────────────────────
function HeroCarousel({ items, loading }: { items: EventRow[]; loading: boolean }) {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-y border-gray-100">
      <Carousel slides={items} loading={loading} />
    </section>
  );
}

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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/95 p-2.5 shadow-md hover:bg-white hover:shadow-lg transition-all border border-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          <button
            aria-label="Next"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/95 p-2.5 shadow-md hover:bg-white hover:shadow-lg transition-all border border-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-3">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === selectedIndex ? "w-6 bg-indigo-600" : "w-2 bg-gray-300 hover:bg-gray-400"
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
    /* Outer is a div — prevents nested <a> since View Details button is also a link */
    <div className="group flex min-w-0 flex-[0_0_100%] flex-col overflow-hidden sm:flex-row">
      {/* Poster — clicking the image navigates to the event */}
      <Link
        href={`/events/${e.id}`}
        className="block w-full sm:w-1/2"
        tabIndex={-1}
        aria-hidden
      >
        <div className="h-[50vw] max-h-[480px] min-h-[220px] w-full overflow-hidden bg-gray-100">
          {e.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={e.poster_url}
              alt={e.name}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100" />
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-8 sm:w-1/2 sm:px-10 sm:py-14 lg:px-14">
        {/* Date & Location chips */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(e.event_date || e.event_time) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              <Calendar className="h-3.5 w-3.5" />
              {e.event_date ?? ""}
              {e.event_time ? ` • ${e.event_time.slice(0, 5)}` : ""}
            </span>
          )}
          {e.location && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
              <MapPin className="h-3.5 w-3.5" />
              {e.location}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
          {e.name}
        </h3>

        {e.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-500 sm:text-base">
            {e.description}
          </p>
        )}

        <div className="mt-7 flex items-center gap-3">
          <Button asChild size="default" className="rounded-full px-6 font-semibold shadow hover:shadow-md">
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
      <div className="h-[50vw] max-h-[480px] min-h-[220px] w-full animate-pulse bg-gray-200 sm:w-1/2" />
      <div className="flex w-full flex-col justify-center gap-4 bg-white px-6 py-8 sm:w-1/2 sm:px-10">
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-gray-100" />
        <div className="h-9 w-3/4 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-4 w-full animate-pulse rounded-full bg-gray-100" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-gray-100" />
        <div className="mt-2 h-10 w-36 animate-pulse rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

function EmptySlide() {
  return (
    <div className="flex min-w-0 flex-[0_0_100%] items-center justify-center bg-gray-50 py-20 px-6 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Calendar className="h-8 w-8 text-gray-400" />
        </div>
        <p className="font-semibold text-gray-800 mb-1">No events in the next 7 days</p>
        <p className="text-sm text-gray-500 mb-5">Check out all our upcoming events!</p>
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
        >
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
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
      {/* Section header */}
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" /> This week&apos;s highlights
        </span>
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Featured Events</h2>
        <p className="mt-2 max-w-xl text-base text-gray-500">
          Don&apos;t miss these amazing events happening in the next 7 days
        </p>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      ) : subset.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Calendar className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="mb-1 text-base font-bold text-gray-900">No Featured Events Right Now</h3>
          <p className="mb-6 text-sm text-gray-500">Check out all our upcoming events instead!</p>
          <Link href="/events" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-700 transition-all">
            View All Events
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subset.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
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

  React.useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 350);
    return () => clearTimeout(t);
  }, [q]);

  const pageRef = React.useRef(0);

  const fetchPage = React.useCallback(
    async (reset = false) => {
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
    },
    [q, supabase]
  );

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
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        {/* Section header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">All Upcoming Events</h2>
          <p className="mt-2 max-w-xl text-base text-gray-500 mb-7">
            Discover all the amazing events coming up in your area
          </p>

          {/* Search bar */}
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search events by name, location…"
              className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        <p className="mb-6 text-center text-xs text-gray-400">
          {showLoading ? "Searching…" : `${items.length} event${items.length !== 1 ? "s" : ""} found${q ? ` for "${q}"` : ""}`}
        </p>

        {/* Grid */}
        {showLoading && items.length === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="mb-1 text-base font-bold text-gray-900">No Events Found</h3>
            <p className="mb-5 text-sm text-gray-500">Try adjusting your search or check back later.</p>
            <button
              onClick={() => setQ("")}
              className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-indigo-700 transition-all"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={async () => {
                    setLoadingMore(true);
                    await fetchPage(false);
                    setLoadingMore(false);
                  }}
                  disabled={loadingMore}
                  className="rounded-full px-8 font-semibold"
                >
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
      {/* Poster */}
      <Link href={`/events/${e.id}`} className="block overflow-hidden" tabIndex={-1}>
        {e.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={e.poster_url}
            alt={e.name}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
          {e.name}
        </h3>

        {e.description && (
          <p className="mb-4 flex-1 text-xs leading-relaxed text-gray-500 line-clamp-2">
            {e.description}
          </p>
        )}

        <div className="mb-4 space-y-1.5">
          {(e.event_date || e.event_time) && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <span>{e.event_date ?? ""}{e.event_time ? ` • ${e.event_time.slice(0, 5)}` : ""}</span>
            </div>
          )}
          {e.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-purple-400" />
              <span className="line-clamp-1">{e.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <Link
            href={`/events/${e.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 hover:shadow transition-all"
          >
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
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Trusted Partners</h2>
          <p className="mt-2 text-base text-gray-500 max-w-xl mx-auto">
            We&apos;re grateful to work with these amazing organizations who make our events possible
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
          {SPONSORS.map((s) => (
            <div
              key={s.name}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-100"
            >
              {/* Decorative circles */}
              <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 transition-transform group-hover:scale-125" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 transition-transform group-hover:scale-125" />

              <div className="relative flex flex-col items-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 transition-colors group-hover:bg-indigo-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.logo} alt={`${s.name} logo`} className="h-10 w-auto max-w-[80px] transition-transform group-hover:scale-110" />
                </div>
                <h3 className="mb-0.5 text-base font-bold text-gray-900">{s.name}</h3>
                <p className="mb-2 text-xs font-semibold text-indigo-600">{s.tagline}</p>
                <p className="mb-5 text-xs text-gray-500 line-clamp-2 leading-relaxed">{s.description}</p>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-semibold text-gray-700 transition-all hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
                >
                  Visit Website <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Partnership CTA */}
        <div className="mt-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            <Users className="h-4 w-4" />
            Interested in Partnering?
          </div>
          <h3 className="mb-2 text-xl font-extrabold text-gray-900">Join Our Partner Network</h3>
          <p className="mx-auto mb-6 max-w-sm text-sm text-gray-500">
            Connect with us to explore partnership opportunities and help bring amazing events to life.
          </p>
          <a
            href="mailto:gagankarthik123@gmail.com"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  );
}
