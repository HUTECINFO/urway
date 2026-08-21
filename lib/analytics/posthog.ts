export type AnalyticsProperties = Record<string, string | number | boolean | null>;

export function captureServerEvent(
  event: string,
  properties: AnalyticsProperties,
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  void fetch(`${process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      event,
      properties,
    }),
  });
}
