import Benefits from './Benefits';
import HowItWorks from './HowItWorks';
import HeroCTA from './HeroCTA';
import TrustBar from './TrustBar';
import SiteFooter from '../layout/SiteFooter';

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="/" className="text-xl font-bold tracking-tight text-gray-900">
            Vectura
          </a>
          <nav className="flex items-center gap-3">
            <a
              href="#chauffeur"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Chauffeur
            </a>
            <a
              href="#entreprise"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Entreprise
            </a>
            <a
              href="/inscription-chauffeur"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Inscription chauffeur
            </a>
            <a
              href="/inscription-entreprise"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Espace entreprise
            </a>
          </nav>
        </div>
      </header>

      <HeroCTA />
      <HowItWorks />
      <Benefits variant="chauffeur" id="chauffeur" />
      <Benefits variant="entreprise" id="entreprise" />
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
