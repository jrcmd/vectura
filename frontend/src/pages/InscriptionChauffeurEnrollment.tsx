import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type PageState = 'loading' | 'ready' | 'invalid' | 'accepted' | 'error';

export default function InscriptionChauffeurEnrollment(): JSX.Element {
  const { invitationId } = useParams<{ invitationId: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const invitation = useMemo(() => {
    // Only used for local display; actual state is fetched fresh below
    return null;
  }, []);

  useEffect(() => {
    if (!invitationId) {
      setState('invalid');
      setError('Identifiant d\'invitation manquant.');
      return;
    }
    // Check invitation validity
    const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
    fetch(`${apiBase}/admin/enrollment/invitations`)
      .then((r) => r.json().catch(() => null))
      .then((data) => {
        const list = (data as { ok?: boolean; invitations?: Array<Record<string, unknown>> } | null)?.invitations ?? [];
        const found = list.find((inv) => (inv.invitationId as string) === invitationId);
        if (!found) {
          setState('invalid');
          setError('Invitation introuvable.');
        } else if (found.status === 'ACCEPTED') {
          setState('accepted');
        } else if (found.status === 'EXPIRED') {
          setState('invalid');
          setError('Cette invitation a expiré.');
        } else {
          setState('ready');
        }
      })
      .catch(() => {
        setState('error');
        setError('Erreur réseau.');
      });
  }, [invitationId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!invitationId) return;
    if (password.length < 8) {
      setError('Mot de passe trop court (minimum 8 caractères).');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    try {
      const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
      const res = await fetch(`${apiBase}/enrollment/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId, password, firstName, lastName }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string; accessToken?: string; refreshToken?: string } | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message ?? 'Inscription impossible.');
      }

      // Auto-login
      if (data.accessToken && data.refreshToken) {
        localStorage.setItem('vectura.token', data.accessToken);
        localStorage.setItem('vectura.refreshToken', data.refreshToken);
        localStorage.setItem('vectura.user', JSON.stringify({ id: data.accessToken, role: 'CHAUFFEUR', status: 'EN_ATTENTE' }));
      }

      navigate('/chauffeur/missions/active');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setSubmitting(false);
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <main className="max-w-xl mx-auto p-4">
          <p className="text-sm text-slate-500">Vérification de l&apos;invitation…</p>
        </main>
      </div>
    );
  }

  if (state === 'invalid' || state === 'accepted' || state === 'error') {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <header className="p-4 border-b">
          <div className="font-extrabold">Vectura</div>
        </header>
        <main className="max-w-xl mx-auto p-4 space-y-4">
          <h1 className="text-2xl font-extrabold">Inscription chauffeur</h1>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error ?? 'Cette invitation a déjà été utilisée et n\'est plus valide.'}
          </div>
          <button
            type="button"
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            onClick={() => navigate('/')}
          >
            Retour à l&apos;accueil
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b">
        <div className="font-extrabold">Vectura — Inscription chauffeur</div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Inscription chauffeur</h1>
        <p className="text-sm text-slate-600">Vous avez été invité à rejoindre Vectura. Créez votre mot de passe pour finaliser votre inscription.</p>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Prénom (optionnel)</label>
            <input className="mt-1 w-full rounded-lg border px-3 py-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nom (optionnel)</label>
            <input className="mt-1 w-full rounded-lg border px-3 py-2" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirmez le mot de passe</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Inscription…' : 'Finaliser mon inscription'}
          </button>
        </form>
      </main>
    </div>
  );
}
