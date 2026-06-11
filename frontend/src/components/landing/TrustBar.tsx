const proofItems = [
  'Missions publiées en temps réel',
  'Vérification des documents',
  'Support dédié entreprise et chauffeur',
];

export default function TrustBar() {
  return (
    <section className="border-b border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {proofItems.map((item) => (
            <div key={item} className="rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <span className="text-sm font-semibold text-gray-900">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
