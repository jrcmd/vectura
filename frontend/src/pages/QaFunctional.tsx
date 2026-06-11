import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QaCheckItem, useQaChecklist } from '../hooks/useQaChecklist';

type Flow = {
  title: string;
  route: string;
  api: string;
  expected: string;
};

const flows: Flow[] = [
  { title: 'Inscription chauffeur', route: '/inscription/chauffeur', api: 'POST /api/drivers/register', expected: 'Compte EN_ATTENTE + DriverProfile créé' },
  { title: 'Inscription entreprise', route: '/inscription/entreprise', api: 'POST /api/companies/register', expected: 'Compte entreprise VALIDE + CompanyProfile créé' },
  { title: 'Login logout', route: '/connexion/chauffeur', api: 'POST /api/auth/login + POST /api/auth/logout', expected: 'Token émis puis révoqué' },
  { title: 'Upload documents', route: '/depot-documents', api: 'POST /api/documents/upload', expected: 'Fichier déposé en EN_ATTENTE' },
  { title: 'Validation admin', route: '/admin/chauffeurs', api: 'PATCH /api/admin/documents/validate', expected: 'Document VALIDE et notification log' },
  { title: 'Création mission', route: '/companies/mission/create', api: 'POST /api/companies/missions', expected: 'Mission OUVERTE publiée' },
  { title: 'Matching', route: '/chauffeur/dashboard', api: 'GET /api/driver/missions?type=available', expected: 'Missions compatibles uniquement' },
];

export default function QaFunctional(): JSX.Element {
  const navigate = useNavigate();
  const { items, loading, error, loadRemote, updateItem } = useQaChecklist('functional');
  const [message, setMessage] = useState<string | null>(null);
  const byTitle = useMemo(() => new Map(items.map((item) => [item.name, item])), [items]);

  useEffect(() => {
    loadRemote().catch(() => undefined);
  }, []);

  async function mark(flow: Flow, status: QaCheckItem['status']) {
    await updateItem({ suite: 'functional', name: flow.title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status, owner: 'QA', notes: `${flow.api} — ${flow.expected}` });
    setMessage(`${flow.title} marqué ${status}.`);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="font-extrabold">Vectura QA</div>
            <div className="text-sm text-slate-500">Recette fonctionnelle MVP</div>
          </div>
          <button type="button" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50" onClick={() => navigate('/')}>Retour</button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 space-y-6">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold">Story 9.1 — QA fonctionnelle</h1>
              <p className="mt-2 text-slate-600">Valider les parcours métier clés avant lancement.</p>
            </div>
            <button type="button" className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" onClick={() => loadRemote()}>Actualiser</button>
          </div>
          {error ? <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div> : null}
          {message ? <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div> : null}
        </section>

        <section className="grid grid-cols-1 gap-4">
          {flows.map((flow) => {
            const item = byTitle.get(flow.title);
            return (
              <article key={flow.title} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{flow.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{flow.expected}</p>
                    <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                      <span className="rounded-lg bg-slate-100 px-3 py-2">Route: {flow.route}</span>
                      <span className="rounded-lg bg-slate-100 px-3 py-2">API: {flow.api}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50" onClick={() => navigate(flow.route)}>Ouvrir</button>
                    <button type="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700" onClick={() => mark(flow, 'PASS')}>Pass</button>
                    <button type="button" className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={() => mark(flow, 'FAIL')}>Fail</button>
                    <button type="button" className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600" onClick={() => mark(flow, 'BLOCKED')}>Bloqué</button>
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
