import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import LandingPublic from './pages/LandingPublic';
import InscriptionChauffeur from './pages/InscriptionChauffeur';
import InscriptionEntreprise from './pages/InscriptionEntreprise';

export default function App(): JSX.Element {
  return (
    <Routes>
      {/* Landing publique */}
      <Route path="/" element={<LandingPublic />} />

      {/* Pages placeholders pour relier les CTA acquisition */}
      <Route path="/inscription/chauffeur" element={<InscriptionChauffeur />} />
      <Route path="/inscription/entreprise" element={<InscriptionEntreprise />} />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


