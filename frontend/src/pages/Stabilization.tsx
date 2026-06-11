import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QaCheckItem, useQaChecklist } from '../hooks/useQaChecklist';

type Incident = {
  id: string;
  title: string;
  severity: string;
  status: string;
  description: string | null;
  createdAt: string;
};

type StabilizationItem = {
  title: string;
  description: string;
  action: 'incident' | 'ux' | 'rule' | 'roadmap';
};

const items: StabilizationItem[] = [
  { title: 'Bugs post lancement', description: 'Traiter les incidents des premiers jours.', action: 'incident' },
  { title: 'Erreurs critiques', description: 'Analyser erreurs 5xx, annulations tardives et échecs mails.', action: 'incident' },
  { title: 'UX terrain', description: 'Ajuster les écrans selon retours chauffeurs et entreprises.', action: 'ux' },
  { title: 'Règles métier', description: 'Faire évoluer taux minimum, priorités favoris et seuils sanction.', action: 'rule' },
  { title: 'Roadmap V1', description: 'Prioriser les chantiers après MVP.', action: 'roadmap' },
];

export default function Stabilization(): JSX.Element {
  const navigate = useNavigate();
  const { items: qaItems, loading, error, loadRemote, updateItem } = useQaChecklist('stabilization');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [form, setForm] = useState({ title: '', severity: 'NORMAL', description: '' });
  const [message, setMessage] = useState<string | null>(null);
  const apiBaseUrl = useMemo(() => {
    const base = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api';
    return base.endsWith('/api') ? base : `${base}/api`;
  }, []);
  const token = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;

  useEffect(() => {
    loadRemote().catch(() => undefined);
    loadIncidents().catch(() => undefined);
  }, []);

  async function loadIncidents() {
    const res = await fetch(`${apiBaseUrl}/admin/audit/incidents?limit=10`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; items?: Incident[] } | null;
    if (res.ok && data?.ok) setIncidents(data.items ?? []);
  }

  async function createIncident() {
    const res = await fetch(`${apiBaseUrl}/admin/audit/incidents`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, source: 'stabilization' }),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    setMessage(data?.message ?? (res.ok ? 'Incident créé.' : 'Impossible de créer l’incident.'));
    if (res.ok) {
      setForm({ title: '', severity: 'NORMAL', description: '' });
      await loadIncidents();
    }
  }

  async function mark(title: string, status: QaCheckItem['status']) {
    await updateItem({ suite: 'stabilization', name: title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status, owner: 'PO', notes: title });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="font-extrabold">Vectura QA</div>
            <div className="text-sm text-slate-500">Stabilisation</div>
          </div>
          <button type="button" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50" onClick={() => navigate('/')}>Retour</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 space-y-6">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-extrabold">Story 9.5 — Stabilisation</h1>
          <p className="mt-2 text-slate-600">Corriger, prioriser et préparer la roadmap V1 après lancement.</p>
          {error ? <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div> : null}
          {message ? <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div> : null}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Créer un incident</h2>
            <div className="mt-4 grid gap-3">
              <input className="rounded-lg border px-3 py-2" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Titre" />
              <select className="rounded-lg border px-3 py-2" value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}>
                <option value="LOW">Faible</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Haute</option>
                <option value="CRITICAL">Critique</option>
              </select>
              <textarea className="rounded-lg border px-3 py-2" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" />
              <button type="button" className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={() => createIncident()}>Créer l’incident</button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Incidents récents</h2>
            {incidents.length === 0 ? <p className="mt-3 text-sm text-slate-500">Aucun incident.</p> : null}
            <ul className="mt-3 space-y-2 text-sm">
              {incidents.map((incident) => <li key={incident.id} className="rounded-lg bg-slate-50 p-3"><span className="font-semibold">{incident.title}</span> — {incident.severity} / {incident.status}</li>)}
            </ul>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4">
          {items.map((item) => {
            const qa = qaItems.find((entry) => entry.name === item.title);
            return (
              <article key={item.title} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700" onClick={() => mark(item.title, 'PASS')}>Traité</button>
                    <button type="button" className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600" onClick={() => mark(item.title, 'DOING')}>En cours</button>
                    <button type="button" className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={() => mark(item.title, 'BLOCKED')}>Bloqué</button>
                  </div>
                </div>
                {qa ? <div className="mt-4 text-sm text-slate-600">Statut: <span className="font-semibold text-slate-900">{qa.status}</span></div> : null}
              </article>
            );
          })}
          {loading ? <p className="rounded-xl border bg-white p-4 text-sm text-slate-500">Chargement des checks…</p> : null}
        </section>
      </main>
    </div>
  );
}
