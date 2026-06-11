# Plan d'action — Dossier DOCUMENTATION

## Contexte
Le projet Vectura est une plateforme B2B/B2C de mise en relation entre chauffeurs PL/SPL et entreprises de transport. Il existe déjà un README.md, un `.env.example`, des workflows CI, et un schéma Prisma complet définissant les rôles CHAUFFEUR / ENTREPRISE / ADMIN. Il manque un dossier `DOCUMENTATION/` propre pour les sujets métier et techniques avancés, que le README ne peut pas couvrir sans devenir trop long pour GitLab.

## Objectif
Créer un dossier `DOCUMENTATION/` avec une structure de fichiers markdown adaptée au projet Vectura, prête à être remplie ensuite.

## Actions
1. Vérifier l'arborescence locale pour confirmer qu'aucun dossier `DOCUMENTATION/` n'existe déjà.
2. Créer le dossier et l'ensemble des fichiers markdown candidats pour la documentation.
3. Structurer chaque fichier pour qu'il soit exploitable immédiatement par l'équipe, avec des sections, tableaux et exemples.

## Structure retenue pour DOCUMENTATION/
- `01_stack_technique.md` : stack front/back, bases de données, libs tierces.
- `02_architecture.md` : vue d'ensemble des services, entities métier, schéma Prisma, flux inter-services.
- `03_configuration.md` : .env.example détaillé, docker-compose surcouche par env, CORS, routes publiques vs privées.
- `04_regles_metier.md` : tarification plancher, fenêtre priorité favoris, matching géographique, discipline chauffeur, statuts mission.
- `05_api.md` : conventions REST, schémas de requête/réponse, validation Zod, gestion d'erreurs, authentification.
- `06_guide_dev.md` : conventions de code, branches Git, commandes utiles, sécurité, secrets, uploads, tests, debugging.
- `07_ops.md` : pipelines CI/CD existants, stratégie de déploiement, rollback, monitoring, sauvegardes, alertes.
- `08_faq.md` : questions fréquentes et résolutions typiques.

## Risques / Incertitudes
- Certaines règles métier ne sont pas toutes détaillées dans `TODO.md` ni dans le schéma Prisma ; il manque parfois les bornes exactes ou les scénarios métier complets. JE DOIS POSER LA QUESTION suivante avant de finaliser le plan : certaines valeurs ou règles métier restent-elles à confirmer, ou est-ce que le contenu peut se baser strictement sur `TODO.md`, `prompt_blackbox_vectura.md`, le `.env.example` et le schéma Prisma existants ?
