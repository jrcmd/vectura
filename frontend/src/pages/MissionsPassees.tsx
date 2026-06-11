import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function MissionsPassees(): JSX.Element {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
  const headers: Record<string, string> = {};
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  useEffect(() => {
    if (!session) { navigate('/connexion/chauffeur', { replace: true }); return; }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/driver/missions?type=past`, { headers });
        const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
        if (!res.ok || !data?.ok) throw new Error((data?.message as string) ?? 'Erreur');
        if (!cancelled) setMissions((data.missions as any[]) ?? []);
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [apiBase, session, navigate, headers]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Missions passées</div>
        <div className="flex gap-3">
          <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/chauffeur/missions/active')}>Missions en cours</button>
          <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/chauffeur/dashboard')}>Retour</button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Historique des missions</h1>
        {loading ? (<p className="text-sm text-slate-500">Chargement…</p>) : error ? (<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>) : missions.length === 0 ? (<p className="text-sm text-slate-600">Aucune mission passée.</p>) : (
          <ul className="space-y-2 text-sm">
            {missions.map((m) => (
              <li key={m.id} className="rounded-xl border p-3">
                <div className="font-medium">{m.title}</div>
                <div className="text-xs text-slate-500">{m.location} • {new Date(m.missionDate).toLocaleDateString('fr-FR')} • {m.status}</div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
