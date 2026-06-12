import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QaCheckItem, useQaChecklist } from '../hooks/useQaChecklist';

type ActionResult = { label: string; message: string; ok: boolean };

type Control = {
  title: string;
  description: string;
  action: 'seed' | 'mail' | 'cron' | 'backup' | 'manual';
};

const controls: Control[] = [
  { title: 'Limites taille fichier', description: 'Contrôler MAX_FILE_SIZE_MB et rejet des fichiers trop lourds.', action: 'manual' },
  { title: 'Journalisation incidents', description: 'Créer et suivre un incident critique dans le back office.', action: 'manual' },
  { title: 'Déploiement staging', description: 'Valider compose staging, variables et domaine interne.', action: 'manual' },
  { title: 'Données de test', description: 'Injecter un jeu de données réaliste chauffeur, entreprise, missions et checks QA.', action: 'seed' },
  { title: 'Mails automatiques', description: 'Vérifier SMTP, logs NotificationLog et messages de validation.', action: 'mail' },
  { title: 'Cron jobs', description: 'Contrôler document, rappel mission, annulation tardive, sanction et facturation.', action: 'cron' },
  { title: 'Sauvegardes', description: 'Exécuter une sauvegarde et vérifier BackupRun.', action: 'backup' },
];

export default function Preproduction(): JSX.Element {
  const navigate = useNavigate();
  const { items, loading, error, loadRemote, updateItem } = useQaChecklist('preproduction');
  const [results, setResults] = useState<ActionResult[]>([]);
  const byTitle = useMemo(() => new Map(items.map((item) => [item.name, item])), [items]);
  /** Calcule l'URL de base de l'API pour les appels fetch */
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
      await updateItem({ suite: 'preproduction', name: control.title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status: 'DOING', notes: control.description, owner: 'PO' });
      setResults((current) => [...current, { label: control.title, message: 'Action manuelle à valider.', ok: true }]);
      return;
    }

    const endpointByAction: Record<string, string> = {
      seed: '/api/qa/seed',
      mail: '/api/admin/monitoring/mail',
      cron: '/api/admin/monitoring/jobs',
      backup: '/api/admin/monitoring/backups/run',
    };
    const endpoint = endpointByAction[control.action];

    const res = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: control.action === 'seed' ? 'POST' : 'GET',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      body: control.action === 'seed' ? JSON.stringify({ allowProduction: false }) : undefined,
    });
    const data = await res.json().catch(() => null);
    const ok = res.ok;
    setResults((current) => [...current, { label: control.title, message: data?.message ?? data?.ok === false ? 'Erreur' : 'OK', ok }]);
    await updateItem({ suite: 'preproduction', name: control.title, status: 'TODO', notes: null, owner: null, dueDate: null }, { status: ok ? 'PASS' : 'FAIL', notes: endpoint });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="font-extrabold">Vectura QA</div>
            <div className="text-sm text-slate-500">Préproduction</div>
          </div>
          <button type="button" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50" onClick={() => navigate('/')}>Retour</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 space-y-6">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-extrabold">Story 9.3 — Préproduction</h1>
          <p className="mt-2 text-slate-600">Valider staging, seed, cron jobs, mails et sauvegardes avant production.</p>
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
                    <p className="mt-2 text-sm text-slate-600">{control.description}</p>
                  </div>
                  <button type="button" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" onClick={() => run(control)}>Exécuter</button>
                </div>
                {item ? <div className="mt-4 text-sm text-slate-600">Statut: <span className="font-semibold text-slate-900">{item.status}</span></div> : null}
              </article>
            );
          })}
          {results.length > 0 ? (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Résultats</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {results.map((result) => <li key={result.label} className={result.ok ? 'text-emerald-700' : 'text-red-700'}>{result.label}: {result.message}</li>)}
              </ul>
            </div>
          ) : null}
          {loading ? <p className="rounded-xl border bg-white p-4 text-sm text-slate-500">Chargement des checks…</p> : null}
        </section>
      </main>
    </div>
  );
}
