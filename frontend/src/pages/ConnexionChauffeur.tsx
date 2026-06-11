import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ConnexionChauffeur(): JSX.Element {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message ?? 'Connexion impossible.');
        return;
      }

      login({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      navigate('/');
    } catch {
      setError('Erreur réseau. Vérifiez que le backend tourne.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="font-extrabold">Vectura</div>
        <button
          type="button"
          className="text-sm text-blue-700 hover:text-blue-800"
          onClick={() => navigate('/')}
        >
          Retour à l’accueil
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold">Connexion chauffeur</h1>
        <p className="mt-2 text-slate-600">
          Accédez à votre espace chauffeur pour consulter vos missions.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm">{error}</div>
          ) : null}

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={!email || !password || submitting}
            className="rounded-xl bg-blue-700 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </main>
    </div>
  );
}
