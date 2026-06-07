"use client";

import { useEffect, useMemo, useState } from "react";
import { PriceChart } from "../components/PriceChart";
import {
  DEFAULT_WORKER_URL,
  fallbackAlerts,
  fallbackFareSnapshots,
  fallbackTravelIdeas,
  type Alert,
  type FareSnapshot,
  type PriceTrendPoint,
  type PriceTrendSeries
} from "../lib/data";

const severityClass = {
  deal: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  urgent: "bg-rose-100 text-rose-800 ring-rose-200",
  watch: "bg-amber-100 text-amber-800 ring-amber-200"
};

const chartColors = ["#0f766e", "#2563eb", "#f97316", "#7c3aed", "#be123c", "#0891b2"];
const workerUrl = (process.env.NEXT_PUBLIC_WORKER_URL ?? DEFAULT_WORKER_URL).replace(/\/+$/, "");
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "America/New_York"
});
const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
  timeZoneName: "short"
});

type DashboardState = {
  snapshots: FareSnapshot[];
  source: "worker" | "fallback";
  isLoading: boolean;
  error?: string;
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardState>({
    snapshots: fallbackFareSnapshots,
    source: "fallback",
    isLoading: true
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadSnapshots() {
      try {
        const response = await fetch(`${workerUrl}/api/fare-snapshots`, {
          cache: "no-store",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Worker responded with ${response.status}`);
        }

        const snapshots = readSnapshots(await response.json());
        if (snapshots.length === 0) {
          throw new Error("Worker returned no fare snapshots");
        }

        setDashboard({ snapshots, source: "worker", isLoading: false });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setDashboard({
          snapshots: fallbackFareSnapshots,
          source: "fallback",
          isLoading: false,
          error: error instanceof Error ? error.message : "Unable to load worker snapshots"
        });
      }
    }

    void loadSnapshots();

    return () => controller.abort();
  }, []);

  const currentSnapshots = useMemo(() => getLatestBatch(dashboard.snapshots), [dashboard.snapshots]);
  const { priceTrend, series } = useMemo(() => buildPriceTrend(dashboard.snapshots, currentSnapshots), [dashboard.snapshots, currentSnapshots]);
  const alerts = useMemo(
    () => (dashboard.source === "worker" ? buildAlerts(dashboard.snapshots, currentSnapshots) : fallbackAlerts),
    [dashboard.snapshots, currentSnapshots, dashboard.source]
  );

  const bestFare = currentSnapshots.length     ? currentSnapshots.reduce((best, fare) => (fare.price < best.price ? fare : best), currentSnapshots[0])     : null;
  const averageFare = Math.round(currentSnapshots.reduce((sum, fare) => sum + fare.price, 0) / currentSnapshots.length);
  const latestCapturedAt = currentSnapshots[0]?.capturedAt;
  const dataSourceLabel = dashboard.source === "worker" ? "Worker data" : "Fallback data";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-cyan-100 ring-1 ring-white/20">Travel Planning Command Center</p>
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/20">
                {dashboard.isLoading ? "Connecting to worker" : dataSourceLabel}
              </span>
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">Track flight prices and turn travel ideas into data-backed booking decisions.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">The dashboard fetches fare snapshots from the deployed worker and groups the latest cron batch by route.</p>
            {latestCapturedAt ? <p className="mt-3 text-sm text-slate-400">Latest snapshot batch: {formatTimestamp(latestCapturedAt)}</p> : null}
            {dashboard.error ? <p className="mt-2 text-sm text-amber-200">Using fallback data: {dashboard.error}</p> : null}
          </div>
          <div className="grid gap-3 rounded-3xl bg-white/10 p-5 ring-1 ring-white/15">
            <span className="text-sm uppercase tracking-[0.25em] text-cyan-100">Best fare today</span>
            <strong className="text-5xl">{bestFare ? `$${bestFare.price}` : "N/A"}</strong>
            <span className="text-slate-300">
              {bestFare ? `${bestFare.route} with ${bestFare.airline}` : "No fare data available"}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Tracked routes", currentSnapshots.length.toString()],
          ["Average fare", `$${averageFare}`],
          ["Active alerts", alerts.length.toString()],
          ["Ideas captured", fallbackTravelIdeas.length.toString()]
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl bg-white/80 p-5 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
        <PriceChart priceTrend={priceTrend} series={series} />
        <div className="rounded-3xl bg-white/85 p-5 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-950">Smart alerts</h2>
          <div className="mt-4 space-y-3">
            {alerts.map((alert) => (
              <article key={`${alert.route}-${alert.severity}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-900">{alert.route}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${severityClass[alert.severity]}`}>{alert.severity}</span>
                </div>
                <p className="text-sm leading-6 text-slate-600">{alert.message}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.58fr_0.42fr]">
        <div className="rounded-3xl bg-white/85 p-5 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-950">Tracked flights</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Route</th>
                  <th className="px-4 py-3 font-semibold">Dates</th>
                  <th className="px-4 py-3 font-semibold">Airline</th>
                  <th className="px-4 py-3 font-semibold">Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {currentSnapshots.map((fare) => (
                  <tr key={fare.id}>
                    <td className="px-4 py-3 font-semibold text-slate-950">{fare.route}</td>
                    <td className="px-4 py-3 text-slate-600">{formatTravelDates(fare)}</td>
                    <td className="px-4 py-3 text-slate-600">{fare.airline}</td>
                    <td className="px-4 py-3 font-bold text-ocean">${fare.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl bg-white/85 p-5 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-950">Travel ideas</h2>
          <div className="mt-4 space-y-3">
            {fallbackTravelIdeas.map((idea) => (
              <article key={idea.destination} className="rounded-2xl bg-skyglass p-4 ring-1 ring-cyan-100">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-950">{idea.destination}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{idea.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {idea.window} - Budget ${idea.budget}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{idea.notes}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function readSnapshots(data: unknown): FareSnapshot[] {
  if (!isObject(data) || !Array.isArray(data.snapshots)) {
    return [];
  }

  return data.snapshots.filter(isFareSnapshot);
}

function isFareSnapshot(value: unknown): value is FareSnapshot {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.route === "string" &&
    typeof value.origin === "string" &&
    typeof value.destination === "string" &&
    typeof value.departDate === "string" &&
    (typeof value.returnDate === "string" || value.returnDate === null) &&
    typeof value.price === "number" &&
    typeof value.currency === "string" &&
    typeof value.airline === "string" &&
    typeof value.bookingUrl === "string" &&
    typeof value.capturedAt === "string"
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getLatestBatch(snapshots: FareSnapshot[]) {
  const sorted = [...snapshots].sort(compareNewestFirst);
  const latestCapturedAt = sorted[0]?.capturedAt;

  if (!latestCapturedAt) {
    return [];
  }

  return sorted.filter((snapshot) => snapshot.capturedAt === latestCapturedAt).sort((a, b) => a.route.localeCompare(b.route));
}

function buildPriceTrend(snapshots: FareSnapshot[], currentSnapshots: FareSnapshot[]) {
  const activeRoutes = currentSnapshots.map((snapshot) => snapshot.route);
  const activeRouteSet = new Set(activeRoutes);
  const routeKeys = new Map(activeRoutes.map((route, index) => [route, `route${index}`]));
  const latestByDayAndRoute = new Map<string, FareSnapshot>();

  snapshots.forEach((snapshot) => {
    if (!activeRouteSet.has(snapshot.route)) {
      return;
    }

    const day = snapshot.capturedAt.slice(0, 10);
    const key = `${day}|${snapshot.route}`;
    const existing = latestByDayAndRoute.get(key);

    if (!existing || compareNewestFirst(snapshot, existing) < 0) {
      latestByDayAndRoute.set(key, snapshot);
    }
  });

  const days = Array.from(new Set(Array.from(latestByDayAndRoute.values()).map((snapshot) => snapshot.capturedAt.slice(0, 10))))
    .sort()
    .slice(-7);

  const priceTrend: PriceTrendPoint[] = days.map((day) => {
    const point: PriceTrendPoint = { date: formatChartDate(day) };

    activeRoutes.forEach((route) => {
      const snapshot = latestByDayAndRoute.get(`${day}|${route}`);
      const routeKey = routeKeys.get(route);

      if (snapshot && routeKey) {
        point[routeKey] = snapshot.price;
      }
    });

    return point;
  });

  const series: PriceTrendSeries[] = activeRoutes.map((route, index) => ({
    key: routeKeys.get(route) ?? `route${index}`,
    route,
    color: chartColors[index % chartColors.length]
  }));

  return { priceTrend, series };
}

function buildAlerts(snapshots: FareSnapshot[], currentSnapshots: FareSnapshot[]): Alert[] {
  return currentSnapshots.map((current) => {
    const previousPrices = snapshots
      .filter((snapshot) => snapshot.route === current.route && snapshot.id !== current.id)
      .sort(compareNewestFirst)
      .slice(0, 6)
      .map((snapshot) => snapshot.price);

    if (previousPrices.length === 0) {
      return {
        route: current.route,
        message: `Latest worker snapshot is ${current.currency} ${current.price} on ${current.airline}. More history is needed for trend alerts.`,
        severity: "watch"
      };
    }

    const average = previousPrices.reduce((sum, price) => sum + price, 0) / previousPrices.length;
    const dropAmount = average - current.price;
    const dropPercent = dropAmount / average;

    if (dropPercent >= 0.1 && dropAmount >= 15) {
      return {
        route: current.route,
        message: `Fare is ${formatPercent(dropPercent)} below the recent route average and cleared the $15 noise filter.`,
        severity: "deal"
      };
    }

    if (current.price > average * 1.1) {
      return {
        route: current.route,
        message: `Fare is ${formatPercent((current.price - average) / average)} above the recent route average; keep watching before booking.`,
        severity: "urgent"
      };
    }

    return {
      route: current.route,
      message: `Fare is near the recent route average of ${current.currency} ${Math.round(average)}.`,
      severity: "watch"
    };
  });
}

function compareNewestFirst(a: FareSnapshot, b: FareSnapshot) {
  const timeDifference = Date.parse(b.capturedAt) - Date.parse(a.capturedAt);
  return timeDifference === 0 ? b.id - a.id : timeDifference;
}

function formatTravelDates(snapshot: FareSnapshot) {
  return snapshot.returnDate ? `${snapshot.departDate} - ${snapshot.returnDate}` : `${snapshot.departDate} one-way`;
}

function formatChartDate(day: string) {
  return dateFormatter.format(new Date(`${day}T12:00:00.000Z`));
}

function formatTimestamp(timestamp: string) {
  return timestampFormatter.format(new Date(timestamp));
}

function formatPercent(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}
