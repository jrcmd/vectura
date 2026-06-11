export default function HowItWorks() {
  const steps = [
    {
      title: 'Inscription',
      description: 'Créez votre profil en quelques minutes et déposez vos documents.',
    },
    {
      title: 'Matching',
      description: 'Recevez les missions compatibles avec votre qualification et votre secteur.',
    },
    {
      title: 'Mission',
      description: 'Acceptez, réalisez et suivez vos courses depuis votre espace.',
    },
  ];

  return (
    <section className="border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900">Comment ça marche</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
          Un parcours simple pour les chauffeurs et les entreprises.
        </p>
        <ol className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <span className="text-sm font-semibold text-blue-600">{step.title}</span>
              <p className="mt-3 text-gray-700">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
