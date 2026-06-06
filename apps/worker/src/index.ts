import { EmailMessage } from "cloudflare:email";
import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  DB: D1Database;
  EMAIL: SendEmail;
  SERPAPI_KEY: string;
  EMAIL_TO: string;
  EMAIL_FROM: string;
  TRACKED_ROUTES?: string;
};

type TrackedRoute = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  currency?: string;
  baselinePrice?: number;
};

type FareSnapshot = {
  route: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string | null;
  price: number;
  currency: string;
  airline: string;
  bookingUrl: string;
  rawProvider: string;
  capturedAt: string;
};

type SerpFlightOption = {
  price?: number;
  airline?: string;
  flights?: Array<{ airline?: string }>;
  booking_token?: string;
};

type SerpApiResponse = {
  best_flights?: SerpFlightOption[];
  other_flights?: SerpFlightOption[];
  search_metadata?: { google_flights_url?: string };
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*", allowMethods: ["GET", "POST", "OPTIONS"] }));

app.get("/health", (c) => c.json({ ok: true, service: "travel-planning-worker" }));

app.get("/api/fare-snapshots", async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT id, route, origin, destination, depart_date AS departDate, return_date AS returnDate,
            price, currency, airline, booking_url AS bookingUrl, captured_at AS capturedAt
       FROM fare_snapshots
      ORDER BY captured_at DESC, id DESC
      LIMIT 100`
  ).all();

  return c.json({ snapshots: rows.results });
});

app.post("/api/refresh", async (c) => {
  const result = await refreshAllRoutes(c.env);
  return c.json(result);
});

async function scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
  ctx.waitUntil(refreshAllRoutes(env, event.scheduledTime));
}

async function refreshAllRoutes(env: Env, scheduledTime = Date.now()) {
  const routes = getTrackedRoutes(env);
  const capturedAt = new Date(scheduledTime).toISOString();
  const snapshots: FareSnapshot[] = [];
  const alerts: Array<{ snapshot: FareSnapshot; averagePrice: number; dropPercent: number }> = [];

  for (const route of routes) {
    const snapshot = await fetchFareSnapshot(env, route, capturedAt);
    const averagePrice = await getSevenDayAverage(env.DB, snapshot.route);
    snapshots.push(snapshot);
    await insertFareSnapshot(env.DB, snapshot);
    if (averagePrice > 0) {
      const dropAmount = averagePrice - snapshot.price;
      const dropPercent = dropAmount / averagePrice;
      if (dropPercent >= 0.1 && dropAmount >= 15) {
        alerts.push({ snapshot, averagePrice, dropPercent });
      }
    } else if (route.baselinePrice && route.baselinePrice - snapshot.price >= 15 && (route.baselinePrice - snapshot.price) / route.baselinePrice >= 0.1) {
      alerts.push({ snapshot, averagePrice: route.baselinePrice, dropPercent: (route.baselinePrice - snapshot.price) / route.baselinePrice });
    }
  }

  if (alerts.length > 0) {
    await sendAlertDigest(env, alerts);
  }

  return { capturedAt, refreshed: snapshots.length, alerts: alerts.length, routes: snapshots.map((snapshot) => snapshot.route) };
}

function getTrackedRoutes(env: Env): TrackedRoute[] {
  if (env.TRACKED_ROUTES) {
    const parsed = JSON.parse(env.TRACKED_ROUTES) as TrackedRoute[];
    return parsed.filter((route) => route.origin && route.destination && route.departDate);
  }

  return [
    { origin: "SFO", destination: "HND", departDate: "2026-09-18", returnDate: "2026-10-02", currency: "USD", baselinePrice: 1000 },
    { origin: "JFK", destination: "LIS", departDate: "2026-08-08", returnDate: "2026-08-19", currency: "USD", baselinePrice: 600 },
    { origin: "ORD", destination: "CDG", departDate: "2026-10-11", returnDate: "2026-10-21", currency: "USD", baselinePrice: 700 }
  ];
}

async function fetchFareSnapshot(env: Env, route: TrackedRoute, capturedAt: string): Promise<FareSnapshot> {
  const params = new URLSearchParams({
    engine: "google_flights",
    departure_id: route.origin,
    arrival_id: route.destination,
    outbound_date: route.departDate,
    currency: route.currency ?? "USD",
    api_key: env.SERPAPI_KEY
  });

  if (route.returnDate) {
    params.set("return_date", route.returnDate);
    params.set("type", "1");
  } else {
    params.set("type", "2");
  }

  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`SerpAPI request failed with status ${response.status}`);
  }

  const data = (await response.json()) as SerpApiResponse;
  const options = [...(data.best_flights ?? []), ...(data.other_flights ?? [])].filter((option) => typeof option.price === "number");
  const cheapest = options.sort((a, b) => Number(a.price) - Number(b.price))[0];

  if (!cheapest?.price) {
    throw new Error(`No priced flights returned for ${route.origin}-${route.destination}`);
  }

  const airline = cheapest.airline ?? cheapest.flights?.find((flight) => flight.airline)?.airline ?? "Multiple airlines";
  const bookingUrl = data.search_metadata?.google_flights_url ?? "https://www.google.com/travel/flights";

  return {
    route: `${route.origin} → ${route.destination}`,
    origin: route.origin,
    destination: route.destination,
    departDate: route.departDate,
    returnDate: route.returnDate ?? null,
    price: cheapest.price,
    currency: route.currency ?? "USD",
    airline,
    bookingUrl,
    rawProvider: JSON.stringify(cheapest),
    capturedAt
  };
}

async function insertFareSnapshot(db: D1Database, snapshot: FareSnapshot) {
  await db.prepare(
    `INSERT INTO fare_snapshots
      (route, origin, destination, depart_date, return_date, price, currency, airline, booking_url, raw_provider, captured_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      snapshot.route,
      snapshot.origin,
      snapshot.destination,
      snapshot.departDate,
      snapshot.returnDate,
      snapshot.price,
      snapshot.currency,
      snapshot.airline,
      snapshot.bookingUrl,
      snapshot.rawProvider,
      snapshot.capturedAt
    )
    .run();
}

async function getSevenDayAverage(db: D1Database, route: string) {
  const result = await db.prepare(
    `SELECT AVG(price) AS averagePrice
       FROM fare_snapshots
      WHERE route = ?
        AND captured_at >= datetime('now', '-7 days')`
  ).bind(route).first<{ averagePrice: number | null }>();

  return result?.averagePrice ?? 0;
}

async function sendAlertDigest(env: Env, alerts: Array<{ snapshot: FareSnapshot; averagePrice: number; dropPercent: number }>) {
  const subject = `Travel fare alert: ${alerts.length} route${alerts.length === 1 ? "" : "s"} dropped`;
  const lines = alerts.map(({ snapshot, averagePrice, dropPercent }) => {
    const percent = Math.round(dropPercent * 1000) / 10;
    return `${snapshot.route}: ${snapshot.currency} ${snapshot.price} on ${snapshot.airline}, ${percent}% below the ${Math.round(averagePrice)} baseline. Book: ${snapshot.bookingUrl}`;
  });
  const body = [`Smart fare alerts are ready:`, "", ...lines, "", "This alert was generated by the Cloudflare Worker cron trigger."].join("\n");
  const message = new EmailMessage(env.EMAIL_FROM, env.EMAIL_TO, `Subject: ${subject}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${body}`);

  await env.EMAIL.send(message);
}

export default {
  fetch: app.fetch,
  scheduled
};
