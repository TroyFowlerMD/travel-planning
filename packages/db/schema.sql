CREATE TABLE IF NOT EXISTS fare_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  depart_date TEXT NOT NULL,
  return_date TEXT,
  price INTEGER NOT NULL CHECK (price > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  airline TEXT NOT NULL,
  booking_url TEXT NOT NULL,
  raw_provider TEXT NOT NULL,
  captured_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_fare_snapshots_route_captured_at
  ON fare_snapshots (route, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_fare_snapshots_origin_destination
  ON fare_snapshots (origin, destination, depart_date);
