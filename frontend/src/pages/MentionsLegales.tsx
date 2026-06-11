export default function MentionsLegales() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Mentions légales</h1>
      <p className="mt-4 text-gray-700">
        Le site Vectura est édité par [Raison sociale du responsable de publication] — [Forme sociale] au capital de [montant] €,
        immatriculée au RCS de [Ville] sous le numéro [SIREN], dont le siège social est situé [adresse complète].
      </p>
      <p className="mt-4 text-gray-700">
        Directeur de la publication : [Nom et prénom] — [Fonction].
      </p>
      <p className="mt-4 text-gray-700">
        Hébergement : [Raison sociale de l’hébergeur] — [Adresse] — [Pays].
      </p>
      <p className="mt-4 text-gray-700">
        Contact : [adresse mail de contact] / [numéro de téléphone].
      </p>
    </div>
  );
}
