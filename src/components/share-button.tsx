// src/components/share-button.tsx
"use client";

import * as React from "react";
import { Share2 } from "lucide-react";

type Props = {
  /** Relative path like `/events/123` */
  path: string;
  /** Title to show in native share sheet */
  title: string;
  /** Optional text/description for share sheet */
  text?: string | null;
  className?: string;
};

export default function ShareButton({ path, title, text, className }: Props) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? new URL(path, window.location.origin).toString()
        : path;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: text ?? undefined,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user closed share sheet or permissions denied — no-op
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share event"
      title={copied ? "Copied!" : "Share"}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
      }
    >
      <Share2 className="h-4 w-4" />
      <span>{copied ? "Copied!" : "Share"}</span>
    </button>
  );
}
