import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StatusBanner from '../components/StatusBanner';

export default function TableauBordChauffeur(): JSX.Element {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
  const headers: Record<string, string> = {};
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  useEffect(() => {
    if (!session) {
      navigate('/connexion/chauffeur', { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function loadDocuments() {
      setLoadingDocs(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/driver/documents`, { headers });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) {
          throw new Error(data?.message ?? 'Erreur lors du chargement des documents');
        }
        if (!cancelled) setDocuments(data.documents ?? []);
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoadingDocs(false);
      }
    }

    async function loadMissions() {
      setLoadingMissions(true);
      try {
        const res = await fetch(`${apiBase}/driver/missions`, { headers });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) {
          throw new Error(data?.message ?? 'Erreur lors du chargement des missions');
        }
        if (!cancelled) setMissions(data.missions ?? []);
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoadingMissions(false);
      }
    }

    loadDocuments();
    loadMissions();

    return () => {
      cancelled = true;
    };
  }, [apiBase, session]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Espace chauffeur</div>
        <div className="flex gap-3">
          <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/depot-documents')}>Déposer un document</button>
          <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/chauffeur/missions/active')}>Missions en cours</button>
          <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/chauffeur/missions/past')}>Missions passées</button>
          <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/chauffeur/billing')}>Facturation</button>
          <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/connexion/chauffeur')}>Retour</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <StatusBanner status={session?.status} />

        {session?.status === 'EN_ATTENTE' ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Votre compte est en attente de validation par un administrateur. Vous ne pouvez pas encore consulter les missions.
          </div>
        ) : session?.status === 'SUSPENDU' || session?.status === 'RADIE' ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            Votre compte est {session.status === 'SUSPENDU' ? 'suspendu' : 'radi�'} : l&apos;accès aux missions est bloqué.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        ) : null}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
            <p className="text-sm text-slate-600 mt-1">État de votre dépôt documentaire.</p>
            <div className="mt-3">
              {loadingDocs ? (
                <p className="text-sm text-slate-500">Chargement…</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {documents.map((doc) => {
                    const statusColor =
                      doc.status === 'VALIDE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.status === 'REJETE'
                          ? 'bg-red-100 text-red-800'
                          : doc.status === 'EXPIRE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800';
                    return (
                      <li key={doc.type} className="flex items-start justify-between rounded-xl border p-3">
                        <span className="font-medium text-slate-800">{doc.type}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                          {doc.status}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <button
              type="button"
              className="mt-4 text-sm font-medium text-blue-700 hover:text-blue-800"
              onClick={() => navigate('/depot-documents')}
            >
              Gérer mes documents
            </button>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Missions disponibles</h2>
            <p className="text-sm text-slate-600 mt-1">Missions compatibles avec votre profil.</p>
            <div className="mt-3">
              {loadingMissions ? (
                <p className="text-sm text-slate-500">Chargement…</p>
              ) : missions.length === 0 ? (
                <p className="text-sm text-slate-600">Aucune mission disponible pour le moment.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {missions.map((mission) => (
                    <li key={mission.id} className="rounded-xl border p-3 text-slate-800">
                      <button
                        type="button"
                        onClick={() => navigate(`/chauffeur/missions/${mission.id}`)}
                        className="w-full text-left hover:bg-slate-50"
                      >
                        <div className="font-medium">{mission.title}</div>
                        <div className="text-xs text-slate-500">
                          {mission.location} • {new Date(mission.missionDate).toLocaleDateString('fr-FR')} • {mission.startTime}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
