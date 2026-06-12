import { useEffect, useMemo, useState } from 'react';

export type QaCheckStatus = 'TODO' | 'DOING' | 'PASS' | 'FAIL' | 'BLOCKED';

export type QaCheckItem = {
  suite: string;
  name: string;
  status: QaCheckStatus;
  notes?: string | null;
  owner?: string | null;
  dueDate?: string | null;
};

const STORAGE_KEY = 'vectura.qa.checks';

/** Hook pour gérer les checks QA : chargement, mise à jour et persistance locale */
export function useQaChecklist(suite: string) {
  const [items, setItems] = useState<QaCheckItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = useMemo(() => {
    const base = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api';
    return base.endsWith('/api') ? base : `${base}/api`;
  }, []);

  function headers(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function loadRemote() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/qa/checks`, { headers: headers() });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; checks?: QaCheckItem[]; message?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Impossible de charger les checks QA.');
      setItems(data.checks?.filter((item) => item.suite === suite) ?? []);
    } catch (err) {
      const fallback = loadLocal();
      setItems(fallback.filter((item) => item.suite === suite));
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateItem(item: QaCheckItem, patch: Partial<QaCheckItem>) {
    const next = { ...item, ...patch };
    setItems((current) => current.map((entry) => (entry.name === item.name ? next : entry)));
    try {
      const res = await fetch(`${apiBaseUrl}/qa/checks/${encodeURIComponent(item.suite)}/${encodeURIComponent(item.name)}`, {
        method: 'PATCH',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite: item.suite, name: item.name, status: next.status, notes: next.notes, owner: next.owner, dueDate: next.dueDate }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string; qaCheck?: QaCheckItem } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.message ?? 'Impossible de mettre à jour le check QA.');
      saveLocal();
    } catch (err) {
      setItems((current) => current.map((entry) => (entry.name === item.name ? item : entry)));
      if (err instanceof Error) setError(err.message);
    }
  }

  function loadLocal(): QaCheckItem[] {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      return raw ? (JSON.parse(raw) as QaCheckItem[]) : [];
    } catch {
      return [];
    }
  }

  function saveLocal() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  useEffect(() => {
    const local = loadLocal();
    if (local.length > 0) setItems(local.filter((item) => item.suite === suite));
  }, [suite]);

  return { items, loading, error, loadRemote, updateItem, saveLocal };
}
