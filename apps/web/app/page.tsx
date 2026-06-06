import { PriceChart } from "../components/PriceChart";
import { alerts, fareSnapshots, travelIdeas } from "../lib/data";

const severityClass = {
  deal: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  urgent: "bg-rose-100 text-rose-800 ring-rose-200",
  watch: "bg-amber-100 text-amber-800 ring-amber-200"
};

export default function DashboardPage() {
  const bestFare = fareSnapshots.reduce((best, fare) => (fare.price < best.price ? fare : best), fareSnapshots[0]);
  const averageFare = Math.round(fareSnapshots.reduce((sum, fare) => sum + fare.price, 0) / fareSnapshots.length);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-cyan-100 ring-1 ring-white/20">Travel Planning Command Center</p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">Track flight prices and turn travel ideas into data-backed booking decisions.</h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">The dashboard combines route monitoring, fare history, automation status, and alert recommendations for the MVP workflow.</p>
          </div>
          <div className="grid gap-3 rounded-3xl bg-white/10 p-5 ring-1 ring-white/15">
            <span className="text-sm uppercase tracking-[0.25em] text-cyan-100">Best fare today</span>
            <strong className="text-5xl">${bestFare.price}</strong>
            <span className="text-slate-300">{bestFare.route} with {bestFare.airline}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Tracked routes", fareSnapshots.length.toString()],
          ["Average fare", `$${averageFare}`],
          ["Active alerts", alerts.length.toString()],
          ["Ideas captured", travelIdeas.length.toString()]
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl bg-white/80 p-5 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
        <PriceChart />
        <div className="rounded-3xl bg-white/85 p-5 shadow-soft ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-950">Smart alerts</h2>
          <div className="mt-4 space-y-3">
            {alerts.map((alert) => (
              <article key={alert.route} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
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
                {fareSnapshots.map((fare) => (
                  <tr key={fare.id}>
                    <td className="px-4 py-3 font-semibold text-slate-950">{fare.route}</td>
                    <td className="px-4 py-3 text-slate-600">{fare.departDate} – {fare.returnDate}</td>
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
            {travelIdeas.map((idea) => (
              <article key={idea.destination} className="rounded-2xl bg-skyglass p-4 ring-1 ring-cyan-100">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-950">{idea.destination}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{idea.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{idea.window} · Budget ${idea.budget}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{idea.notes}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
