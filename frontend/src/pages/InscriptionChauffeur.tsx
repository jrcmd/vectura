import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type RegisterDriverPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
};

function validatePhoneFR(phone: string): boolean {
  // Format simple : 10 à 15 chiffres, avec ou sans +
  return /^\+?\d{10,15}$/.test(phone);
}

export default function InscriptionChauffeur(): JSX.Element {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterDriverPayload>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!form.email || !form.email.includes('@')) return false;
    if (form.password.length < 8) return false;
    if (!form.firstName.trim()) return false;
    if (!form.lastName.trim()) return false;
    if (!validatePhoneFR(form.phone)) return false;
    if (!form.city.trim()) return false;
    return true;
  }, [form]);

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

      const res = await fetch(`${apiBase}/drivers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message ?? 'Erreur lors de l’inscription.');
        return;
      }

      setSuccess('Inscription envoyée. Statut : EN_ATTENTE (validation admin requise).');
      // Petit guidage UX
      // (pas de flow complet d’auth encore dans ce sprint)
      setTimeout(() => navigate('/'), 1200);
    } catch (e) {
      setError('Erreur réseau. Vérifiez que le backend tourne.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
<header className="p-4 border-b flex items-center justify-between">
        <div className="font-extrabold" aria-label="Vectura - Accueil">Vectura</div>
        <button
          type="button"
          className="text-sm text-blue-700 hover:text-blue-800 focus-visible"
          onClick={() => navigate('/')}
          aria-label="Retour à l'accueil"
        >
          Retour à l'accueil
        </button>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold">Inscription chauffeur</h1>
        <p className="mt-2 text-slate-600">
          Remplissez vos informations. Votre compte sera placé en <span className="font-semibold">EN_ATTENTE</span>.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4" noValidate aria-describedby={error ? 'form-error' : undefined}>
          {error ? (
            <div id="form-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm" aria-live="polite">{error}</div>
          ) : null}
          {success ? (
            <div id="form-success" role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-sm" aria-live="polite">
              {success}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium">Nom</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus-visible"
                value={form.lastName}
                onChange={(ev) => setForm((f) => ({ ...f, lastName: ev.target.value }))}
                placeholder="Ex: Durand"
                autoComplete="family-name"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium">Prénom</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus-visible"
                value={form.firstName}
                onChange={(ev) => setForm((f) => ({ ...f, firstName: ev.target.value }))}
                placeholder="Ex: Paul"
                autoComplete="given-name"
                aria-required="true"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium">Téléphone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus-visible"
              value={form.phone}
              onChange={(ev) => setForm((f) => ({ ...f, phone: ev.target.value }))}
              placeholder="+33612345678"
              autoComplete="tel"
              aria-required="true"
              aria-describedby="phone-help"
            />
            <div id="phone-help" className="mt-1 text-xs text-slate-500">Format : 10 à 15 chiffres (avec ou sans +).</div>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium">Ville</label>
            <input
              id="city"
              name="city"
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus-visible"
              value={form.city}
              onChange={(ev) => setForm((f) => ({ ...f, city: ev.target.value }))}
              placeholder="Ex: Lyon"
              autoComplete="address-level2"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus-visible"
              value={form.email}
              onChange={(ev) => setForm((f) => ({ ...f, email: ev.target.value }))}
              placeholder="vous@exemple.fr"
              autoComplete="email"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus-visible"
              value={form.password}
              onChange={(ev) => setForm((f) => ({ ...f, password: ev.target.value }))}
              placeholder="Au moins 8 caractères"
              autoComplete="new-password"
              aria-required="true"
              aria-describedby="password-help"
            />
            <div id="password-help" className="mt-1 text-xs text-slate-500">Au moins 8 caractères requis.</div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="rounded-xl bg-blue-700 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible"
            aria-disabled={!canSubmit || submitting}
          >
            {submitting ? 'En cours...' : 'Créer mon compte'}
          </button>
        </form>
      </main>
    </div>
  );
}


