import React, { useEffect, useMemo, useState } from 'react';
import { QaCheckItem, useQaChecklist } from '../hooks/useQaChecklist';

type Control = {
  title: string;
  api: string;
  expected: string;
  method: 'GET' | 'POST' | 'PATCH';
  payload?: Record<string, unknown>;
};

const controls: Control[] = [
  { title: 'Annulation tardive', api: '/api/qa/late-cancellation/check', expected: 'Suspension à 1-2 retards, radiation à 3 retards', method: 'POST', payload: { isLate: true, lateCount: 3 } },
  { title: 'Facturation', api: '/api/companies/billing/invoices/generate', expected: 'Calcul facture + PDF', method: 'POST', payload: {} },
  { title: 'Exports', api: '/api/billing/invoices/:id/csv', expected: 'CSV/XLS téléchargeables', method: 'GET' },
  { title: 'Accès non autorisés', api: '/api/admin/kpis', expected: '401/403 sans token admin', method: 'GET' },
  { title: 'Rôles et permissions', api: '/api/qa/permissions/check', expected: 'ADMIN > ENTREPRISE > CHAUFFEUR', method: 'POST', payload: { actorRole: 'ENTREPRISE', requiredRole: 'ADMIN' } },
  { title: 'Upload malveillant', api: '/api/qa/uploads/check', expected: 'Extension/taille rejetées', method: 'POST', payload: { filename: 'script.php', sizeBytes: 20 * 1024 * 1024 } },
  { title: 'Erreurs API', api: '/api/admin/billing/export/csv', expected: 'Réponses structurées + logs audit', method: 'GET' },
];

export default function QaSecurity(): JSX.Element {
  const { items, loading, error, loadRemote, updateItem } = useQaChecklist('security');
  const [results, setResults] = useState<Record<string, string>>({});
  const byTitle = useMemo(() => new Map(items.map((item) => [item.name, item])), [items]);
  const apiBaseUrl = useMemo(() => {
    const base = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api';
    return base.endsWith('/api') ? base : `${base}/api`;
  }, []);
  const token = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;

  useEffect(() => {
    loadRemote().catch(() => undefined);
  }, []);

  async function run(control: Control) {
    try {
      const res = await fetch(`${apiBaseUrl}${control.api}`, {
        method: control.method,
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(control.payload ? { 'Content-Type': 'application/json' } : {}) },
        body: control.payload ? JSON.stringify(control.payload) : undefined,
      });
      const data = await res.json().catch(() => null);
      setResults((current) => ({ ...current, [control.title]: `${res.status} ${res.ok ? 'OK' : 'ATTENTION'} — ${data?.message ?? ''}` }));
      await updateItem({ suite: 'security', name: control.title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status: res.ok ? 'PASS' : 'FAIL', notes: `${control.method} ${control.api}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setResults((current) => ({ ...current, [control.title]: message }));
      await updateItem({ suite: 'security', name: control.title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status: 'FAIL', notes: message });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="font-extrabold">Vectura QA</div>
            <div className="text-sm text-slate-500">Recette sécurité MVP</div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 space-y-6">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-extrabold">Story 9.2 — QA sécurité</h1>
          <p className="mt-2 text-slate-600">Vérifier permissions, uploads, facturation, exports, logs et erreurs API.</p>
          {error ? <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div> : null}
        </section>
        <section className="grid grid-cols-1 gap-4">
          {controls.map((control) => {
            const item = byTitle.get(control.title);
            return (
              <article key={control.title} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{control.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{control.expected}</p>
                    <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">{control.method} {control.api}</div>
                    {results[control.title] ? <div className="mt-2 text-sm text-slate-600">{results[control.title]}</div> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800" onClick={() => run(control)}>Lancer</button>
                    <button type="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700" onClick={() => updateItem({ suite: 'security', name: control.title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status: 'PASS' })}>Pass</button>
                    <button type="button" className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={() => updateItem({ suite: 'security', name: control.title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status: 'FAIL' })}>Fail</button>
                  </div>
                </div>
                {item ? <div className="mt-4 text-sm text-slate-600">Statut: <span className="font-semibold text-slate-900">{item.status}</span></div> : null}
              </article>
            );
          })}
          {loading ? <p className="rounded-xl border bg-white p-4 text-sm text-slate-500">Chargement des checks…</p> : null}
        </section>
      </main>
    </div>
  );
}
