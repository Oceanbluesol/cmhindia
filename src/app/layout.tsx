// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.cmhindia.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CMH India — Discover events & RSVP fast",
    template: "%s | CMH India",
  },
  description:
    "Find upcoming community events across India and RSVP instantly. Organizers can create events, upload posters, and go live after quick admin approval.",
  keywords: [
    "events",
    "India events",
    "community meetups",
    "RSVP online",
    "CMH India",
    "conference listings",
  ],
  applicationName: "CMH India",
  authors: [{ name: "CMH India" }],
  creator: "CMH India",
  publisher: "CMH India",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "CMH India",
    title: "CMH India — Discover events",
    description:
      "Find upcoming community events across India and RSVP instantly. Organizers can create events, upload posters, and go live after quick admin approval.",
    images: [
      {
        url: `${siteUrl}/og/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "CMH India — Discover events & RSVP fast",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@gagankarthik_mullapudi",
    creator: "@gagankarthik_mullapudi",
    title: "CMH India — Discover events",
    description:
      "Find upcoming community events and Check out the latest happenings.",
    images: [`${siteUrl}/og/og-default.jpg`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest", // Make sure this file exists in /public
  category: "Events",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Optional: Uncomment if you add a verification code
  // verification: {
  //   google: "GOOGLE_SITE_VERIFICATION_CODE",
  // },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff", // moved from metadata here
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CMH India",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/events?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "CMH India",
      url: siteUrl,
      logo: `${siteUrl}/logo.svg`,
    },
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
        <Analytics />
        <Script id="cmh-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(jsonLd)}
        </Script>
      </body>
    </html>
  );
}
