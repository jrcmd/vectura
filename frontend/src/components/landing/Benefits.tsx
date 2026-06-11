const chauffeurBenefits = [
  'Accédez à des missions qualifiées proches de votre secteur',
  'Centralisez vos documents et votre statut en un seul endroit',
  'Réduisez les temps morts grâce à un matching ciblé',
  'Bénéficiez d’un accompagnement clair sur vos obligations documentaires',
];

const entrepriseBenefits = [
  'Publiez vos missions en quelques clics',
  'Sélectionnez des chauffeurs qualifiés et conformes',
  'Suivez vos factures et votre historique simplement',
  'Gardez vos favoris et priorisez vos candidats de confiance',
];

type BenefitsProps = {
  variant: 'chauffeur' | 'entreprise';
  id?: string;
};

export default function Benefits({ variant, id }: BenefitsProps) {
  const items = variant === 'chauffeur' ? chauffeurBenefits : entrepriseBenefits;
  const title = variant === 'chauffeur' ? 'Pour les chauffeurs' : 'Pour les entreprises';
  const ctaLabel = variant === 'chauffeur' ? 'Créer mon compte chauffeur' : 'Créer mon compte entreprise';
  const ctaLink = variant === 'chauffeur' ? '/inscription-chauffeur' : '/inscription-entreprise';
  const ctaClass =
    variant === 'chauffeur'
      ? 'bg-blue-600 hover:bg-blue-700'
      : 'bg-gray-900 hover:bg-gray-800';

  return (
    <section id={id} className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <ul className="mx-auto mt-10 max-w-3xl space-y-4">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-gray-700">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <a
            href={ctaLink}
            className={`inline-flex rounded-full px-6 py-3 text-base font-semibold text-white ${ctaClass}`}
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
