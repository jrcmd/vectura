import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function QualificationChauffeur(): JSX.Element {
  const { session } = useAuth();
  const [qualification, setQualification] = useState<{
    hasPermisC: boolean;
    hasPermisCE: boolean;
    hasADR: boolean;
    hasFrigo: boolean;
    qualificationsValid: boolean;
    blockingDocuments: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
  const headers: Record<string, string> = {};
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/driver/qualification`, { headers });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
        if (!cancelled) setQualification(data.qualification);
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [apiBase, session, headers]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Mes qualifications</h1>
        {loading ? (<p className="text-sm text-slate-500">Chargement…</p>) : error ? (<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>) : qualification ? (
          <div className="space-y-3">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">État du profil</h2>
              <p className={`mt-2 text-sm ${qualification.qualificationsValid ? 'text-emerald-800' : 'text-amber-800'}`}>
                {qualification.qualificationsValid ? 'Qualifications valides' : 'Qualifications incomplètes ou non validées'}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Compétences</h2>
              <ul className="mt-2 space-y-2 text-sm">
                <li>Permis C : {qualification.hasPermisC ? '✅' : '❌'}</li>
                <li>Permis CE : {qualification.hasPermisCE ? '✅' : '❌'}</li>
                <li>ADR : {qualification.hasADR ? '✅' : '❌'}</li>
                <li>Frigo : {qualification.hasFrigo ? '✅' : '❌'}</li>
              </ul>
            </div>

            {qualification.blockingDocuments.length > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <h2 className="text-base font-semibold">Documents bloquants</h2>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {qualification.blockingDocuments.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
