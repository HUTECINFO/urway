import "server-only";

import { DEMO_DEALS } from "@/lib/demo/deals";
import type { Deal } from "@/lib/domain/types";

export interface TrackedClick {
  dealId: string;
  sessionId: string;
  source: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  clickedAt: string;
}

export interface TrackedView {
  dealId: string;
  viewedAt: string;
}

interface DemoStore {
  deals: Map<string, Deal>;
  clicks: TrackedClick[];
  views: TrackedView[];
  subscribers: Map<string, { email: string; source: string; createdAt: string }>;
}

const globalStore = globalThis as typeof globalThis & { __urwayDemoStore?: DemoStore };

export function getDemoStore(): DemoStore {
  if (!globalStore.__urwayDemoStore) {
    const publishedDeals = DEMO_DEALS.filter((deal) => deal.status === "PUBLISHED");
    const views = publishedDeals.flatMap((deal, dealIndex) =>
      Array.from({ length: 34 + dealIndex * 9 }, (_, index) => ({
        dealId: deal.id,
        viewedAt: new Date(Date.UTC(2026, 7, 19, 12, index % 60)).toISOString(),
      })),
    );
    const clicks = publishedDeals.flatMap((deal, dealIndex) =>
      Array.from({ length: 6 + dealIndex * 2 }, (_, index) => ({
        dealId: deal.id,
        sessionId: `demo-${dealIndex}-${index}`,
        source: index % 2 === 0 ? "home" : "detail",
        referrer: null,
        utmSource: index % 3 === 0 ? "newsletter" : null,
        utmMedium: index % 3 === 0 ? "email" : null,
        utmCampaign: index % 3 === 0 ? "drops-semana" : null,
        clickedAt: new Date(Date.UTC(2026, 7, 19, 13, index % 60)).toISOString(),
      })),
    );
    globalStore.__urwayDemoStore = {
      deals: new Map(DEMO_DEALS.map((deal) => [deal.id, structuredClone(deal)])),
      clicks,
      views,
      subscribers: new Map(),
    };
  }
  return globalStore.__urwayDemoStore;
}
