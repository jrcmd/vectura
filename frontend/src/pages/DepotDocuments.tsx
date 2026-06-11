import React from 'react';
import { useNavigate } from 'react-router-dom';
import UploadDocumentCard from '../components/UploadDocumentCard';

export default function DepotDocuments(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="font-extrabold">Vectura</div>
        <button
          type="button"
          className="text-sm text-blue-700 hover:text-blue-800"
          onClick={() => navigate('/espace/chauffeur')}
        >
          Retour à l’espace chauffeur
        </button>
      </header>

      <main className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-extrabold">Dépôt de documents</h1>
        <p className="mt-2 text-slate-600">
          Déposez vos pièces justificatives. Le statut passera en <span className="font-semibold">EN_ATTENTE</span> jusqu’à validation.
        </p>

        <div className="mt-6 space-y-4">
          <UploadDocumentCard onUploaded={() => {}} />
        </div>

        <div className="mt-8 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
          <h2 className="text-base font-semibold">Documents requis</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Permis C ou CE</li>
            <li>FIMO ou FCO</li>
            <li>Carte conducteur (chronotachygraphe)</li>
            <li>KBIS (si société)</li>
            <li>Attestation URSSAF</li>
            <li>RC Pro</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
