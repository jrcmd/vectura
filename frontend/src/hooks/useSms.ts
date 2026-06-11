import { useCallback, useEffect, useState } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';

function headers(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useSms() {
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const [invitations, setInvitations] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/sms/logs`, { headers: headers() });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; logs?: Array<Record<string, unknown>>; message?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
      setLogs(data.logs ?? []);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/enrollment/invitations`, { headers: headers() });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; invitations?: Array<Record<string, unknown>>; message?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Erreur');
      setInvitations(data.invitations ?? []);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateCredentials = useCallback(async (provider: 'twilio' | 'supabase') => {
    const res = await fetch(`${API_BASE}/sms/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ provider }),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Validation échouée');
    return data;
  }, []);

  const sendSms = useCallback(async (to: string, body: string, provider: 'twilio' | 'supabase') => {
    const res = await fetch(`${API_BASE}/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ to, body, provider }),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
    if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Envoi échoué');
    return data;
  }, []);

  const createInvitation = useCallback(async (params: {
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    inviteeRole?: 'CHAUFFEUR' | 'ENTREPRISE';
    expiresInHours?: number;
    sendSms?: boolean;
    messageTemplate?: string;
    provider: 'twilio' | 'supabase';
  }) => {
    const res = await fetch(`${API_BASE}/admin/enrollment/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify(params),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; invitationId?: string; message?: string } | null;
    if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Création invitation échouée');
    return data;
  }, []);

  useEffect(() => {
    loadLogs();
    loadInvitations();
  }, [loadLogs, loadInvitations]);

  return {
    logs,
    invitations,
    loading,
    error,
    reload: () => { loadLogs(); loadInvitations(); },
    validateCredentials,
    sendSms,
    createInvitation,
  };
}
