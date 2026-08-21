"use client";

import { useEffect } from "react";

export function DealViewTracker({ dealId }: { dealId: string }) {
  useEffect(() => {
    void fetch(`/api/deals/${encodeURIComponent(dealId)}/view`, {
      method: "POST",
      keepalive: true,
    });
  }, [dealId]);

  return null;
}
