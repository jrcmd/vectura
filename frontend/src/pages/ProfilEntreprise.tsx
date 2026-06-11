import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilEntreprise(): JSX.Element {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ companyName?: string | null; siret?: string | null; address?: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('vectura.token');
        if (!token) return navigate('/connexion-entreprise');
        const res = await fetch((import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api') + '/companies/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
        if (!cancelled) setProfile(data.company);
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="font-extrabold">Vectura — Profil entreprise</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/espace/entreprise')}>Retour</button>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Mon profil</h1>
        {loading ? (<p className="text-sm text-slate-500">Chargement…</p>) : null}
        {error ? (<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>) : null}
        {profile ? (
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="rounded-xl border p-3"><span className="font-medium">Entreprise :</span> <span className="text-slate-700">{profile.companyName ?? ''}</span></div>
            <div className="rounded-xl border p-3"><span className="font-medium">SIRET :</span> <span className="text-slate-700">{profile.siret ?? ''}</span></div>
            <div className="rounded-xl border p-3"><span className="font-medium">Adresse :</span> <span className="text-slate-700">{profile.address ?? ''}</span></div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
