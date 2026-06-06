"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { priceTrend } from "../lib/data";

export function PriceChart() {
  return (
    <div className="h-80 w-full rounded-3xl bg-white/85 p-5 shadow-soft ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">7-day fare trend</h2>
          <p className="text-sm text-slate-500">Tracked routes refreshed daily at 11:00 UTC.</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">Live automation</span>
      </div>
      <ResponsiveContainer width="100%" height="78%">
        <LineChart data={priceTrend} margin={{ left: 4, right: 16, top: 12, bottom: 0 }}>
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(value: number) => `$${value}`} />
          <Tooltip formatter={(value: number | string) => [`$${value}`, "Fare"]} contentStyle={{ borderRadius: 16, border: "1px solid #cbd5e1" }} />
          <Line type="monotone" dataKey="sfoHnd" stroke="#0f766e" strokeWidth={3} dot={false} name="SFO → HND" />
          <Line type="monotone" dataKey="jfkLis" stroke="#2563eb" strokeWidth={3} dot={false} name="JFK → LIS" />
          <Line type="monotone" dataKey="ordCdg" stroke="#f97316" strokeWidth={3} dot={false} name="ORD → CDG" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
