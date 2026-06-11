import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function MissionDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mission, setMission] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
  const headers: Record<string, string> = {};
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/driver/missions/${id}`, { headers });
        const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
        if (!res.ok || !data?.ok) throw new Error((data?.message as string) ?? 'Erreur');
        if (!cancelled) setMission(data.mission as Record<string, unknown>);
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [apiBase, id, headers]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Détail mission</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/chauffeur/dashboard')}>
          Retour
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Chargement…</p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        ) : mission ? (
          <>
            <h1 className="text-2xl font-extrabold">{mission.title as string}</h1>
            <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3 text-sm">
              <div>
                <span className="font-semibold text-slate-900">Lieu</span>
                <div className="text-slate-700">{mission.location as string}</div>
              </div>
              <div>
                <span className="font-semibold text-slate-900">Date et horaires</span>
                <div className="text-slate-700">
                  {new Date(mission.missionDate as string).toLocaleDateString('fr-FR')} • {mission.startTime as string}
                  {mission.endTime ? ` → ${mission.endTime as string}` : ''}
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-900">Type de camion</span>
                <div className="text-slate-700">{mission.truckType as string}</div>
              </div>
              <div>
                <span className="font-semibold text-slate-900">Taux horaire</span>
                <div className="text-slate-700">{mission.hourlyRate as number} €/h</div>
              </div>
              {mission.description ? (
                <div>
                  <span className="font-semibold text-slate-900">Description</span>
                  <div className="text-slate-700">{mission.description as string}</div>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition"
              onClick={() => alert('Acceptation de mission (à brancher avec STORY 5.x).')}
            >
              Accepter la mission
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-600">Mission introuvable.</p>
        )}
      </main>
    </div>
  );
}
