export type FareSnapshot = {
  id: number;
  route: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string | null;
  price: number;
  currency: string;
  airline: string;
  bookingUrl: string;
  capturedAt: string;
};

export type TravelIdea = {
  destination: string;
  window: string;
  budget: number;
  notes: string;
  status: "Exploring" | "Tracking" | "Ready to book";
};

export type Alert = {
  route: string;
  message: string;
  severity: "deal" | "watch" | "urgent";
};

export type PriceTrendPoint = {
  date: string;
  [routeKey: string]: string | number;
};

export type PriceTrendSeries = {
  key: string;
  route: string;
  color: string;
};

export const DEFAULT_WORKER_URL = "https://travel-planning-worker.troyfowlermd.workers.dev";

type FallbackRoute = {
  route: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  airline: string;
  prices: number[];
};

const fallbackRoutes: FallbackRoute[] = [
  {
    route: "AVL -> DCA",
    origin: "AVL",
    destination: "DCA",
    departDate: "2026-09-25",
    returnDate: "2026-09-28",
    airline: "American",
    prices: [468, 462, 457, 451, 444, 439, 432]
  },
  {
    route: "AVL -> SEA",
    origin: "AVL",
    destination: "SEA",
    departDate: "2026-12-05",
    returnDate: "2026-12-09",
    airline: "Delta",
    prices: [724, 718, 713, 705, 698, 692, 686]
  },
  {
    route: "AVL -> PHL",
    origin: "AVL",
    destination: "PHL",
    departDate: "2026-12-18",
    returnDate: "2026-12-21",
    airline: "American",
    prices: [459, 455, 449, 446, 441, 436, 429]
  }
  // AVL -> CLT is a ~2 hr drive and is now flagged mode="drive" in the worker,
  // so it's excluded from fare-refresh and from the dashboard's fare stats.
];

export type DriveRoute = {
  route: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  note: string;
};

// Itinerary legs handled by car, surfaced separately from fare tracking.
export const driveRoutes: DriveRoute[] = [
  {
    route: "AVL -> CLT",
    origin: "AVL",
    destination: "CLT",
    departDate: "2027-01-01",
    returnDate: "2027-01-04",
    note: "~2 hr drive; faster and cheaper than flying for this leg."
  }
];

const fallbackCapturedAt = [
  "2026-06-01T11:00:00.000Z",
  "2026-06-02T11:00:00.000Z",
  "2026-06-03T11:00:00.000Z",
  "2026-06-04T11:00:00.000Z",
  "2026-06-05T11:00:00.000Z",
  "2026-06-06T11:00:00.000Z",
  "2026-06-07T11:00:00.000Z"
];

export const fallbackFareSnapshots: FareSnapshot[] = fallbackRoutes.flatMap((route, routeIndex) =>
  fallbackCapturedAt.map((capturedAt, capturedAtIndex) => ({
    id: routeIndex * fallbackCapturedAt.length + capturedAtIndex + 1,
    route: route.route,
    origin: route.origin,
    destination: route.destination,
    departDate: route.departDate,
    returnDate: route.returnDate,
    price: route.prices[capturedAtIndex],
    currency: "USD",
    airline: route.airline,
    bookingUrl: "https://www.google.com/travel/flights",
    capturedAt
  }))
);

export const fallbackTravelIdeas: TravelIdea[] = [
  {
    destination: "Washington away weekend",
    window: "September 25-28, 2026",
    budget: 900,
    notes: "Track AVL to DCA for the Seahawks road-game itinerary.",
    status: "Tracking"
  },
  {
    destination: "Seattle December trip",
    window: "December 5-9, 2026",
    budget: 1400,
    notes: "Watch for one-stop AVL to SEA fares below the route baseline.",
    status: "Tracking"
  },
  {
    destination: "Philadelphia holiday window",
    window: "December 18-21, 2026",
    budget: 950,
    notes: "Prefer routings that avoid tight winter connections.",
    status: "Exploring"
  }
];

export const fallbackAlerts: Alert[] = [
  {
    route: "AVL -> DCA",
    message: "Fallback data is loaded until the worker returns live fare snapshots.",
    severity: "watch"
  }
];
