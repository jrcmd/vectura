import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Landing page publique Vectura (EPIC 2 — STORY 2.4)
 * - Mobile-first
 * - Responsive via classes Tailwind
 * - Contient : header, hero + doubles CTA, sections réassurance, fonctionnement, footer
 */
export default function LandingPublic(): JSX.Element {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">

        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="font-extrabold tracking-tight text-lg">Vectura</div>

          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <a href="#offre" className="hover:text-blue-700">
              Offre
            </a>
            <a href="#comment" className="hover:text-blue-700">
              Fonctionnement
            </a>
            <a href="#confiance" className="hover:text-blue-700">
              Confiance
            </a>
            <button type="button" onClick={() => navigate('/qa/functional')} className="text-sm text-blue-700 hover:text-blue-800">
              QA
            </button>
          </nav>

          <a
            className="inline-flex sm:hidden items-center rounded-md border px-3 py-2 text-sm font-medium"
            href="#hero"
          >
            Accès
          </a>
        </div>
      </header>

      {/* Hero */}
      <main id="hero">
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-slate-700">
                Mise en relation chauffeurs PL/SPL ↔ entreprises de transport
              </div>
              <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
                La plateforme qui simplifie
                <span className="text-blue-700"> l’accès aux missions</span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-slate-700">
                Inscrivez-vous, déposez vos documents et accédez à des missions compatibles. Côté entreprise, publiez vos
                besoins et gérez vos chauffeurs favoris.
              </p>

              {/* Doubles CTA */}
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // Tracking clic (STORY 2.5) — volontairement simple sans lib externe
                    // eslint-disable-next-line no-console
                    console.info('[TRACKING] CTA_INSCRIPTION_CHAUFFEUR');
                    navigate('/inscription/chauffeur');
                  }}
                  className="rounded-xl bg-blue-700 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800 transition"
                >
                  Je suis chauffeur
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // eslint-disable-next-line no-console
                    console.info('[TRACKING] CTA_INSCRIPTION_ENTREPRISE');
                    navigate('/inscription/entreprise');
                  }}
                  className="rounded-xl border-2 border-slate-200 px-5 py-3 text-center font-semibold text-slate-900 hover:border-slate-300 transition"
                >
                  Je suis une entreprise
                </button>
              </div>

              {/* Mini bénéfices */}
              <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border p-4">
                  <div className="font-semibold">Matching</div>
                  <div className="text-sm text-slate-600 mt-1">Missions compatibles avec vos qualifications.</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="font-semibold">Conformité</div>
                  <div className="text-sm text-slate-600 mt-1">Documents pris en compte et validés.</div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="font-semibold">Simplicité</div>
                  <div className="text-sm text-slate-600 mt-1">Parcours clair et accessible.</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-2xl border bg-gradient-to-b from-blue-50 to-white p-6">
                <h2 className="text-lg font-bold">Commencer en 2 minutes</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Dépôt documentaire • Validation • Accès aux missions
                </p>

                <ol className="mt-5 space-y-3">
                  {[
                    { step: '1', title: 'Inscription', desc: 'Créez votre compte chauffeur ou entreprise.' },
                    { step: '2', title: 'Documents', desc: 'Déposez vos pièces avec date d’expiration.' },
                    { step: '3', title: 'Accès', desc: 'Missions disponibles selon vos qualifications.' }
                  ].map((s) => (
                    <li key={s.step} className="flex gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-white font-semibold">
                        {s.step}
                      </div>
                      <div>
                        <div className="font-semibold">{s.title}</div>
                        <div className="text-sm text-slate-600">{s.desc}</div>
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Emplacements complémentaires (QR + redirection) */}
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      // eslint-disable-next-line no-console
                      console.info('[TRACKING] CTA_SECOND_INSCRIPTION_CHAUFFEUR');
                      navigate('/inscription/chauffeur');
                    }}
                    className="rounded-xl bg-blue-700 px-4 py-3 text-center text-white font-semibold hover:bg-blue-800 transition"
                  >
                    Accéder à l’inscription chauffeur
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // eslint-disable-next-line no-console
                      console.info('[TRACKING] CTA_SECOND_INSCRIPTION_ENTREPRISE');
                      navigate('/inscription/entreprise');
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold hover:border-slate-300 transition"
                  >
                    Accéder à l’espace entreprise
                  </button>

                  {/* Emplacement QR code (placeholder pour intégration future) */}
                  <div className="rounded-xl border bg-white p-4">
                    <div className="text-sm font-semibold">Scanner pour démarrer</div>
                    <div className="mt-2 flex items-center gap-4">
                      <div
                        className="h-20 w-20 rounded-md border bg-slate-50 flex items-center justify-center text-xs text-slate-500"
                        aria-label="QR code (placeholder)"
                      >
                        QR
                      </div>
                      <div className="text-xs text-slate-600">
                        Utilise le QR code sur les flyers pour accéder au parcours.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Réassurance */}
        <section id="confiance" className="mx-auto max-w-6xl px-4 pb-14">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold">Confiance et conformité</h2>
            <p className="mt-3 text-slate-600">Des règles claires pour que les missions soient compatibles et fiables.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Validation des documents', desc: 'Les pièces sont contrôlées pour sécuriser l’accès.' },
              { title: 'Matching qualifications', desc: 'Missions proposées selon vos permis et options.' },
              { title: 'Process simple', desc: 'Parcours guidé, informations explicites.' }
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border p-6">
                <div className="font-bold">{c.title}</div>
                <p className="mt-2 text-sm text-slate-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fonctionnement */}
        <section id="comment" className="mx-auto max-w-6xl px-4 pb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold">Comment ça marche</h2>
              <p className="mt-3 text-slate-600">
                Chauffeurs et entreprises suivent un même cycle : inscription, documents, validation, puis accès.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  { title: '1. Inscription', desc: 'Créer son profil et son espace.' },
                  { title: '2. Dépôt documentaire', desc: 'Upload des documents avec date d’expiration.' },
                  { title: '3. Validation', desc: 'Contrôle et mise en conformité.' },
                  { title: '4. Missions', desc: 'Mise à disposition selon matching.' }
                ].map((x, i) => (
                  <div key={x.title} className="flex gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-semibold">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{x.title}</div>
                      <div className="text-sm text-slate-600">{x.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="offre" className="rounded-2xl border p-6 bg-slate-50">
              <h3 className="text-lg font-bold">Ce que vous obtenez</h3>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="rounded-xl border bg-white p-5">
                  <div className="font-extrabold">Chauffeurs</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>• Visibilité des missions compatibles</li>
                    <li>• Accès contrôlé après validation</li>
                    <li>• Statut clair sur votre dashboard</li>
                  </ul>
                </div>
                <div className="rounded-xl border bg-white p-5">
                  <div className="font-extrabold">Entreprises</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>• Création et publication de missions</li>
                    <li>• Gestion des chauffeurs favoris</li>
                    <li>• Suivi et facturation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="font-extrabold">Vectura</div>
              <div className="text-sm text-slate-600 mt-1">© {new Date().getFullYear()} — Plateforme de mise en relation</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <a href="#" className="hover:text-blue-700">Mentions légales</a>
              <a href="#" className="hover:text-blue-700">Confidentialité (RGPD)</a>
              <a href="#" className="hover:text-blue-700">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

