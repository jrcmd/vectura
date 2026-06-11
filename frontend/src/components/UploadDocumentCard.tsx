import React, { useCallback, useState } from 'react';

type DocType = {
  value: string;
  label: string;
};

const DOCUMENT_TYPES: DocType[] = [
  { value: 'PERMIS_C', label: 'Permis C' },
  { value: 'PERMIS_CE', label: 'Permis CE' },
  { value: 'FIMO', label: 'FIMO' },
  { value: 'FCO', label: 'FCO' },
  { value: 'CARTE_CHRONO', label: 'Carte conducteur' },
  { value: 'KBIS', label: 'KBIS' },
  { value: 'URSSAF', label: 'Attestation URSSAF' },
  { value: 'RC_PRO', label: 'RC Pro' },
];

type UploadDocumentCardProps = {
  onUploaded: () => void;
};

export default function UploadDocumentCard({ onUploaded }: UploadDocumentCardProps) {
  const [type, setType] = useState(DOCUMENT_TYPES[0].value);
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      if (!file) {
        setError('Veuillez sélectionner un fichier.');
        return;
      }

      const form = new FormData();
      form.append('file', file);
      form.append('type', type);
      if (expiryDate) form.append('expiryDate', new Date(expiryDate).toISOString());

      try {
        setSubmitting(true);
        const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
        const res = await fetch(`${apiBase}/documents/upload`, {
          method: 'POST',
          body: form,
          headers: {
            ...(localStorage.getItem('vectura.token') ? { Authorization: `Bearer ${localStorage.getItem('vectura.token')}` } : {}),
          },
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError(data?.message ?? 'Upload impossible.');
          return;
        }

        setSuccess('Document envoyé.');
        setFile(null);
        setExpiryDate('');
        onUploaded();
      } catch (err) {
        if (err instanceof Error && err.message === 'LIMIT_FILE_SIZE') {
          setError('Fichier trop volumineux.');
        } else {
          setError('Erreur réseau. Vérifiez que le backend tourne.');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [file, type, expiryDate, onUploaded],
  );

  return (
    <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type de document</label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {DOCUMENT_TYPES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date d’expiration</label>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fichier</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            onChange={(e) => {
              const selected = e.target.files?.[0] ?? null;
              if (selected && selected.size > 15 * 1024 * 1024) {
                setError('Fichier trop volumineux (max 15 Mo).');
                setFile(null);
              } else {
                setError(null);
                setFile(selected);
              }
            }}
          />
        </div>
      </div>

      {error ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
      {success ? <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Envoi...' : 'Envoyer le document'}
      </button>
    </form>
  );
}
