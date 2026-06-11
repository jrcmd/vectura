import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-lg font-semibold text-white">Vectura</span>
            <p className="mt-2 max-w-md text-sm text-gray-300">
              Plateforme de mise en relation entre chauffeurs PL/SPL et entreprises de transport.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm">
            <Link to="/mentions-legales" className="text-gray-300 hover:text-white">
              Mentions légales
            </Link>
            <Link to="/politique-confidentialite" className="text-gray-300 hover:text-white">
              Politique de confidentialité
            </Link>
          </nav>
        </div>
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-400">
          Vectura. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
