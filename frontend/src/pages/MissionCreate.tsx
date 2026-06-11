import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type MissionCreatePayload = {
  title: string;
  description: string;
  location: string;
  missionDate: string;
  startTime: string;
  endTime: string;
  truckType: string;
  hourlyRate: string;
  favoritePriorityHours: number;
};

const MIN_RATES: Record<string, number> = {
  PL: 25,
  SPL: 30,
  ADR: 35,
  FRIGO: 35,
};

export default function MissionCreate(): JSX.Element {
  const navigate = useNavigate();
  const [form, setForm] = useState<MissionCreatePayload>({
    title: '',
    description: '',
    location: '',
    missionDate: '',
    startTime: '',
    endTime: '',
    truckType: 'PL',
    hourlyRate: '',
    favoritePriorityHours: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentMinRate = MIN_RATES[form.truckType] ?? 25;
  const hourlyRateNum = Number(form.hourlyRate);
  const rateError = form.hourlyRate ? (hourlyRateNum < currentMinRate ? `Le taux horaire minimum pour ${form.truckType} est de ${currentMinRate} €/h` : null) : null;

  const canSubmit = Boolean(
    form.title.trim() &&
    form.location.trim() &&
    form.missionDate &&
    form.startTime &&
    form.truckType &&
    hourlyRateNum >= currentMinRate,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError('Veuillez vérifier les champs requis.');
      return;
    }

    try {
      setSubmitting(true);
      const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
      const token = localStorage.getItem('vectura.token');
      if (!token) throw new Error('Token manquant');

      const res = await fetch(`${apiBase}/companies/missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message ?? 'Erreur lors de la création.');
        return;
      }

      setSuccess('Mission publiée.');
      setTimeout(() => navigate('/espace/entreprise'), 800);
    } catch {
      setError('Erreur réseau. Vérifiez que le backend tourne.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <h3 className="text-base font-semibold text-slate-900">Nouvelle mission</h3>
      {error ? (<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>) : null}
      {rateError ? (<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{rateError}</div>) : null}
      {success ? (<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>) : null}

      <div>
        <label className="block text-sm font-medium text-slate-700">Titre</label>
        <input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Lieu</label>
        <input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input type="date" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.missionDate} onChange={(e) => setForm((f) => ({ ...f, missionDate: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Début</label>
          <input type="time" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Fin</label>
          <input type="time" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Type de camion</label>
          <select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.truckType} onChange={(e) => setForm((f) => ({ ...f, truckType: e.target.value }))}>
            <option value="PL">PL</option>
            <option value="SPL">SPL</option>
            <option value="ADR">ADR</option>
            <option value="FRIGO">FRIGO</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Taux horaire (€)</label>
          <input type="number" min="0" step="0.5" className="mt-1 w-full rounded-lg border px-3 py-2" value={form.hourlyRate} onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))} required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea className="mt-1 w-full rounded-lg border px-3 py-2" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="favPriority"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          checked={form.favoritePriorityHours > 0}
          onChange={(e) => setForm((f) => ({ ...f, favoritePriorityHours: e.target.checked ? 2 : 0 }))}
        />
        <label htmlFor="favPriority" className="text-sm text-slate-700">Réserver d’abord aux favoris (2h)</label>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Publication...' : 'Publier la mission'}
      </button>
    </form>
  );
}
