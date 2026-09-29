"use client";

import { pageview } from "@vercel/analytics";
import { useState } from "react";

export function CopyButton({
  value,
  label,
  trackAs,
}: {
  value: string;
  label: string;
  trackAs?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="action outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          // The address stays on screen and selectable, so a browser that
          // refuses the write needs no separate recovery path.
          return;
        }
        if (trackAs) {
          // Custom events need a paid Vercel plan; a page view on a synthetic
          // path shows up in the free Web Analytics dashboard instead.
          pageview({ path: `/events/${trackAs}` });
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
