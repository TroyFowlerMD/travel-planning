"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PriceTrendPoint, PriceTrendSeries } from "../lib/data";

type PriceChartProps = {
  priceTrend: PriceTrendPoint[];
  series: PriceTrendSeries[];
};

export function PriceChart({ priceTrend, series }: PriceChartProps) {
  return (
    <div className="h-80 w-full rounded-3xl bg-white/85 p-5 shadow-soft ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">7-day fare trend</h2>
          <p className="text-sm text-slate-500">Route history grouped from worker snapshots.</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">Live automation</span>
      </div>
      {priceTrend.length > 0 && series.length > 0 ? (
        <ResponsiveContainer width="100%" height="78%">
          <LineChart data={priceTrend} margin={{ left: 4, right: 16, top: 12, bottom: 0 }}>
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(value: number) => `$${value}`} />
            <Tooltip formatter={(value: number | string, name: string) => [`$${value}`, name]} contentStyle={{ borderRadius: 16, border: "1px solid #cbd5e1" }} />
            {series.map((route) => (
              <Line key={route.key} type="monotone" dataKey={route.key} stroke={route.color} strokeWidth={3} dot={false} name={route.route} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[78%] items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-500">
          Waiting for fare history.
        </div>
      )}
    </div>
  );
}
