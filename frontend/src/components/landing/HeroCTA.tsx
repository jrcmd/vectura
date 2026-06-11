export default function HeroCTA() {
  return (
    <section className="border-b border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Mettez vos chauffeurs PL/SPL en relation avec les bonnes entreprises
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Vectura connecte les transporteurs et les entreprises avec des missions adaptées à leurs qualifications,
            en toute transparence et conformité.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/inscription-chauffeur"
              className="rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-700"
            >
              Je suis chauffeur
            </a>
            <a
              href="/inscription-entreprise"
              className="rounded-full bg-gray-900 px-8 py-3.5 text-base font-semibold text-white hover:bg-gray-800"
            >
              Je suis une entreprise
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
