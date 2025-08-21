"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Calendar, MapPin, ChevronLeft, ChevronRight, Search, Sparkles, Users } from "lucide-react";
import HowItWorks from "@/components/how-it-works";
import FAQ from "@/components/faq";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/share-button";

// -----------------------------
// Types
// -----------------------------
type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null; // YYYY-MM-DD
  event_time: string | null; // HH:mm:ss
  location: string | null;
  poster_url: string | null;
};

// -----------------------------
// Page
// -----------------------------
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

      {/* Modern hero header (keep carousel the same as OLD below) */}
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-4">
         <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
           {/* Sponsors (left) */} 
           <div className="flex items-center justify-center gap-6 sm:justify-start">
             <a href="https://www.oceanbluecorp.com/" target="_blank" rel="noreferrer" aria-label="Oceanblue" className="inline-flex" >
              {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src="https://www.oceanbluecorp.com/images/logo.png" alt="Oceanblue" className="h-8 w-auto transition" /> </a> 
               <a href="https://www.inytes.com/" target="_blank" rel="noreferrer" aria-label="Inytes" className="inline-flex" > 
               {/* eslint-disable-next-line @next/next/no-img-element */} <img src="https://cdn.inytes.com/images/brand/inytes-logo.png" alt="Inytes" className="h-8 w-auto transition" />
                </a> </div> {/* Title (center) */} 
                <h1 className="text-center text-xl font-semibold tracking-tight sm:text-2xl"> Happening in the next 7 days </h1>
                 {/* Browse (right) */} 
                 <div className="flex items-center justify-center sm:justify-end">
                   <Link href="/events" className="rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50" > Browse all </Link>
                    </div> 
                    </div> 
                    </div>

      {/* FULL-BLEED CAROUSEL — kept EXACT from OLD version */}
      <HeroCarousel items={events7d} loading={loading} />

      {/* Featured Events (modernized) */}
      <EventsTeaser items={events7d} loading={loading} />

      {/* All Upcoming Events (modernized) */}
      <AllUpcomingEvents />

      {/* Partners (modernized) */}
      <PartnersSection />

      {/* How it works & FAQ */}
      <div className="bg-gray-50">
        <main className="mx-auto max-w-7xl px-4 py-16 space-y-20">
          <HowItWorks isAuthed={!!userId} />
          <FAQ />
        </main>
      </div>

      <Footer />
    </>
  );
}

// -----------------------------
// Header (modernized version)
// -----------------------------
function SiteHeader({ userId }: { userId: string | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="cmh india" className="h-8 w-auto sm:w-48" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden gap-8 md:flex justify-center items-center">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Home</Link>
          <Link href="/events" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">All Events</Link>
          <Link href="/#how" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">How it works</Link>
          <Link href="/#faq" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">FAQ</Link>
        

        {/* Auth Buttons */}
        {userId ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">Dashboard</Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-all">Sign out</button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">Sign in</Link>
            <Link href="/auth/signup" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl">Sign up</Link>
          </div>
        )}
        </nav>

        {/* Mobile menu button */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="space-y-1 px-4 py-4">
            <Link href="/" className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">Home</Link>
            <Link href="/events" className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">All Events</Link>
            <Link href="/#how" className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">How it works</Link>
            <Link href="/#faq" className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100">FAQ</Link>
            {/* Auth Links */}
            <Link href="/auth/login" className="block rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">Sign in</Link>
            <Link href="/auth/signup" className="block rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl">Sign up</Link>

          </div>
        </div>
      )}
    </header>
  );
}

// -----------------------------
// HERO CAROUSEL 
// -----------------------------
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
      className="group flex min-w-0 flex-[0_0_100%] flex-col overflow-hidden sm:flex-row sm:h[70vh]"
      aria-label={`View ${e.name}`}
    >
      {/* Image half */}
      <div className="w-full sm:w-1/2 h-[40vh] sm:h-[70vh]">
        {e.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.poster_url} alt={e.name} className="h-full w-full object-contain" />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>

      {/* Details half */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-8 sm:w-1/2 sm:px-10 sm:py-12">
        <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {e.event_date ?? ""}
            {e.event_time ? ` • ${e.event_time.slice(0, 5)}` : ""}
          </span>
          {e.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {e.location}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-semibold text-gray-900 sm:text-3xl">{e.name}</h3>

        {e.description && (
          <p className="mt-3 line-clamp-3 text-sm text-gray-700">{e.description}</p>
        )}

        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href={`/events/${e.id}`}>View Details</Link>
          </Button>
          <ShareButton path={`/events/${e.id}`} title={e.name} text={e.description ?? ""} />
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
          <a href="/events" className="mt-3 inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Browse all events
          </a>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Featured Events (modernized)
// -----------------------------
function EventsTeaser({ items, loading }: { items: EventRow[]; loading: boolean }) {
  const subset = items.slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Featured Events</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Don't miss these amazing events happening in the next 7 days</p>
      </div>

      {loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-3xl bg-gray-200" />
          ))}
        </div>
      ) : subset.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Events</h3>
          <p className="text-gray-600 mb-6">Check out all our upcoming events instead!</p>
          <Link href="/events" className="inline-flex items-center justify-center rounded-full bg-indigo-600 text-white px-6 py-3 font-semibold hover:bg-indigo-700 transition-all">View All Events</Link>
        </div>
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {subset.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/events" className="inline-flex items-center justify-center rounded-full bg-indigo-600 text-white px-8 py-4 font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">View All Events</Link>
          </div>
        </>
      )}
    </section>
  );
}

