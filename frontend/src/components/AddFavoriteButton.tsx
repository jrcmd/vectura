import React, { useState } from 'react';

type AddFavoriteButtonProps = {
  driverId: string;
  onChanged?: () => void;
};

export default function AddFavoriteButton({ driverId, onChanged }: AddFavoriteButtonProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    try {
      setSubmitting(true);
      const token = localStorage.getItem('vectura.token');
      if (!token) throw new Error('Non autorisé');
      const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
      const res = await fetch(`${apiBase}/companies/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ driverId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
      onChanged?.();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={submitting}
        onClick={onClick}
        className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-60"
      >
        Ajouter aux favoris
      </button>
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
