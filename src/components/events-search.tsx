"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function EventsSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = React.useState(initialQuery);

  // keep local state in sync if user navigates back/forward
  React.useEffect(() => {
    setValue(sp.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  // debounce push
  React.useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(sp.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      router.push(`/events?${params.toString()}`);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search by name, description, or location"
          className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm outline-none transition focus:border-indigo-500"
        />
        {value ? (
          <button
            aria-label="Clear search"
            onClick={() => setValue("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
