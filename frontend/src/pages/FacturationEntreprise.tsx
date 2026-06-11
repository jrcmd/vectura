import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyInvoices } from '../hooks/useCompanyInvoices';

export default function FacturationEntreprise(): JSX.Element {
  const navigate = useNavigate();
  const { invoices, loading, error, generateInvoice, downloadInvoice } = useCompanyInvoices();
  const [weekStart, setWeekStart] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  async function handleGenerate() {
    setActionLoading(true);
    try {
      await generateInvoice(weekStart || undefined);
      setWeekStart('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDownload(id: string, invoiceNumber: string, format: 'pdf' | 'csv' | 'excel') {
    setActionLoading(true);
    try {
      const extension = format === 'excel' ? 'xls' : format;
      await downloadInvoice(id, `${invoiceNumber}.${extension}`, format);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Téléchargement impossible');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="font-extrabold">Vectura — Facturation entreprise</div>
        <button type="button" className="text-sm text-blue-700 hover:text-blue-800" onClick={() => navigate('/espace/entreprise')}>Retour</button>
      </header>
      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-extrabold">Factures hebdomadaires</h1>
        <div className="rounded-xl border p-4 space-y-3">
          <label className="block text-sm font-medium">Générer une facture</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={weekStart}
              onChange={(event) => setWeekStart(event.target.value)}
              className="rounded-lg border px-3 py-2 text-sm flex-1"
              placeholder="Semaine du lundi"
            />
            <button
              type="button"
              className="rounded-lg bg-blue-700 text-white px-4 py-2 text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
              onClick={handleGenerate}
              disabled={actionLoading}
            >
              Générer
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement…</p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-slate-600">Aucune facture disponible.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="rounded-xl border p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{invoice.invoiceNumber}</div>
                  <div className="text-xs text-slate-500">Semaine du {new Date(invoice.weekStart).toLocaleDateString('fr-FR')} au {new Date(invoice.weekEnd).toLocaleDateString('fr-FR')}</div>
                  <div className="text-xs text-slate-500">{invoice.status} • {invoice.totalAmountBilled.toFixed(2)} €</div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50" onClick={() => handleDownload(invoice.id, invoice.invoiceNumber, 'pdf')}>PDF</button>
                  <button type="button" className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50" onClick={() => handleDownload(invoice.id, invoice.invoiceNumber, 'csv')}>CSV</button>
                  <button type="button" className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50" onClick={() => handleDownload(invoice.id, invoice.invoiceNumber, 'excel')}>Excel</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
