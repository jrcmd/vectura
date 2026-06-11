import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type KpiData = {
  activeMissions: number;
  pendingDrivers: number;
  expiringDocuments: number;
  weeklyRevenue: number;
};

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  companyName: string;
  weekStart: string;
  weekEnd: string;
  totalAmountBilled: number;
  totalAmountDriver: number;
  totalMargin: number;
  status: string;
  missionCount: number;
};

type MarginRow = {
  invoiceId: string;
  invoiceNumber: string;
  weekStart: string;
  weekEnd: string;
  totalMargin: number;
  totalRevenue: number;
  marginPercent: number;
  missionMargins: Array<{
    missionId: string;
    missionTitle: string;
    missionDate: string;
    missionStatus: string;
    margin: number;
    revenue: number;
    marginPercent: number;
  }>;
};

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [margins, setMargins] = useState<MarginRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const apiBase = useMemo(() => (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api', []);

  function headers(): Record<string, string> {
    const bearer = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;
    return bearer ? { Authorization: `Bearer ${bearer}` } : {};
  }

  async function loadKpi() {
    try {
      const res = await fetch(`${apiBase}/admin/kpis`, { headers: headers() });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; kpis?: KpiData; message?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
      setKpi(data.kpis ?? null);
    } catch (err) {
      if (!(err instanceof Error)) throw err;
      setError(err.message);
    }
  }

  async function loadBillingData() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const url = `${apiBase}/admin/billing/invoices${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { headers: headers() });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; invoices?: InvoiceRow[]; message?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
      setInvoices(data.invoices ?? []);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMargins() {
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const url = `${apiBase}/admin/billing/margins${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { headers: headers() });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; margins?: MarginRow[]; message?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
      setMargins(data.margins ?? []);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  }

  useEffect(() => {
    loadKpi();
    loadBillingData();
    loadMargins();
  }, [apiBase]);

  useEffect(() => {
    loadBillingData();
    loadMargins();
  }, [from, to]);

  const totalMargin = useMemo(() => margins.reduce((sum, item) => sum + item.totalMargin, 0), [margins]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Admin</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/')}>Retour</button>
      </header>
      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-extrabold">Tableau de bord</h1>
        {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}
        {kpi ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-medium text-slate-500">Missions en cours</h2>
              <p className="mt-2 text-3xl font-bold text-slate-900">{kpi.activeMissions}</p>
            </div>
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-medium text-slate-500">Chauffeurs en attente</h2>
              <p className="mt-2 text-3xl font-bold text-slate-900">{kpi.pendingDrivers}</p>
            </div>
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-medium text-slate-500">Documents à renouveler</h2>
              <p className="mt-2 text-3xl font-bold text-slate-900">{kpi.expiringDocuments}</p>
            </div>
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-medium text-slate-500">CA semaine (€)</h2>
              <p className="mt-2 text-3xl font-bold text-slate-900">{kpi.weeklyRevenue.toLocaleString('fr-FR')}</p>
            </div>
          </div>
        ) : null}

        <section className="rounded-2xl border bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Factures hebdomadaires</h2>
            <div className="flex items-center gap-2">
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
              <button type="button" className="rounded-lg bg-blue-700 text-white px-4 py-2 text-sm font-medium hover:bg-blue-800" onClick={() => {}}>
                Filtrer
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Chargement…</p>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-slate-600">Aucune facture pour cette période.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Facture</th>
                    <th className="text-left py-2">Entreprise</th>
                    <th className="text-left py-2">Semaine</th>
                    <th className="text-right py-2">Facturé</th>
                    <th className="text-right py-2">Chauffeur</th>
                    <th className="text-right py-2">Marge</th>
                    <th className="text-left py-2">Statut</th>
                    <th className="text-left py-2">Missions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="py-2">{row.invoiceNumber}</td>
                      <td className="py-2">{row.companyName}</td>
                      <td className="py-2">
                        {new Date(row.weekStart).toLocaleDateString('fr-FR')} - {new Date(row.weekEnd).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-2 text-right">{row.totalAmountBilled.toFixed(2)} €</td>
                      <td className="py-2 text-right">{row.totalAmountDriver.toFixed(2)} €</td>
                      <td className="py-2 text-right">{row.totalMargin.toFixed(2)} €</td>
                      <td className="py-2">{row.status}</td>
                      <td className="py-2">{row.missionCount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-semibold">
                    <td className="py-2" colSpan={3}>Total</td>
                    <td className="py-2 text-right">{invoices.reduce((s, i) => s + i.totalAmountBilled, 0).toFixed(2)} €</td>
                    <td className="py-2 text-right">{invoices.reduce((s, i) => s + i.totalAmountDriver, 0).toFixed(2)} €</td>
                    <td className="py-2 text-right">{totalMargin.toFixed(2)} €</td>
                    <td className="py-2" colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Marges par mission</h2>
          {margins.length === 0 ? (
            <p className="text-sm text-slate-600">Aucune donnée.</p>
          ) : (
            <div className="space-y-3">
              {margins.map((margin) => (
                <details key={margin.invoiceId} className="rounded-xl border p-3">
                  <summary className="cursor-pointer text-sm font-medium text-slate-900">
                    {margin.invoiceNumber} — Marge: {margin.totalMargin.toFixed(2)} € ({margin.marginPercent}%)
                  </summary>
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1">Mission</th>
                          <th className="text-left py-1">Date</th>
                          <th className="text-left py-1">Statut</th>
                          <th className="text-right py-1">Revenu</th>
                          <th className="text-right py-1">Marge</th>
                          <th className="text-right py-1">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {margin.missionMargins.map((m) => (
                          <tr key={m.missionId} className="border-b last:border-0">
                            <td className="py-1">{m.missionTitle}</td>
                            <td className="py-1">{new Date(m.missionDate).toLocaleDateString('fr-FR')}</td>
                            <td className="py-1">{m.missionStatus}</td>
                            <td className="py-1 text-right">{m.revenue.toFixed(2)} €</td>
                            <td className="py-1 text-right">{m.margin.toFixed(2)} €</td>
                            <td className="py-1 text-right">{(m.marginPercent * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
