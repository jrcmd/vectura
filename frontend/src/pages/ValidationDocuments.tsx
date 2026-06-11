import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type DocumentItem = {
  id: string;
  type: string;
  fileUrl: string | null;
  expiryDate: string | null;
  status: string;
  uploadedAt: string;
  validatedAt: string | null;
  validatedBy: string | null;
  rejectionReason: string | null;
};

export default function ValidationDocuments(): JSX.Element {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<{ firstName: string | null; lastName: string | null; email: string | null; phone: string | null } | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;

  useEffect(() => {
    if (!token) return navigate('/connexion-entreprise');
    if (!driverId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/admin/drivers/${driverId}/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
        if (!cancelled) {
          setDriver(data.driver);
          setDocuments(data.documents ?? []);
        }
      } catch (err) {
        if (!cancelled && err instanceof Error) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token, navigate, driverId, apiBase]);

  async function validateDocument(documentId: string) {
    try {
      setActionLoading(documentId);
      const res = await fetch(`${apiBase}/admin/documents/validate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documentId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
      setDocuments((prev) => prev.map((d) => d.id === documentId ? { ...d, status: 'VALIDE', validatedAt: new Date().toISOString(), validatedBy: token } : d));
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectDocument(documentId: string) {
    const reason = prompt('Motif du rejet :');
    if (!reason) return;
    try {
      setActionLoading(documentId);
      const res = await fetch(`${apiBase}/admin/documents/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documentId, reason }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
      setDocuments((prev) => prev.map((d) => d.id === documentId ? { ...d, status: 'REJETE', validatedAt: new Date().toISOString(), validatedBy: token, rejectionReason: reason } : d));
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Validation documents</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/admin/chauffeurs')}>Retour</button>
      </header>
      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {driver ? (
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h1 className="text-2xl font-extrabold">Dossier de {driver.lastName} {driver.firstName}</h1>
            <div className="mt-2 text-sm text-slate-600">{driver.email} • {driver.phone ?? 'Pas de téléphone'}</div>
          </div>
        ) : null}

        {loading ? (<p className="text-sm text-slate-500">Chargement…</p>) : error ? (<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>) : (
          <div className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-slate-600">Aucun document.</p>
            ) : documents.map((doc) => (
              <div key={doc.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{doc.type}</div>
                    <div className="text-xs text-slate-500">
                      Déposé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')} • Expiration: {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('fr-FR') : 'Non renseignée'}
                    </div>
                    {doc.rejectionReason ? <div className="text-xs text-red-700">Motif: {doc.rejectionReason}</div> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status !== 'VALIDE' ? (
                      <button
                        type="button"
                        disabled={actionLoading === doc.id}
                        onClick={() => validateDocument(doc.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                      >
                        Valider
                      </button>
                    ) : null}
                    {doc.status !== 'REJETE' ? (
                      <button
                        type="button"
                        disabled={actionLoading === doc.id}
                        onClick={() => rejectDocument(doc.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-60"
                      >
                        Rejeter
                      </button>
                    ) : null}
                    {doc.fileUrl ? (
                      <a className="text-blue-700 hover:text-blue-800 text-xs" href={`${apiBase}${doc.fileUrl}`} target="_blank" rel="noreferrer">Voir</a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
