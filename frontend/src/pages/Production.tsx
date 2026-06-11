import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QaCheckItem, useQaChecklist } from '../hooks/useQaChecklist';

type Readiness = {
  ok: boolean;
  checks: Array<{ name: string; ok: boolean; value: string | boolean }>;
};

type Control = {
  title: string;
  description: string;
  action: 'readiness' | 'migrations' | 'monitoring' | 'availability' | 'manual';
};

const controls: Control[] = [
  { title: 'Performance minimale', description: 'Vérifier temps de réponse health, listings et création mission.', action: 'manual' },
  { title: 'Déploiement production', description: 'Déployer backend/frontend avec NODE_ENV=production.', action: 'manual' },
  { title: 'Domaine final', description: 'Brancher le nom de domaine officiel et redirection HTTP.', action: 'manual' },
  { title: 'SSL final', description: 'Activer HTTPS et vérifier certificat.', action: 'manual' },
  { title: 'Migrations production', description: 'Exécuter prisma migrate deploy et vérifier schéma.', action: 'migrations' },
  { title: 'Monitoring', description: 'Confirmer health, cron jobs, backups et logs incidents.', action: 'monitoring' },
  { title: 'Disponibilité publique', description: 'Tester parcours utilisateur réel depuis mobile et navigateur.', action: 'availability' },
];

export default function Production(): JSX.Element {
  const navigate = useNavigate();
  const { items, loading, error, loadRemote, updateItem } = useQaChecklist('production');
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const apiBaseUrl = useMemo(() => {
    const base = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api';
    return base.endsWith('/api') ? base : `${base}/api`;
  }, []);
  const token = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;

  useEffect(() => {
    loadRemote().catch(() => undefined);
  }, []);

  async function run(control: Control) {
    if (control.action === 'manual') {
      await updateItem({ suite: 'production', name: control.title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status: 'DOING', notes: control.description, owner: 'Ops' });
      setResults((current) => [...current, `${control.title}: à valider manuellement`]);
      return;
    }

    if (control.action === 'readiness' || control.action === 'monitoring') {
      const res = await fetch(`${apiBaseUrl}/admin/monitoring/production`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; readiness?: Readiness; message?: string } | null;
      setReadiness(data?.readiness ?? null);
      setResults((current) => [...current, `${control.title}: ${data?.ok ? 'OK' : 'À corriger'}`]);
      await updateItem({ suite: 'production', name: control.title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status: data?.ok ? 'PASS' : 'BLOCKED', notes: control.description });
      return;
    }

    if (control.action === 'migrations') {
      setResults((current) => [...current, `${control.title}: exécuter prisma migrate deploy en production`]);
      await updateItem({ suite: 'production', name: control.title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status: 'DOING', notes: 'prisma migrate deploy' });
    }

    if (control.action === 'availability') {
      const res = await fetch(`${apiBaseUrl}/monitoring/health`);
      const data = await res.json().catch(() => null);
      setResults((current) => [...current, `${control.title}: ${res.ok ? 'OK' : 'Erreur'} ${data?.ok === false ? '— health KO' : ''}`]);
      await updateItem({ suite: 'production', name: control.title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status: res.ok ? 'PASS' : 'FAIL', notes: 'GET /api/monitoring/health' });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="font-extrabold">Vectura QA</div>
            <div className="text-sm text-slate-500">Production</div>
          </div>
          <button type="button" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50" onClick={() => navigate('/')}>Retour</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 space-y-6">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-extrabold">Story 9.4 — Production</h1>
          <p className="mt-2 text-slate-600">Checklist de mise en ligne du MVP et contrôles post-déploiement.</p>
          {error ? <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div> : null}
        </section>
        {readiness ? (
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Préparation production</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {readiness.checks.map((check) => <li key={check.name} className={check.ok ? 'text-emerald-700' : 'text-red-700'}>{check.name}: {String(check.value)}</li>)}
            </ul>
          </section>
        ) : null}
        <section className="grid grid-cols-1 gap-4">
          {controls.map((control) => {
            const item = items.find((entry) => entry.name === control.title);
            return (
              <article key={control.title} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{control.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{control.description}</p>
                  </div>
                  <button type="button" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" onClick={() => run(control)}>Vérifier</button>
                </div>
                {item ? <div className="mt-4 text-sm text-slate-600">Statut: <span className="font-semibold text-slate-900">{item.status}</span></div> : null}
              </article>
            );
          })}
          {results.length > 0 ? <div className="rounded-2xl border bg-white p-5 text-sm text-slate-700"><ul className="list-disc pl-5 space-y-1">{results.map((result) => <li key={result}>{result}</li>)}</ul></div> : null}
          {loading ? <p className="rounded-xl border bg-white p-4 text-sm text-slate-500">Chargement des checks…</p> : null}
        </section>
      </main>
    </div>
  );
}
