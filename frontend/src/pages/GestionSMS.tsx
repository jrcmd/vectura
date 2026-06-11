import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSms } from '../hooks/useSms';

export default function GestionSMS(): JSX.Element {
  const navigate = useNavigate();
  const { logs, invitations, loading, error, reload, validateCredentials, sendSms, createInvitation } = useSms();

  const [phone, setPhone] = useState('');
  const [template, setTemplate] = useState(
    'Vectura : vous êtes invité à créer un compte chauffeur. Rendez-vous sur https://vectura.fr/enroll/{invitationId} (valable 72h).',
  );
  const [provider, setProvider] = useState<'twilio' | 'supabase'>('twilio');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(72);
  const [inviteeRole, setInviteeRole] = useState<'CHAUFFEUR' | 'ENTREPRISE'>('CHAUFFEUR');
  const [success, setSuccess] = useState<string | null>(null);
  const [lastInvitationId, setLastInvitationId] = useState<string | null>(null);

  async function handleValidate() {
    try {
      setSuccess(null);
      await validateCredentials(provider);
      setSuccess(`Connexion ${provider} validée.`);
    } catch (err) {
      setSuccess(err instanceof Error ? err.message : 'Validation échouée.');
    }
  }

  async function handleSend() {
    try {
      setSuccess(null);
      const result = await createInvitation({
        phoneNumber: phone,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        inviteeRole,
        expiresInHours,
        sendSms: true,
        messageTemplate: template,
        provider,
      });
      setSuccess(`Invitation créée : ${result.invitationId}`);
      setLastInvitationId(result.invitationId ?? null);
      setPhone('');
      setFirstName('');
      setLastName('');
      reload();
    } catch (err) {
      setSuccess(err instanceof Error ? err.message : 'Erreur.');
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="font-extrabold">Vectura — Gestion SMS</div>
        <div className="flex items-center gap-3">
          <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/admin/dashboard')}>Retour</button>
          <button type="button" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50" onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Gestion SMS &amp; Invitations</h1>
        {error ? (<div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>) : null}
        {success ? (<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>) : null}
        {lastInvitationId ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            Lien d&apos;inscription : <code>https://vectura.fr/enroll/{lastInvitationId}</code>
          </div>
        ) : null}

        <section className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Paramètres SMS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Provider</label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'twilio' | 'supabase')}
              >
                <option value="twilio">Twilio</option>
                <option value="supabase">Supabase</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            onClick={handleValidate}
          >
            Tester la connexion
          </button>
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Nouvelle invitation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Téléphone</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                placeholder="+33612345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Rôle</label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={inviteeRole}
                onChange={(e) => setInviteeRole(e.target.value as 'CHAUFFEUR' | 'ENTREPRISE')}
              >
                <option value="CHAUFFEUR">Chauffeur</option>
                <option value="ENTREPRISE">Entreprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Prénom (optionnel)</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nom (optionnel)</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Expiration (heures)</label>
              <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2" value={expiresInHours} onChange={(e) => setExpiresInHours(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Message template ({'{invitationId}'} sera remplacé)</label>
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2"
              rows={3}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!phone || loading}
            onClick={handleSend}
          >
            Créer l&apos;invitation et envoyer par SMS
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Invitations récentes</h2>
              <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={reload}>Actualiser</button>
            </div>
            {loading ? (<p className="text-sm text-slate-500">Chargement…</p>) : (
              <div className="mt-3 space-y-2">
                {invitations.length === 0 ? <p className="text-sm text-slate-600">Aucune invitation.</p> : null}
                {invitations.map((inv) => (
                  <div key={inv.id as string} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{inv.invitationId as string}</span>
                      <span className="text-xs px-2 py-1 rounded-full border">{inv.status as string}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{(inv.phoneNumber as string)} — {(inv.firstName as string) || ''} {(inv.lastName as string) || ''}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Logs SMS récents</h2>
            {loading ? (<p className="text-sm text-slate-500">Chargement…</p>) : (
              <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                {logs.length === 0 ? <p className="text-sm text-slate-600">Aucun log.</p> : null}
                {logs.map((log) => (
                  <div key={log.id as string} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{(log.provider as string)?.toUpperCase()}</span>
                      <span className="text-xs px-2 py-1 rounded-full border">{log.status as string}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">À {(log.recipientPhone as string)} — {log.sentAt ? new Date(log.sentAt as string).toLocaleString('fr-FR') : new Date(log.createdAt as string).toLocaleString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
