import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import LandingPublic from './pages/LandingPublic';
import InscriptionChauffeur from './pages/InscriptionChauffeur';
import InscriptionEntreprise from './pages/InscriptionEntreprise';
import MentionsLegales from './pages/MentionsLegales';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import ConnexionChauffeur from './pages/ConnexionChauffeur';
import ConnexionEntreprise from './pages/ConnexionEntreprise';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DepotDocuments from './pages/DepotDocuments';
import TableauBordChauffeur from './pages/TableauBordChauffeur';
import MissionDetail from './pages/MissionDetail';
import EspaceEntreprise from './pages/EspaceEntreprise';
import ProfilEntreprise from './pages/ProfilEntreprise';
import MissionsActives from './pages/MissionsActives';
import MissionsPassees from './pages/MissionsPassees';
import FacturationChauffeur from './pages/FacturationChauffeur';
import FacturationEntreprise from './pages/FacturationEntreprise';
import FavorisEntreprise from './pages/FavorisEntreprise';
import QualificationChauffeur from './pages/QualificationChauffeur';
import MissionCreate from './pages/MissionCreate';
import DashboardAdmin from './pages/DashboardAdmin';
import GestionChauffeurs from './pages/GestionChauffeurs';
import ValidationDocuments from './pages/ValidationDocuments';
import SuiviMissions from './pages/SuiviMissions';
import ConformiteVigilance from './pages/ConformiteVigilance';
import Sanctions from './pages/Sanctions';
import GestionSMS from './pages/GestionSMS';
import CustomizeInvitationLink from './pages/CustomizeInvitationLink';
import InscriptionChauffeurEnrollment from './pages/InscriptionChauffeurEnrollment';
import QaFunctional from './pages/QaFunctional';
import QaSecurity from './pages/QaSecurity';
import Preproduction from './pages/Preproduction';
import Production from './pages/Production';
import Stabilization from './pages/Stabilization';
import { useAuth } from './hooks/useAuth';

function RequireDriver({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/connexion/chauffeur" replace />;
  return <>{children}</>;
}

function RequireCompany({ children }: { children: React.ReactNode }) {
  const companyRaw = typeof window !== 'undefined' ? localStorage.getItem('vectura.user') : null;
  if (!companyRaw) return <Navigate to="/connexion-entreprise" replace />;
  return <>{children}</>;
}

function DriverSpace() {
  const { logout } = useAuth();
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Espace chauffeur</h1>
        <button
          type="button"
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          onClick={() => {
            logout();
            window.location.assign('/');
          }}
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

function CompanySpace() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Espace entreprise</h1>
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <Routes>
      {/* Landing publique */}
      <Route path="/" element={<LandingPublic />} />

      {/* Pages légales */}
      <Route path="/mentions-legales" element={<MentionsLegales />} />
      <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />

      {/* Auth chauffeur */}
      <Route path="/connexion/chauffeur" element={<ConnexionChauffeur />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route
        path="/espace/chauffeur"
        element={
          <RequireDriver>
            <DriverSpace />
          </RequireDriver>
        }
      />
      <Route path="/depot-documents" element={<DepotDocuments />} />
      <Route path="/chauffeur/dashboard" element={<TableauBordChauffeur />} />
      <Route path="/chauffeur/missions/:id" element={<MissionDetail />} />
      <Route path="/chauffeur/missions/active" element={<MissionsActives />} />
      <Route path="/chauffeur/missions/past" element={<MissionsPassees />} />
      <Route path="/chauffeur/billing" element={<FacturationChauffeur />} />
      <Route path="/chauffeur/qualification" element={<QualificationChauffeur />} />

      {/* Auth entreprise */}
      <Route path="/connexion-entreprise" element={<ConnexionEntreprise />} />
      <Route
        path="/espace/entreprise"
        element={
          <RequireCompany>
            <EspaceEntreprise />
          </RequireCompany>
        }
      />
      <Route
        path="/profil-entreprise"
        element={
          <RequireCompany>
            <ProfilEntreprise />
          </RequireCompany>
        }
      />
      <Route path="/companies/mission/create" element={<MissionCreate />} />
      <Route path="/companies/billing" element={<FacturationEntreprise />} />
      <Route
        path="/companies/favorites"
        element={
          <RequireCompany>
            <FavorisEntreprise />
          </RequireCompany>
        }
      />
      <Route path="/admin/dashboard" element={<DashboardAdmin />} />
      <Route path="/admin/chauffeurs" element={<GestionChauffeurs />} />
      <Route path="/admin/chauffeurs/:driverId/documents" element={<ValidationDocuments />} />
      <Route path="/admin/missions" element={<SuiviMissions />} />
      <Route path="/admin/compliance" element={<ConformiteVigilance />} />
      <Route path="/admin/sanctions" element={<Sanctions />} />
      <Route path="/admin/sms" element={<GestionSMS />} />
      <Route path="/admin/invitations" element={<CustomizeInvitationLink />} />
      <Route path="/enroll/:invitationId" element={<InscriptionChauffeurEnrollment />} />
      <Route path="/qa/functional" element={<QaFunctional />} />
      <Route path="/qa/security" element={<QaSecurity />} />
      <Route path="/qa/preproduction" element={<Preproduction />} />
      <Route path="/qa/production" element={<Production />} />
      <Route path="/qa/stabilization" element={<Stabilization />} />

      {/* Pages inscription */}
      <Route path="/inscription/chauffeur" element={<InscriptionChauffeur />} />
      <Route path="/inscription/entreprise" element={<InscriptionEntreprise />} />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


