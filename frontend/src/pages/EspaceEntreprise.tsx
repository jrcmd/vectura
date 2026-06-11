import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MissionCreate from './MissionCreate';

export default function EspaceEntreprise(): JSX.Element {
  const navigate = useNavigate();
  const companyRaw = typeof window !== 'undefined' ? localStorage.getItem('vectura.user') : null;
  const company = companyRaw ? (() => { try { return JSON.parse(companyRaw); } catch { return null; } })() : null;

  const companyLabel = useMemo(() => {
    if (!company) return 'Espace entreprise';
    return company.companyName || company.email || 'Espace entreprise';
  }, [company]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — {companyLabel}</div>
        <div className="flex gap-3">
          <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/companies/mission/create')}>
            Créer une mission
          </button>
          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            onClick={() => {
              localStorage.removeItem('vectura.token');
              localStorage.removeItem('vectura.refreshToken');
              localStorage.removeItem('vectura.user');
              navigate('/');
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Profil</h2>
            <p className="text-sm text-slate-600 mt-1">Informations société.</p>
            <div className="mt-4">
              <button
                type="button"
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
                onClick={() => navigate('/profil-entreprise')}
              >
                Voir mon profil
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Missions</h2>
            <p className="text-sm text-slate-600 mt-1">Publiez et suivez vos missions.</p>
            <div className="mt-4">
              <MissionCreate />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
