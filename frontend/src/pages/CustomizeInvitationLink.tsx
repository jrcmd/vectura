import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomizeInvitationLink(): JSX.Element {
  const navigate = useNavigate();
  const [invitationId, setInvitationId] = useState('ENR-DEMO123');
  const [role, setRole] = useState<'CHAUFFEUR' | 'ENTREPRISE'>('CHAUFFEUR');
  const [customMessage, setCustomMessage] = useState('Bonjour {prenom}, rejoignez Vectura ! Inscrivez-vous ici : https://vectura.fr/enroll/{invitationId}');

  const preview = useMemo(() => {
    const roleLabel = role === 'ENTREPRISE' ? 'entreprise' : 'chauffeur';
    return (
      customMessage
        .replace(/{invitationId}/g, invitationId || '___')
        .replace(/{prenom}/g, 'Jean')
        .replace(/{nom}/g, 'Dupont')
        .replace(/{role}/g, roleLabel)
    );
  }, [customMessage, invitationId, role]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="font-extrabold">Vectura — Personnalisation invitation</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/admin/dashboard')}>Retour</button>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Personnaliser le lien et le SMS d&apos;invitation</h1>

        <section className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Variables disponibles</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <code className="rounded-lg border px-2 py-1">{'{invitationId}'}</code>
            <code className="rounded-lg border px-2 py-1">{'{prenom}'}</code>
            <code className="rounded-lg border px-2 py-1">{'{nom}'}</code>
            <code className="rounded-lg border px-2 py-1">{'{role}'}</code>
          </div>
          <p className="text-sm text-slate-600">Ces variables sont remplacées automatiquement lors de l&apos;envoi du SMS.</p>
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Template du message</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700">Rôle de l&apos;invité</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value as 'CHAUFFEUR' | 'ENTREPRISE')}
            >
              <option value="CHAUFFEUR">Chauffeur</option>
              <option value="ENTREPRISE">Entreprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">ID invitation (aperçu)</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={invitationId}
              onChange={(e) => setInvitationId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Message</label>
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2"
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
          </div>
          <p className="text-sm text-slate-600">Lien généré : <code className="rounded-lg border px-2 py-1">https://vectura.fr/enroll/{invitationId || '___'}</code></p>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <h2 className="text-lg font-semibold text-blue-900">Prévisualisation SMS</h2>
          <p className="text-sm text-blue-900 mt-2">{preview}</p>
        </section>
      </main>
    </div>
  );
}
