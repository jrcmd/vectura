import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type NonCompliantDriver = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

type ReminderStatus = Record<string, 'idle' | 'loading' | 'sent' | 'error'>;

export default function ConformiteVigilance(): JSX.Element {
  const navigate = useNavigate();
  const [nonCompliant, setNonCompliant] = useState<NonCompliantDriver[]>([]);
  const [reminderStatus, setReminderStatus] = useState<ReminderStatus>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;

  useEffect(() => {
    if (!token) return navigate('/connexion-entreprise');
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/admin/compliance/urssaf`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
        if (!cancelled) setNonCompliant(data.nonCompliant ?? []);
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token, navigate]);

  async function handleRemind(driverId: string) {
    setReminderStatus((s) => ({ ...s, [driverId]: 'loading' }));
    try {
      const res = await fetch(`${apiBase}/admin/compliance/urssaf/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ driverId }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
      setReminderStatus((s) => ({ ...s, [driverId]: 'sent' }));
    } catch (err) {
      setReminderStatus((s) => ({ ...s, [driverId]: 'error' }));
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Conformité vigilance</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/admin/dashboard')}>Retour</button>
      </header>
      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Attestations URSSAF à renouveler</h1>
        {loading ? (<p className="text-sm text-slate-500">Chargement…</p>) : error ? (<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>) : nonCompliant.length === 0 ? (
          <p className="text-sm text-slate-600">Tous les chauffeurs sont conformes.</p>
        ) : (
          <div className="space-y-2 text-sm">
            {nonCompliant.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <span className="font-medium">{d.lastName} {d.firstName}</span>
                  <span className="text-slate-500 ml-2">{d.email}</span>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                  disabled={reminderStatus[d.id] === 'loading' || reminderStatus[d.id] === 'sent'}
                  onClick={() => handleRemind(d.id)}
                >
                  {reminderStatus[d.id] === 'loading' ? 'Envoi…' : reminderStatus[d.id] === 'sent' ? 'Relance envoyée ✓' : 'Relancer'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
