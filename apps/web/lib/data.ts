export type FareSnapshot = {
  id: number;
  route: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
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

export const fareSnapshots: FareSnapshot[] = [
  {
    id: 1,
    route: "SFO → HND",
    origin: "SFO",
    destination: "HND",
    departDate: "2026-09-18",
    returnDate: "2026-10-02",
    price: 842,
    currency: "USD",
    airline: "ANA",
    bookingUrl: "https://www.google.com/travel/flights",
    capturedAt: "2026-06-06T11:00:00Z"
  },
  {
    id: 2,
    route: "JFK → LIS",
    origin: "JFK",
    destination: "LIS",
    departDate: "2026-08-08",
    returnDate: "2026-08-19",
    price: 516,
    currency: "USD",
    airline: "TAP Air Portugal",
    bookingUrl: "https://www.google.com/travel/flights",
    capturedAt: "2026-06-06T11:00:00Z"
  },
  {
    id: 3,
    route: "ORD → CDG",
    origin: "ORD",
    destination: "CDG",
    departDate: "2026-10-11",
    returnDate: "2026-10-21",
    price: 624,
    currency: "USD",
    airline: "Air France",
    bookingUrl: "https://www.google.com/travel/flights",
    capturedAt: "2026-06-06T11:00:00Z"
  },
  {
    id: 4,
    route: "LAX → MEX",
    origin: "LAX",
    destination: "MEX",
    departDate: "2026-07-16",
    returnDate: "2026-07-22",
    price: 288,
    currency: "USD",
    airline: "Aeromexico",
    bookingUrl: "https://www.google.com/travel/flights",
    capturedAt: "2026-06-06T11:00:00Z"
  }
];

export const priceTrend = [
  { date: "May 31", sfoHnd: 1012, jfkLis: 620, ordCdg: 710 },
  { date: "Jun 1", sfoHnd: 984, jfkLis: 598, ordCdg: 692 },
  { date: "Jun 2", sfoHnd: 955, jfkLis: 586, ordCdg: 690 },
  { date: "Jun 3", sfoHnd: 931, jfkLis: 548, ordCdg: 668 },
  { date: "Jun 4", sfoHnd: 910, jfkLis: 532, ordCdg: 642 },
  { date: "Jun 5", sfoHnd: 872, jfkLis: 521, ordCdg: 631 },
  { date: "Jun 6", sfoHnd: 842, jfkLis: 516, ordCdg: 624 }
];

export const travelIdeas: TravelIdea[] = [
  {
    destination: "Kyoto in foliage season",
    window: "Mid-November 2026",
    budget: 2200,
    notes: "Watch SFO/TYO fares and keep rail pass cost in total budget.",
    status: "Tracking"
  },
  {
    destination: "Lisbon surf week",
    window: "Late August 2026",
    budget: 1500,
    notes: "Prefer nonstop or one-stop routes with morning arrivals.",
    status: "Ready to book"
  },
  {
    destination: "Paris museum sprint",
    window: "October 2026",
    budget: 1800,
    notes: "Shoulder-season hotel rates make airfare under $650 attractive.",
    status: "Exploring"
  }
];

export const alerts: Alert[] = [
  {
    route: "SFO → HND",
    message: "Fare is 16.8% below the 7-day baseline and cleared the $15 noise filter.",
    severity: "deal"
  },
  {
    route: "JFK → LIS",
    message: "Route is below the historical 25th percentile booking-window target.",
    severity: "urgent"
  },
  {
    route: "ORD → CDG",
    message: "Three consecutive drops detected; keep monitoring for another 24 hours.",
    severity: "watch"
  }
];