// -----------------------------
// All Upcoming Events (modernized)
// -----------------------------
function AllUpcomingEvents() {
  const supabase = React.useMemo(() => createClient(), []);
  const PAGE_SIZE = 12;

  const [q, setQ] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [items, setItems] = React.useState<EventRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);

  // Debounce query input
  React.useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 350);
    return () => clearTimeout(t);
  }, [q]);

  const fetchPage = React.useCallback(
    async (reset = false) => {
      if (reset) {
        setPage(0);
        setHasMore(true);
        setItems([]);
      }
      const currentPage = reset ? 0 : page;
      const from = currentPage * PAGE_SIZE;
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
      if (!reset) setPage((p) => p + 1);
    },
    [PAGE_SIZE, page, q, supabase]
  );

  // Initial load & on q change
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await fetchPage(true);
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchPage]);

  const showLoading = loading || typing;

  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">All Upcoming Events</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">Discover all the amazing events coming up in your area</p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, description, or location..."
              className="w-full rounded-full border-2 border-gray-200 bg-white pl-12 pr-4 py-3 text-sm focus:border-indigo-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Results meta */}
        <div className="mb-8 text-center">
          <p className="text-sm text-gray-500">{showLoading ? "Searching..." : `Found ${items.length} events${q ? ` for "${q}"` : ""}`}</p>
        </div>

        {/* Grid */}
        {showLoading && items.length === 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl bg-gray-200" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or check back later for new events.</p>
            <button onClick={() => setQ("")} className="inline-flex items-center justify-center rounded-full bg-indigo-600 text-white px-6 py-3 font-semibold hover:bg-indigo-700 transition-all">
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-12 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={async () => {
                    setLoadingMore(true);
                    await fetchPage(false);
                    setLoadingMore(false);
                  }}
                  disabled={loadingMore}
                  className="rounded-full"
                >
                  {loadingMore ? "Loading..." : "Load More Events"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// -----------------------------
// Event Card (modernized)
// -----------------------------
function EventCard({ e }: { e: EventRow }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {e.poster_url ? (
          <img src={e.poster_url} alt={e.name} className="h-48 w-full object-cover" />
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-indigo-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">{e.name}</h3>

        {e.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{e.description}</p>}

        <div className="space-y-2 mb-6">
          {(e.event_date || e.event_time) && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>
                {e.event_date ?? ""} {e.event_time ? ` • ${e.event_time.slice(0, 5)}` : ""}
              </span>
            </div>
          )}
          {e.location && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span className="line-clamp-1">{e.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link href={`/events/${e.id}`} className="inline-flex items-center justify-center rounded-full bg-indigo-600 text-white px-6 py-2 text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
            View Event
          </Link>
          <ShareButton path={`/events/${e.id}`} title={e.name} text={e.description ?? undefined} />
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Partners (modernized)
// -----------------------------
function PartnersSection() {
  const SPONSORS = [
    {
      name: "Oceanblue Solutions",
      logo: "https://www.oceanbluecorp.com/images/logo.png",
      href: "https://www.oceanbluecorp.com/",
      tagline: "Sustainability & Technology Solutions",
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
    <section className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Our Trusted Partners</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">We're grateful to work with these amazing organizations who make our events possible</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 max-w-4xl mx-auto">
          {SPONSORS.map((sponsor) => (
            <div key={sponsor.name} className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 rounded-2xl bg-gray-50 p-6 group-hover:bg-gray-100 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="h-12 w-auto max-w-32 transition-transform group-hover:scale-105" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{sponsor.name}</h3>
                <p className="text-sm font-medium text-indigo-600 mb-3">{sponsor.tagline}</p>
                <p className="text-sm text-gray-600 mb-6 line-clamp-2">{sponsor.description}</p>

                <a href={sponsor.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border-2 border-gray-200 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md">
                  Visit Website
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 transition-transform group-hover:scale-110" />
              <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 transition-transform group-hover:scale-110" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 mb-4">
            <Users className="h-4 w-4" />
            Interested in Partnering?
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Join Our Partner Network</h3>
          <p className="text-gray-600 mb-6">Connect with us to explore partnership opportunities and help bring amazing events to life.</p>
          <a href="mailto:gagankarthik123@gmail.com" className="inline-flex items-center justify-center rounded-full bg-indigo-600 text-white px-8 py-3 font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  );
}
