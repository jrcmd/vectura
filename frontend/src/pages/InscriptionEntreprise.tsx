import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type RegisterCompanyPayload = {
  email: string;
  password: string;
  companyName: string;
  siret: string;
  address: string;
};

export default function InscriptionEntreprise(): JSX.Element {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterCompanyPayload>({
    email: '',
    password: '',
    companyName: '',
    siret: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = Boolean(
    form.email && form.email.includes('@') &&
    form.password.length >= 8 &&
    form.companyName.trim().length >= 2,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError('Veuillez vérifier les champs du formulaire.');
      return;
    }

    try {
      setSubmitting(true);
      const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

      const res = await fetch(`${apiBase}/companies/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message ?? 'Erreur lors de l’inscription.');
        return;
      }

      setSuccess('Compte entreprise créé avec succès. Vous pouvez vous connecter.');
      setTimeout(() => navigate('/connexion-entreprise'), 1500);
    } catch {
      setError('Erreur réseau. Vérifiez que le backend tourne.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
<header className="p-4 border-b flex items-center justify-between">
        <div className="font-extrabold" aria-label="Vectura - Accueil">Vectura</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800 focus-visible" onClick={() => navigate('/')} aria-label="Retour à l'accueil">
          Retour à l'accueil
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold">Inscription entreprise</h1>
        <p className="mt-2 text-slate-600">Créez votre espace pour publier des missions.</p>

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4" noValidate aria-describedby={error ? 'form-error' : undefined}>
          {error ? (
            <div id="form-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm" aria-live="polite">{error}</div>
          ) : null}
          {success ? (
            <div id="form-success" role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-sm" aria-live="polite">{success}</div>
          ) : null}

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium">Nom de l'entreprise</label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus-visible"
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              placeholder="Ex: Transports Dupont"
              autoComplete="organization"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="email-company" className="block text-sm font-medium">Email professionnel</label>
            <input
              id="email-company"
              name="email"
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus-visible"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="contact@entreprise.fr"
              autoComplete="email"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="password-company" className="block text-sm font-medium">Mot de passe</label>
            <input
              id="password-company"
              name="password"
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus-visible"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Au moins 8 caractères"
              autoComplete="new-password"
              aria-required="true"
              aria-describedby="password-help"
            />
            <div id="password-help" className="mt-1 text-xs text-slate-500">Au moins 8 caractères requis.</div>
          </div>

          <div>
            <label htmlFor="siret" className="block text-sm font-medium">SIRET (optionnel)</label>
            <input
              id="siret"
              name="siret"
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus-visible"
              value={form.siret}
              onChange={(e) => setForm((f) => ({ ...f, siret: e.target.value }))}
              placeholder="Ex: 12345678900012"
              autoComplete="organization-number"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium">Adresse</label>
            <input
              id="address"
              name="address"
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus-visible"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Adresse du siège"
              autoComplete="street-address"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="rounded-xl bg-gray-900 px-5 py-3 text-center font-semibold text-white hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible"
            aria-disabled={!canSubmit || submitting}
          >
            {submitting ? 'Création...' : 'Créer mon compte entreprise'}
          </button>
        </form>
      </main>
    </div>
  );
}
