# Résumé du plan suivi - Vectura

## Étape 1 : Socle technique ✅ EPIC 1

| Story | Status | Détails |
|-------|--------|---------|
| 1.1 - Initialiser le projet | ✅ | Repository Git, structure dossiers, README |
| 1.2 - Mettre en place Docker | ✅ | docker-compose.yml avec postgres, redis, backend, frontend |
| 1.3 - Préparer les environnements | ✅ | .env.example complet, réseau Docker interne |
| 1.4 - Mettre en place la base de données | ✅ | Prisma schema, migrations, seed (à implémenter) |
| 1.5 - Mettre en place CI CD | ✅ | Pipeline GitHub Actions lint/test/build |

## Étape 2 : Landing page publique ⏳ EPIC 2

| Story | Status | Détails |
|-------|--------|---------|
| 2.1 - Concevoir l'arborescence publique | ⬜ | Sections hero, bénéfices, fonctionnement, footer |
| 2.2 - Produire les wireframes | ⬜ | Wireframes desktop/mobile à valider |
| 2.3 - Produire la maquette UI | ⬜ | Design system, CTA chauffeur/entreprise |
| 2.4 - Développer la landing | ⬜ | Page responsive, tracking CTA, SEO |
| 2.5 - Prévoir acquisition | ⬜ | Pages mentions légales, politique confidentialité |

## Étape 3 : Espace Chauffeur ⏳ EPIC 3

| Story | Status | Détails |
|-------|--------|---------|
| 3.1 - Inscription chauffeur | ⬜ | Formulaire, validation, endpoint API |
| 3.2 - Authentification chauffeur | ⬜ | Login, JWT, routes protégées |
| 3.3 - Dépôt de documents | ⬜ | Upload permis, FIMO, carte chrono, etc |
| 3.4 - Tableau de bord chauffeur | ⬜ | Statut profil, documents, missions |
| 3.5 - Consultation mission | ⬜ | Liste, détail, acceptation |
| 3.6 - Discipline chauffeur | ⬜ | Annulation tardive, sanctions automatiques |

## Étape 4 : Espace Entreprise ⏳ EPIC 4

| Story | Status | Détails |
|-------|--------|---------|
| 4.1 - Compte entreprise | ⬜ | Inscription, connexion, profil |
| 4.2 - Création de mission | ⬜ | Formulaire, champs type/date/tarif |
| 4.3 - Tarification plancher | ⬜ | Validation PL/SPLE minimum |
| 4.4 - Favoris | ⬜ | Ajout, liste, suppression |
| 4.5 - Priorité favoris | ⬜ | Fenêtre 2h, diffusion restreinte |
| 4.6 - Historique et factures | ⬜ | Liste missions, export PDF |

## Étape 5 : Matching et discipline ⏳ EPIC 5

| Story | Status | Détails |
|-------|--------|---------|
| 5.1 - Modèle de qualification | ⬜ | Permis, ADR, Frigo |
| 5.2 - Calcul de distance | ⬜ | Geocoding, filtre rayon |
| 5.3 - Algorithme de matching | ⬜ | Filtrage missions compatibles |
| 5.4 - Cycle mission | ⬜ | Transitions statut, historique |
| 5.5 - Rappels mission | ⬜ | Notifications J-1 et J |

## Étape 6 : Back-office administrateur ⏳ EPIC 6

| Story | Status | Détails |
|-------|--------|---------|
| 6.1 - Dashboard administrateur | ⬜ | KPI missions, inscrits, CA |
| 6.2 - Gestion des chauffeurs | ⬜ | Filtres, recherche, statut |
| 6.3 - Validation documents | ⬜ | Validation/rejet, notifications |
| 6.4 - Suivi des missions | ⬜ | Liste non pourvue, à venir, historique |
| 6.5 - Conformité vigilance | ⬜ | URSSAF > 6 mois, blocage missions |

## Étape 7 : Notifications et automatisation ⏳ EPIC 7

| Story | Status | Détails |
|-------|--------|---------|
| 7.1 - Service e-mail | ⬜ | Templates, SMTP configuré |
| 7.2 - Alertes documents | ⬜ | Jobs quotidiens expirations |
| 7.3 - Relances mission | ⬜ | Rappels J-1 et matin J |
| 7.4 - Sanctions automatiques | ⬜ | Suspension, radiation, notification |

## Étape 8 : Facturation et export ⏳ EPIC 8

| Story | Status | Détails |
|-------|--------|---------|
| 8.1 - Données financières | ⬜ | Calcul montants facturés/reversés |
| 8.2 - Facture hebdomadaire | ⬜ | Génération, envoi |
| 8.3 - Export comptable | ⬜ | Export CSV/PDF |
| 8.4 - Marge admin | ⬜ | Dashboard marge générée |

## Légende

- ✅ Fait / Implémenté
- ⬜ À faire
- ⏳ En cours