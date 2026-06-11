import { useCallback, useEffect, useState } from 'react';

export type DriverInvoice = {
  id: string;
  invoiceNumber: string;
  invoiceUrl: string | null;
  weekStart: string;
  weekEnd: string;
  totalAmountBilled: number;
  totalAmountDriver: number;
  totalMargin: number;
  status: string;
  generatedAt: string | null;
};

type DriverInvoiceResponse = { ok: true; invoices: DriverInvoice[] } | { ok: false; message: string };

function errorMessage(data: DriverInvoiceResponse | null): string {
  return data && 'message' in data ? data.message : 'Erreur';
}

export function useDriverInvoices() {
  const apiBase = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000/api';
  const [invoices, setInvoices] = useState<DriverInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function token() {
    return typeof window !== 'undefined' ? localStorage.getItem('vectura.token') : null;
  }

  function headers(): Record<string, string> {
    const bearer = token();
    return bearer ? { Authorization: `Bearer ${bearer}` } : {};
  }

  const fetchInvoices = useCallback(async () => {
    const bearer = token();
    if (!bearer) {
      setInvoices([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/billing/invoices`, { headers: headers() });
      const data = (await res.json().catch(() => null)) as DriverInvoiceResponse | null;
      if (!res.ok || !data?.ok) throw new Error(errorMessage(data));
      setInvoices(data.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  async function downloadInvoice(id: string, filename: string, format: 'pdf' | 'csv' | 'excel') {
    const bearer = token();
    if (!bearer) return;

    const res = await fetch(`${apiBase}/billing/invoices/${id}/${format}`, { headers: headers() });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      throw new Error(data?.message ?? 'Téléchargement impossible');
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, loading, error, fetchInvoices, downloadInvoice };
}
