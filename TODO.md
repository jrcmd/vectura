# 🚀 TODO — Prompts Blackbox pour Vectura

> Fichier de travail pour guider le développement MVP Vectura via Blackbox sur VS Code.
> Copie-colle chaque prompt **un par un**, valide le résultat, puis passe au suivant.

---

## 🎯 Contexte global (à copier en préambule de chaque prompt)

```
Tu es un développeur full-stack senior spécialisé en applications web SaaS B2B/B2C.
Tu implémentes le projet Vectura : une plateforme de mise en relation entre chauffeurs PL/SPL 
et entreprises de transport.

STACK TECHNIQUE :
- Frontend : React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
- Backend : Node.js + Express + TypeScript + Prisma ORM
- Base de données : PostgreSQL 16 + Redis 7
- Auth : JWT (access + refresh tokens) + bcrypt
- Upload : Multer + stockage local (dev) / S3-compatible (prod)
- Email : Nodemailer + SMTP
- Docker : docker-compose (frontend + backend + postgres + redis)
- Tests : Vitest (frontend) + Jest (backend)

RÈGLES :
- Génère le code COMPLET et fonctionnel, fichier par fichier
- Chaque fichier doit être prêt à être copié-collé tel quel
- Utilise TypeScript strict (noImplicitAny, strictNullChecks)
- Commentaires en français pour la logique métier
- Nommage en anglais (camelCase variables, PascalCase composants, kebab-case fichiers)
- Respecte les principes SOLID et RESTful
- Ajoute la gestion d'erreurs (try/catch, validation Zod)
- Ne laisse JAMAIS de TODO ou de placeholder dans le code final
```

---


## 📦 ÉTAPE 1 : EPIC 1 — Socle technique
**Objectif :** Mettre en place la base technique exploitable du produit Vectura
**Priorité :** Critique | **Labels :** mvp,infra,backend | **Rôle :** Admin Système

### 1.1 — STORY 1.1 — Initialiser le projet
> En tant qu'équipe projet nous avons besoin d'une base de code propre pour démarrer le développement
> Priorité: Critique | Labels: mvp,infra,backend,frontend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 1.1 — Initialiser le projet
DESCRIPTION : En tant qu'équipe projet nous avons besoin d'une base de code propre pour démarrer le développement
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Créer le repository Git : Créer le dépôt principal et définir la structure initiale du projet
- [Haute] Définir la convention de branches : Définir main develop feature hotfix et règles de merge
- [Critique] Initialiser le frontend : Créer l'application frontend avec structure de base
- [Critique] Initialiser le backend : Créer l'API backend avec structure de base
- [Haute] Ajouter TypeScript : Configurer TypeScript sur le frontend et le backend
- [Haute] Créer la structure dossiers front et back : Organiser composants routes services modèles utilitaires et configuration
- [Normale] Ajouter README technique initial : Documenter démarrage local architecture et conventions

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [✅] Tous les fichiers générés sont copiés dans le projet
- [✅] `docker-compose up` démarre sans erreur
- [✅] Les routes API répondent correctement (test via Postman/curl)
- [✅]L'interface s'affiche correctement dans le navigateur
- [✅] Aucune erreur TypeScript (`npm run type-check`)
- [✅] Aucune erreur ESLint (`npm run lint`)
- [✅] Les tests passent (`npm test`)

### 1.2 — STORY 1.2 — Mettre en place Docker
> En tant qu'équipe projet nous avons besoin d'environnements homogènes via conteneurs
> Priorité: Critique | Labels: mvp,infra

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 1.2 — Mettre en place Docker
DESCRIPTION : En tant qu'équipe projet nous avons besoin d'environnements homogènes via conteneurs
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Créer docker-compose.yml : Définir les services nécessaires au projet
- [Critique] Ajouter service frontend : Conteneuriser l'application frontend
- [Critique] Ajouter service backend : Conteneuriser l'API backend
- [Critique] Ajouter service PostgreSQL : Déployer la base PostgreSQL avec persistance
- [Haute] Ajouter service Redis : Déployer Redis pour cache files et tâches
- [Critique] Ajouter volumes persistants : Persister base de données uploads et logs
- [Haute] Ajouter réseau Docker interne : Isoler les services et organiser la communication interne

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [✅] Tous les fichiers générés sont copiés dans le projet
- [✅] `docker-compose up` démarre sans erreur
- [✅] Les routes API répondent correctement (test via Postman/curl)
- [✅] L'interface s'affiche correctement dans le navigateur
- [✅] Aucune erreur TypeScript (`npm run type-check`)
- [✅] Aucune erreur ESLint (`npm run lint`)
- [✅] Les tests passent (`npm test`)

### 1.3 — STORY 1.3 — Préparer les environnements
> En tant qu'équipe projet nous avons besoin d'une configuration claire par environnement
> Priorité: Critique | Labels: infra,security

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 1.3 — Préparer les environnements
DESCRIPTION : En tant qu'équipe projet nous avons besoin d'une configuration claire par environnement
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Normale] Documenter commandes de démarrage : Lister les commandes utiles pour lancer et arrêter le projet
- [Critique] Créer .env.example : Lister toutes les variables nécessaires au projet
- [Haute] Définir variables frontend : Déclarer URL API mode debug et autres paramètres front
- [Critique] Définir variables backend : Déclarer port secrets services tiers et options serveur
- [Critique] Définir variables DB : Déclarer hôte port nom base utilisateur mot de passe
- [Haute] Définir variables SMTP : Déclarer configuration du service mail
- [Critique] Définir variables stockage fichiers : Déclarer chemin ou bucket de stockage des documents

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [✅] Tous les fichiers générés sont copiés dans le projet
- [✅] `docker-compose up` démarre sans erreur
- [✅] Les routes API répondent correctement (test via Postman/curl)
- [✅] L'interface s'affiche correctement dans le navigateur
- [✅] Aucune erreur TypeScript (`npm run type-check`)
- [✅] Aucune erreur ESLint (`npm run lint`)
- [✅] Les tests passent (`npm test`)

### 1.4 — STORY 1.4 — Mettre en place la base de données
> En tant que système Vectura nous avons besoin d'une base relationnelle fiable
> Priorité: Critique | Labels: backend,database

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 1.4 — Mettre en place la base de données
DESCRIPTION : En tant que système Vectura nous avons besoin d'une base relationnelle fiable
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Définir variables JWT : Déclarer secrets et durées de session
- [Critique] Créer la connexion PostgreSQL : Configurer la connexion applicative à la base
- [Haute] Configurer ORM ou query builder : Choisir et intégrer l'outil d'accès aux données
- [Critique] Créer système de migrations : Permettre l'évolution contrôlée du schéma de base
- [Normale] Créer seed de base : Préparer des données de test minimales
- [Haute] Tester le démarrage local : Vérifier que la base démarre correctement avec l'application
- [Normale] Documenter reset DB : Décrire la procédure de remise à zéro en dev

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [✅] Tous les fichiers générés sont copiés dans le projet
- [✅] `docker-compose up` démarre sans erreur
- [✅] Les routes API répondent correctement (test via Postman/curl)
- [✅] L'interface s'affiche correctement dans le navigateur
- [✅] Aucune erreur TypeScript (`npm run type-check`)
- [✅] Aucune erreur ESLint (`npm run lint`)
- [✅] Les tests passent (`npm test`)

### 1.5 — STORY 1.5 — Mettre en place CI CD
> En tant qu'équipe projet nous avons besoin d'automatiser qualité et déploiement
> Priorité: Haute | Labels: infra,quality

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 1.5 — Mettre en place CI CD
DESCRIPTION : En tant qu'équipe projet nous avons besoin d'automatiser qualité et déploiement
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Configurer lint frontend : Automatiser le contrôle qualité du code frontend
- [Haute] Configurer lint backend : Automatiser le contrôle qualité du code backend
- [Haute] Configurer pipeline test : Lancer automatiquement les tests sur chaque push
- [Haute] Configurer pipeline build : Vérifier la construction des artefacts applicatifs
- [Haute] Configurer pipeline staging : Déployer automatiquement en préproduction
- [Critique] Préparer stratégie de déploiement production : Définir le mode de déploiement et la validation
- [Critique] Prévoir rollback minimal : Permettre un retour arrière rapide en cas d'incident

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

---

## 📦 ÉTAPE 2 : EPIC 2 — Landing page publique
**Objectif :** Créer la vitrine publique de Vectura pour convertir chauffeurs et entreprises
**Priorité :** Haute | **Labels :** mvp,frontend,ux | **Rôle :** UI/UX Designer

### 2.1 — STORY 2.1 — Concevoir l'arborescence publique
> En tant que visiteur je comprends rapidement l'offre et les actions disponibles
> Priorité: Haute | Labels: ux,frontend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 2.1 — Concevoir l'arborescence publique
DESCRIPTION : En tant que visiteur je comprends rapidement l'offre et les actions disponibles
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Définir sections landing : Structurer hero bénéfices fonctionnement preuves et footer
- [Haute] Définir hiérarchie des CTA : Mettre en avant chauffeur et entreprise avec priorités visuelles
- [Haute] Définir messages de réassurance : Préparer arguments confiance conformité et simplicité
- [Haute] Définir parcours mobile first : Prévoir une navigation efficace sur smartphone
- [Haute] Wireframe hero section : Dessiner la zone d'entrée principale avec CTA
- [Normale] Wireframe bloc bénéfices chauffeur : Présenter l'intérêt du service pour les chauffeurs
- [Normale] Wireframe bloc bénéfices entreprise : Présenter l'intérêt du service pour les entreprises

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [✅] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 2.2 — STORY 2.2 — Produire les wireframes landing
> En tant qu'équipe projet nous avons besoin d'une base UX avant la maquette finale
> Priorité: Haute | Labels: ux

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 2.2 — Produire les wireframes landing
DESCRIPTION : En tant qu'équipe projet nous avons besoin d'une base UX avant la maquette finale
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Normale] Wireframe bloc fonctionnement : Illustrer le cycle inscription mission validation
- [Normale] Wireframe footer légal : Prévoir liens vers mentions et confidentialité
- [Haute] Wireframe version mobile : Adapter le parcours et les sections à petit écran
- [Normale] Définir palette CTA chauffeur : Choisir une couleur vive et cohérente
- [Normale] Définir palette CTA entreprise : Choisir une couleur sobre et professionnelle
- [Normale] Définir typographie : Choisir la hiérarchie visuelle des textes
- [Normale] Définir composants landing : Créer boutons cartes sections et footer

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 2.3 — STORY 2.3 — Produire la maquette UI
> En tant qu'équipe projet nous avons besoin d'un design system visuel cohérent
> Priorité: Haute | Labels: ux,ui

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 2.3 — Produire la maquette UI
DESCRIPTION : En tant qu'équipe projet nous avons besoin d'un design system visuel cohérent
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Normale] Définir style cartes et boutons : Spécifier états et variantes visuelles
- [Normale] Définir états hover focus : Spécifier les interactions utilisateur
- [Haute] Intégrer header : Développer l'en-tête public avec navigation
- [Haute] Intégrer hero et doubles CTA : Développer la section d'accroche principale
- [Normale] Intégrer sections réassurance : Développer les preuves de confiance et bénéfices
- [Normale] Intégrer bloc fonctionnement : Développer la section explicative du service
- [Normale] Intégrer footer : Développer le pied de page avec liens utiles

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 2.4 — STORY 2.4 — Développer la landing
> En tant que visiteur je peux accéder à une page publique claire et responsive
> Priorité: Haute | Labels: frontend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 2.4 — Développer la landing
DESCRIPTION : En tant que visiteur je peux accéder à une page publique claire et responsive
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Rendre la page responsive : Adapter la page mobile tablette desktop
- [Normale] Optimiser performances mobile : Réduire poids et améliorer vitesse d'affichage
- [Normale] Ajouter emplacement QR code : Prévoir un bloc dédié pour les flyers
- [Critique] Créer bouton vers inscription chauffeur : Relier le CTA chauffeur à son parcours
- [Critique] Créer bouton vers espace entreprise : Relier le CTA entreprise à son parcours
- [Normale] Ajouter tracking clic CTA : Mesurer les conversions sur les boutons principaux
- [Normale] Ajouter métadonnées SEO : Améliorer la visibilité et le partage de la page

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 2.5 — STORY 2.5 — Prévoir acquisition
> En tant que porteur du projet je peux capter des inscrits depuis les supports marketing
> Priorité: Normale | Labels: frontend,marketing

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 2.5 — Prévoir acquisition
DESCRIPTION : En tant que porteur du projet je peux capter des inscrits depuis les supports marketing
PRIORITÉ : Normale

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Ajouter page mentions légales : Créer la page légale minimale
- [Critique] Ajouter page politique confidentialité : Créer la page RGPD minimale

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

---

## 📦 ÉTAPE 3 : EPIC 3 — Espace Chauffeur
**Objectif :** Permettre l'inscription chauffeur le dépôt documentaire et l'accès contrôlé aux missions
**Priorité :** Critique | **Labels :** mvp,frontend,backend | **Rôle :** Développeur Full-Stack

### 3.1 — STORY 3.1 — Inscription chauffeur
> En tant que chauffeur je peux créer mon compte
> Priorité: Critique | Labels: frontend,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 3.1 — Inscription chauffeur
DESCRIPTION : En tant que chauffeur je peux créer mon compte
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Concevoir wireframe formulaire inscription : Définir l'organisation du formulaire d'entrée
- [Haute] Concevoir maquette formulaire inscription : Créer la version UI finale du formulaire
- [Critique] Développer formulaire front : Coder le formulaire d'inscription chauffeur
- [Critique] Ajouter validation nom et prénom : Contrôler les champs obligatoires
- [Critique] Ajouter validation téléphone : Contrôler le format du numéro
- [Haute] Ajouter champ ville avec auto-complétion : Permettre la sélection assistée de la ville
- [Critique] Créer endpoint API inscription : Créer la route backend d'enregistrement chauffeur

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 3.2 — STORY 3.2 — Authentification chauffeur
> En tant que chauffeur je peux me connecter et accéder à mon espace
> Priorité: Critique | Labels: frontend,backend,security

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 3.2 — Authentification chauffeur
DESCRIPTION : En tant que chauffeur je peux me connecter et accéder à mon espace
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Sauvegarder chauffeur en base : Persister le profil et ses informations initiales
- [Critique] Définir statut EN_ATTENTE par défaut : Appliquer le statut initial au nouveau chauffeur
- [Haute] Développer écran connexion chauffeur : Créer l'interface de login
- [Critique] Créer endpoint login chauffeur : Créer la route de connexion sécurisée
- [Critique] Générer token de session : Mettre en place l'authentification sécurisée
- [Critique] Protéger routes chauffeur : Limiter l'accès aux pages privées
- [Normale] Ajouter déconnexion : Permettre la fermeture de session

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 3.3 — STORY 3.3 — Dépôt de documents
> En tant que chauffeur je peux déposer mes pièces justificatives
> Priorité: Critique | Labels: frontend,backend,compliance

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 3.3 — Dépôt de documents
DESCRIPTION : En tant que chauffeur je peux déposer mes pièces justificatives
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Normale] Prévoir reset mot de passe : Créer le flux minimal de récupération
- [Haute] Concevoir bloc upload documents : Définir l'expérience d'ajout de documents
- [Critique] Développer composants upload : Coder les champs d'envoi de fichiers
- [Critique] Gérer upload permis C CE : Traiter le dépôt du permis
- [Critique] Gérer upload FIMO FCO : Traiter le dépôt FIMO ou FCO
- [Critique] Gérer upload carte chrono : Traiter le dépôt de la carte conducteur
- [Critique] Gérer upload Kbis : Traiter le dépôt du Kbis

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 3.4 — STORY 3.4 — Tableau de bord chauffeur
> En tant que chauffeur je peux voir mon statut et mes missions
> Priorité: Haute | Labels: frontend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 3.4 — Tableau de bord chauffeur
DESCRIPTION : En tant que chauffeur je peux voir mon statut et mes missions
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Gérer upload attestation URSSAF : Traiter le dépôt de l'attestation de vigilance
- [Critique] Gérer upload RC Pro : Traiter le dépôt de l'assurance RC Pro
- [Critique] Ajouter date d'expiration : Associer une date à chaque document
- [Critique] Sauvegarder URL fichier en base : Enregistrer les références de stockage
- [Critique] Contrôler taille et type fichier : Sécuriser les uploads côté front et back
- [Normale] Concevoir wireframe dashboard chauffeur : Définir la hiérarchie de l'écran principal chauffeur
- [Critique] Développer bannière de statut : Afficher en attente validé suspendu ou radié

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 3.5 — STORY 3.5 — Consultation mission
> En tant que chauffeur je peux consulter et accepter une mission
> Priorité: Critique | Labels: frontend,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 3.5 — Consultation mission
DESCRIPTION : En tant que chauffeur je peux consulter et accepter une mission
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Afficher documents manquants : Lister les pièces à compléter
- [Haute] Afficher documents validés rejetés : Montrer le statut des documents soumis
- [Critique] Afficher missions disponibles : Présenter la liste des missions compatibles
- [Critique] Ajouter message profil en attente : Bloquer l'accès tant que validation admin absente
- [Normale] Ajouter état vide sans mission : Créer un affichage clair si aucune mission
- [Critique] Développer liste missions : Créer la vue de liste
- [Critique] Développer détail mission : Créer la vue détaillée

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 3.6 — STORY 3.6 — Discipline chauffeur
> En tant que plateforme je gère les annulations tardives automatiquement
> Priorité: Critique | Labels: backend,compliance

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 3.6 — Discipline chauffeur
DESCRIPTION : En tant que plateforme je gère les annulations tardives automatiquement
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Afficher lieu date horaires tarif : Afficher les données principales de la mission
- [Haute] Afficher type camion requis : Montrer la qualification attendue
- [Critique] Ajouter bouton accepter mission : Permettre l'acceptation de la mission
- [Normale] Ajouter confirmation d'acceptation : Sécuriser l'action utilisateur
- [Haute] Ajouter bouton désistement : Permettre l'annulation dans le cadre autorisé
- [Critique] Bloquer désistement à H-24 : Interdire l'annulation tardive depuis l'interface
- [Critique] Créer règle annulation tardive : Détecter les annulations sous 24 heures

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

---

## 📦 ÉTAPE 4 : EPIC 4 — Espace Entreprise
**Objectif :** Permettre aux entreprises de créer des missions et gérer leurs relations chauffeurs
**Priorité :** Critique | **Labels :** mvp,frontend,backend | **Rôle :** Développeur Full-Stack

### 4.1 — STORY 4.1 — Compte entreprise
> En tant qu'entreprise je peux créer et utiliser mon espace
> Priorité: Critique | Labels: frontend,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 4.1 — Compte entreprise
DESCRIPTION : En tant qu'entreprise je peux créer et utiliser mon espace
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Développer inscription entreprise : Créer le formulaire entreprise
- [Critique] Développer connexion entreprise : Créer le login entreprise
- [Critique] Créer rôle ENTREPRISE : Ajouter le rôle et ses permissions
- [Critique] Protéger routes entreprise : Limiter l'accès aux utilisateurs autorisés
- [Normale] Ajouter page profil entreprise : Créer la vue de profil société
- [Normale] Concevoir wireframe création mission : Définir le parcours de saisie
- [Normale] Concevoir maquette création mission : Créer la maquette de l'écran

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 4.2 — STORY 4.2 — Création de mission
> En tant qu'entreprise je peux publier une mission
> Priorité: Critique | Labels: frontend,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 4.2 — Création de mission
DESCRIPTION : En tant qu'entreprise je peux publier une mission
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Développer formulaire mission : Coder le formulaire de mission
- [Critique] Ajouter champ type camion : Créer le champ de qualification véhicule
- [Critique] Ajouter champ date : Créer la sélection de date
- [Critique] Ajouter champ horaires : Créer les champs d'horaire
- [Critique] Ajouter champ lieu : Créer la saisie du lieu
- [Haute] Ajouter champ description courte : Créer la description opérationnelle
- [Critique] Ajouter champ taux horaire : Créer la saisie du tarif

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 4.3 — STORY 4.3 — Tarification plancher
> En tant que plateforme je contrôle les prix minimums
> Priorité: Critique | Labels: backend,billing

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 4.3 — Tarification plancher
DESCRIPTION : En tant que plateforme je contrôle les prix minimums
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Créer endpoint création mission : Créer l'API de création mission
- [Critique] Enregistrer mission en base : Persister la mission et son statut
- [Critique] Définir règles PL et SPL : Fixer les seuils minimaux métier
- [Haute] Ajouter validation front prix minimum : Empêcher une saisie trop basse côté interface
- [Critique] Ajouter validation back prix minimum : Empêcher une saisie trop basse côté API
- [Normale] Retourner message erreur explicite : Informer clairement l'utilisateur
- [Haute] Couvrir la règle par tests : Assurer la non régression

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 4.4 — STORY 4.4 — Favoris
> En tant qu'entreprise je peux sauvegarder des chauffeurs favoris
> Priorité: Haute | Labels: frontend,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 4.4 — Favoris
DESCRIPTION : En tant qu'entreprise je peux sauvegarder des chauffeurs favoris
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Ajouter bouton ajouter aux favoris : Permettre la mémorisation d'un chauffeur
- [Critique] Créer table favoris : Modéliser la relation entreprise chauffeur
- [Haute] Développer liste favoris entreprise : Créer la page de gestion des favoris
- [Normale] Ajouter suppression favori : Permettre le retrait d'un favori
- [Normale] Ajouter filtre favoris : Filtrer la liste sur l'espace entreprise
- [Haute] Ajouter case priorité favoris 2h : Créer l'option au formulaire de mission
- [Critique] Enregistrer fenêtre de priorité : Sauvegarder la durée de priorité

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 4.5 — STORY 4.5 — Priorité favoris
> En tant qu'entreprise je peux réserver mes missions à mes favoris au départ
> Priorité: Haute | Labels: backend,frontend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 4.5 — Priorité favoris
DESCRIPTION : En tant qu'entreprise je peux réserver mes missions à mes favoris au départ
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Restreindre diffusion aux favoris pendant 2h : Appliquer la règle de diffusion initiale
- [Critique] Ouvrir mission au reste des profils qualifiés après délai : Basculer automatiquement en diffusion générale
- [Haute] Ajouter test métier de bascule : Valider le bon passage de priorité
- [Normale] Développer liste missions passées : Créer l'historique des missions terminées
- [Normale] Développer liste missions en cours : Créer la vue active des missions
- [Haute] Développer vue facturation : Créer l'écran de facturation
- [Haute] Afficher factures hebdomadaires : Lister les factures disponibles

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 4.6 — STORY 4.6 — Historique et factures
> En tant qu'entreprise je peux suivre mes missions et récupérer mes factures
> Priorité: Haute | Labels: frontend,billing

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 4.6 — Historique et factures
DESCRIPTION : En tant qu'entreprise je peux suivre mes missions et récupérer mes factures
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Ajouter téléchargement PDF : Permettre l'export de facture

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

---

## 📦 ÉTAPE 5 : EPIC 5 — Matching et discipline
**Objectif :** Gérer automatiquement la compatibilité missions chauffeurs et les règles de sanction
**Priorité :** Critique | **Labels :** mvp,backend | **Rôle :** Développeur Full-Stack

### 5.1 — STORY 5.1 — Modèle de qualification chauffeur
> En tant que plateforme je connais les qualifications valides du chauffeur
> Priorité: Critique | Labels: backend,database

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 5.1 — Modèle de qualification chauffeur
DESCRIPTION : En tant que plateforme je connais les qualifications valides du chauffeur
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Créer champs permis : Ajouter les champs C CE et autres si nécessaire
- [Haute] Créer champs options ADR et Frigo : Ajouter les qualifications complémentaires
- [Critique] Créer logique qualification validée : Déduire l'état exploitable des documents
- [Critique] Bloquer qualification si document invalide : Empêcher l'usage d'un document expiré ou rejeté
- [Normale] Prévoir extensibilité future : Concevoir des règles ajoutables
- [Haute] Géocoder ville chauffeur : Obtenir des coordonnées pour la localisation chauffeur
- [Haute] Géocoder lieu mission : Obtenir des coordonnées pour le lieu de mission

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 5.2 — STORY 5.2 — Calcul de distance
> En tant que plateforme je calcule la distance entre le chauffeur et la mission
> Priorité: Critique | Labels: backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 5.2 — Calcul de distance
DESCRIPTION : En tant que plateforme je calcule la distance entre le chauffeur et la mission
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Calculer distance km : Mesurer la distance entre les deux points
- [Haute] Définir rayon max configurable : Permettre l'ajustement métier de la distance acceptable
- [Normale] Stocker distance calculée si nécessaire : Optimiser l'affichage ou la recherche
- [Haute] Tester cas hors zone : Vérifier le rejet des missions trop éloignées
- [Critique] Exclure profils EN_ATTENTE : Ne pas afficher les missions aux profils non validés
- [Critique] Exclure profils SUSPENDU : Bloquer temporairement l'accès aux missions
- [Critique] Exclure profils RADIE : Bloquer définitivement l'accès aux missions

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 5.3 — STORY 5.3 — Algorithme de matching
> En tant que chauffeur je ne vois que les missions compatibles
> Priorité: Critique | Labels: backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 5.3 — Algorithme de matching
DESCRIPTION : En tant que chauffeur je ne vois que les missions compatibles
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Vérifier permis compatibles : Comparer permis chauffeur et exigences mission
- [Critique] Vérifier documents valides : Contrôler la conformité des pièces
- [Critique] Vérifier distance compatible : Appliquer le filtre géographique
- [Critique] Vérifier fenêtre priorité favoris : Filtrer selon la priorité de diffusion
- [Critique] Retourner liste missions filtrées : Servir les résultats compatibles au front
- [Haute] Écrire tests unitaires matching : Sécuriser le comportement métier
- [Critique] Passer mission de OUVERTE à POURVUE : Changer l'état après acceptation

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 5.4 — STORY 5.4 — Cycle mission
> En tant que plateforme je trace les changements d'état d'une mission
> Priorité: Critique | Labels: backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 5.4 — Cycle mission
DESCRIPTION : En tant que plateforme je trace les changements d'état d'une mission
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Associer chauffeur à mission : Enregistrer l'affectation
- [Haute] Gérer annulation entreprise : Prévoir le changement d'état côté société
- [Haute] Gérer annulation chauffeur : Prévoir le changement d'état côté chauffeur
- [Critique] Gérer mission terminée : Clôturer la mission après exécution
- [Haute] Gérer historique des statuts : Journaliser les transitions
- [Haute] Planifier notification J-1 : Créer la logique de rappel veille
- [Haute] Planifier notification matin J : Créer la logique de rappel jour J

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 5.5 — STORY 5.5 — Rappels mission
> En tant que plateforme j'envoie les relances nécessaires avant mission
> Priorité: Haute | Labels: notifications,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 5.5 — Rappels mission
DESCRIPTION : En tant que plateforme j'envoie les relances nécessaires avant mission
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Déclencher envoi automatique : Connecter les jobs au service mail
- [Normale] Journaliser les envois : Tracer succès et erreurs
- [Normale] Gérer échec d'envoi : Prévoir reprises ou alertes

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

---

## 📦 ÉTAPE 6 : EPIC 6 — Back-office administrateur
**Objectif :** Créer l'interface de pilotage exploitation conformité et contrôle
**Priorité :** Critique | **Labels :** mvp,admin,frontend,backend | **Rôle :** Développeur Full-Stack

### 6.1 — STORY 6.1 — Dashboard administrateur
> En tant qu'administrateur je vois les indicateurs clés de Vectura
> Priorité: Critique | Labels: admin,frontend,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 6.1 — Dashboard administrateur
DESCRIPTION : En tant qu'administrateur je vois les indicateurs clés de Vectura
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Normale] Concevoir wireframe dashboard admin : Définir la structure du centre de contrôle
- [Normale] Concevoir maquette dashboard admin : Créer la maquette visuelle du tableau de bord
- [Critique] Développer KPI missions en cours : Afficher le nombre de chauffeurs en mission
- [Critique] Développer KPI alertes documents : Afficher les alertes d'expiration proches
- [Critique] Développer KPI nouveaux inscrits : Afficher les profils en attente d'entretien
- [Haute] Développer KPI CA semaine : Afficher le chiffre d'affaires hebdomadaire
- [Normale] Ajouter états de chargement : Prévoir loading et fallback sur les KPI

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 6.2 — STORY 6.2 — Gestion des chauffeurs
> En tant qu'administrateur je peux filtrer et piloter les profils chauffeurs
> Priorité: Critique | Labels: admin,frontend,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 6.2 — Gestion des chauffeurs
DESCRIPTION : En tant qu'administrateur je peux filtrer et piloter les profils chauffeurs
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Développer tableau chauffeurs : Créer la liste principale admin
- [Critique] Ajouter colonnes nom prénom téléphone : Afficher les infos principales
- [Critique] Ajouter colonne statut : Afficher validé en attente suspendu radié
- [Haute] Ajouter colonne qualifications : Afficher C CE ADR Frigo
- [Normale] Ajouter colonne note moyenne : Afficher la moyenne des évaluations
- [Haute] Ajouter filtres par statut : Faciliter le tri opérationnel
- [Haute] Ajouter recherche par nom téléphone : Faciliter l'accès rapide à un profil

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 6.3 — STORY 6.3 — Validation documents
> En tant qu'administrateur je peux contrôler les documents chauffeurs
> Priorité: Critique | Labels: admin,backend,compliance

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 6.3 — Validation documents
DESCRIPTION : En tant qu'administrateur je peux contrôler les documents chauffeurs
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Développer vue détail chauffeur : Afficher les détails d'un dossier
- [Critique] Afficher documents uploadés : Présenter les pièces envoyées
- [Critique] Afficher dates d'expiration : Montrer les échéances documentaires
- [Critique] Ajouter bouton valider document : Permettre la validation individuelle
- [Critique] Ajouter bouton rejeter document : Permettre le rejet motivé
- [Haute] Journaliser validation rejet : Tracer l'action et son auteur
- [Haute] Notifier chauffeur après action : Informer le chauffeur du résultat

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 6.4 — STORY 6.4 — Suivi des missions
> En tant qu'administrateur je peux surveiller l'exploitation des missions
> Priorité: Haute | Labels: admin,frontend,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 6.4 — Suivi des missions
DESCRIPTION : En tant qu'administrateur je peux surveiller l'exploitation des missions
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Développer liste missions non pourvues : Afficher les missions urgentes à couvrir
- [Haute] Développer liste missions à venir : Afficher les missions planifiées
- [Normale] Développer historique missions : Afficher les missions passées et leurs statuts
- [Normale] Ajouter filtres date et statut : Faciliter le pilotage quotidien
- [Normale] Ajouter accès détail mission : Permettre la consultation détaillée
- [Critique] Identifier attestations URSSAF de plus de 6 mois : Détecter automatiquement les dossiers non conformes
- [Haute] Développer vue conformité : Créer l'écran de suivi vigilance

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 6.5 — STORY 6.5 — Conformité vigilance
> En tant qu'administrateur je peux suivre la conformité URSSAF
> Priorité: Critique | Labels: admin,compliance

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 6.5 — Conformité vigilance
DESCRIPTION : En tant qu'administrateur je peux suivre la conformité URSSAF
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Ajouter bouton relance mail type : Permettre l'envoi rapide d'une relance
- [Normale] Journaliser relances conformité : Tracer les envois et leurs dates
- [Critique] Bloquer visibilité missions si non conforme : Appliquer la règle métier décidée

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

---

## 📦 ÉTAPE 7 : EPIC 7 — Notifications et automatisation
**Objectif :** Automatiser les alertes documents missions et sanctions
**Priorité :** Haute | **Labels :** mvp,notifications,backend | **Rôle :** Admin Système

### 7.1 — STORY 7.1 — Service e-mail
> En tant que plateforme je peux envoyer des messages transactionnels
> Priorité: Haute | Labels: notifications,infra,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 7.1 — Service e-mail
DESCRIPTION : En tant que plateforme je peux envoyer des messages transactionnels
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Choisir fournisseur SMTP API : Sélectionner le service d'envoi
- [Critique] Configurer service mail : Brancher l'application au fournisseur retenu
- [Haute] Créer template expiration document : Préparer le modèle de mail dédié
- [Haute] Créer template rappel mission : Préparer le modèle de rappel
- [Haute] Créer template relance conformité : Préparer le modèle de conformité
- [Haute] Créer template validation rejet document : Préparer le modèle de retour admin
- [Critique] Créer job quotidien documents : Planifier l'analyse quotidienne des échéances

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 7.2 — STORY 7.2 — Alertes documents
> En tant que plateforme je relance avant expiration des documents
> Priorité: Critique | Labels: notifications,backend,compliance

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 7.2 — Alertes documents
DESCRIPTION : En tant que plateforme je relance avant expiration des documents
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Détecter expirations à J-30 : Identifier les documents proches d'expiration
- [Haute] Détecter expirations à J-7 : Identifier les urgences proches
- [Critique] Envoyer notifications documents : Envoyer les relances au chauffeur
- [Normale] Journaliser résultats alertes : Tracer les envois et retours
- [Normale] Empêcher doublons excessifs : Éviter les relances répétées non contrôlées
- [Haute] Créer job J-1 : Planifier la relance la veille
- [Haute] Créer job matin J : Planifier la relance du jour même

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 7.3 — STORY 7.3 — Relances mission
> En tant que plateforme je rappelle les missions avant leur démarrage
> Priorité: Haute | Labels: notifications,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 7.3 — Relances mission
DESCRIPTION : En tant que plateforme je rappelle les missions avant leur démarrage
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Filtrer missions concernées : Sélectionner les bonnes missions
- [Haute] Envoyer mail chauffeur : Notifier le chauffeur
- [Normale] Envoyer mail entreprise si besoin : Notifier la société selon le scénario
- [Normale] Journaliser succès et échecs : Conserver l'historique des envois
- [Critique] Créer job contrôle annulations tardives : Détecter les annulations hors délai
- [Critique] Appliquer suspension 7 jours : Mettre à jour le compte du chauffeur
- [Critique] Appliquer radiation au troisième cas : Déclencher la radiation automatique

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 7.4 — STORY 7.4 — Sanctions automatiques
> En tant que plateforme j'applique automatiquement les sanctions liées aux annulations
> Priorité: Critique | Labels: backend,compliance

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 7.4 — Sanctions automatiques
DESCRIPTION : En tant que plateforme j'applique automatiquement les sanctions liées aux annulations
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Notifier chauffeur sanctionné : Envoyer un mail explicatif
- [Haute] Afficher sanction dans back office : Rendre visible la mesure côté admin

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

---

## 📦 ÉTAPE 8 : EPIC 8 — Facturation et export comptable
**Objectif :** Automatiser la génération de factures et les exports de suivi financier
**Priorité :** Haute | **Labels :** mvp,billing,backend,admin | **Rôle :** Développeur Full-Stack

### 8.1 — STORY 8.1 — Données financières mission
> En tant que plateforme je calcule les montants liés à chaque mission
> Priorité: Critique | Labels: billing,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 8.1 — Données financières mission
DESCRIPTION : En tant que plateforme je calcule les montants liés à chaque mission
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Définir modèle montant facturé entreprise : Spécifier la donnée facturable côté société
- [Haute] Définir modèle montant reversé chauffeur : Spécifier la donnée de reversement
- [Critique] Définir calcul marge : Calculer l'écart entre facture et reversement
- [Haute] Gérer cas mission annulée : Définir le comportement financier des annulations
- [Critique] Gérer cas mission validée : Définir le comportement financier des missions exécutées
- [Critique] Créer job hebdomadaire facturation : Planifier la génération des factures
- [Critique] Regrouper missions validées par entreprise : Consolider les missions facturables

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 8.2 — STORY 8.2 — Facture hebdomadaire
> En tant qu'entreprise je reçois une facture hebdomadaire récapitulative
> Priorité: Critique | Labels: billing,backend

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 8.2 — Facture hebdomadaire
DESCRIPTION : En tant qu'entreprise je reçois une facture hebdomadaire récapitulative
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Générer numéro de facture : Créer un identifiant unique de facture
- [Critique] Générer PDF facture : Produire le document final
- [Haute] Stocker facture : Sauvegarder le PDF généré
- [Haute] Rendre facture téléchargeable : Exposer le document à l'utilisateur concerné
- [Haute] Générer export CSV : Créer le fichier comptable CSV
- [Normale] Générer export Excel : Créer le fichier comptable Excel
- [Haute] Inclure facture mission dates montants : Définir les colonnes utiles à la comptabilité

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 8.3 — STORY 8.3 — Export comptable
> En tant qu'administrateur je peux exporter les données de facturation
> Priorité: Haute | Labels: billing,admin

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 8.3 — Export comptable
DESCRIPTION : En tant qu'administrateur je peux exporter les données de facturation
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Normale] Tester format comptable : Vérifier l'exploitabilité par le comptable
- [Haute] Ajouter téléchargement admin : Permettre l'export côté back office
- [Normale] Ajouter téléchargement entreprise si besoin : Prévoir l'accès société selon périmètre retenu
- [Normale] Calculer marge par mission : Produire la marge unitaire
- [Normale] Calculer marge hebdomadaire : Produire l'agrégat sur la semaine
- [Normale] Afficher marge dans dashboard admin : Exposer l'indicateur dans le back office
- [Normale] Prévoir filtre par période : Permettre l'analyse temporelle

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 8.4 — STORY 8.4 — Marge admin
> En tant qu'administrateur je peux visualiser la marge générée
> Priorité: Normale | Labels: billing,admin

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 8.4 — Marge admin
DESCRIPTION : En tant qu'administrateur je peux visualiser la marge générée
PRIORITÉ : Normale

TASKS À IMPLÉMENTER DANS CETTE STORY :

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

---

## 📦 ÉTAPE 9 : EPIC 9 — QA recette et lancement
**Objectif :** Tester stabiliser et déployer le MVP Vectura
**Priorité :** Critique | **Labels :** mvp,qa,deploy | **Rôle :** Toi / PO

### 9.1 — STORY 9.1 — QA fonctionnelle
> En tant qu'équipe projet nous validons les parcours métier clés
> Priorité: Critique | Labels: qa

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 9.1 — QA fonctionnelle
DESCRIPTION : En tant qu'équipe projet nous validons les parcours métier clés
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Tester inscription chauffeur : Vérifier le parcours complet d'inscription
- [Critique] Tester inscription entreprise : Vérifier le parcours société
- [Critique] Tester login logout : Vérifier les accès et déconnexions
- [Critique] Tester upload documents : Vérifier le dépôt et la validation de fichiers
- [Critique] Tester validation admin : Vérifier les actions du back office
- [Critique] Tester création mission : Vérifier la publication côté entreprise
- [Critique] Tester matching : Vérifier la cohérence des missions visibles

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 9.2 — STORY 9.2 — QA sécurité
> En tant qu'équipe projet nous validons les protections minimales du produit
> Priorité: Critique | Labels: qa,security

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 9.2 — QA sécurité
DESCRIPTION : En tant qu'équipe projet nous validons les protections minimales du produit
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Tester annulation tardive : Vérifier suspension et compteur
- [Haute] Tester facturation : Vérifier calculs et génération
- [Normale] Tester exports : Vérifier téléchargement et format
- [Critique] Tester accès non autorisés : Vérifier que chaque rôle reste à sa place
- [Critique] Tester rôles et permissions : Vérifier les habilitations fonctionnelles
- [Critique] Tester upload malveillant : Vérifier les contrôles de sécurité
- [Haute] Tester erreurs API : Vérifier les retours et logs

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 9.3 — STORY 9.3 — Préproduction
> En tant qu'équipe projet nous validons l'environnement de staging avant production
> Priorité: Critique | Labels: deploy,infra

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 9.3 — Préproduction
DESCRIPTION : En tant qu'équipe projet nous validons l'environnement de staging avant production
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Haute] Tester limites taille fichier : Vérifier le contrôle anti abus
- [Normale] Tester journalisation incidents : Vérifier la traçabilité sécurité
- [Critique] Déployer staging : Créer la préproduction complète
- [Haute] Injecter données de test : Préparer un jeu de test réaliste
- [Haute] Vérifier mails automatiques : Contrôler les notifications avant production
- [Critique] Vérifier cron jobs : Contrôler les tâches planifiées
- [Critique] Vérifier sauvegardes : Contrôler la stratégie de backup

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 9.4 — STORY 9.4 — Production
> En tant qu'équipe projet nous mettons en ligne le MVP
> Priorité: Critique | Labels: deploy,infra

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 9.4 — Production
DESCRIPTION : En tant qu'équipe projet nous mettons en ligne le MVP
PRIORITÉ : Critique

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Normale] Vérifier performance minimale : Contrôler la tenue de la plateforme
- [Critique] Déployer production : Mettre en ligne la plateforme
- [Critique] Configurer domaine final : Brancher le nom de domaine officiel
- [Critique] Activer SSL final : Sécuriser l'accès HTTPS
- [Critique] Exécuter migrations production : Mettre à jour la base de prod
- [Haute] Vérifier monitoring : Confirmer la supervision après mise en ligne
- [Critique] Vérifier disponibilité publique : Tester le service côté utilisateur réel

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

### 9.5 — STORY 9.5 — Stabilisation
> En tant qu'équipe projet nous corrigeons et priorisons l'après lancement
> Priorité: Haute | Labels: qa,product

#### 💬 PROMPT Blackbox
```
Implémente la story suivante du projet Vectura :

STORY : STORY 9.5 — Stabilisation
DESCRIPTION : En tant qu'équipe projet nous corrigeons et priorisons l'après lancement
PRIORITÉ : Haute

TASKS À IMPLÉMENTER DANS CETTE STORY :
- [Critique] Corriger bugs post lancement : Traiter les incidents des premiers jours
- [Critique] Suivre erreurs critiques : Analyser les erreurs prioritaires
- [Normale] Ajuster UX selon retours terrain : Améliorer les écrans selon usage réel
- [Normale] Ajuster règles métier si besoin : Faire évoluer les règles opérationnelles
- [Normale] Prioriser V1 après MVP : Préparer la roadmap après lancement

INSTRUCTIONS :
1. Commence par lister les fichiers à créer/modifier
2. Implémente chaque fichier un par un avec son contenu COMPLET
3. Pour le backend : routes Express + controllers + services + modèles Prisma
4. Pour le frontend : composants React + hooks personnalisés + appels API
5. Ajoute les validations Zod côté backend
6. Ajoute les tests unitaires pour la logique métier critique
7. Vérifie la cohérence avec les étapes précédentes déjà implémentées

Fournis d'abord la liste des fichiers, puis le contenu de chaque fichier prêt à copier-coller.
```

#### ✅ Checklist de validation
- [ ] Tous les fichiers générés sont copiés dans le projet
- [ ] `docker-compose up` démarre sans erreur
- [ ] Les routes API répondent correctement (test via Postman/curl)
- [ ] L'interface s'affiche correctement dans le navigateur
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur ESLint (`npm run lint`)
- [ ] Les tests passent (`npm test`)

---


## 📋 RÉCAPITULATIF GLOBAL

### Ordre d'implémentation

| # | Étape | Statut | Date |
|---|-------|--------|------|

| 1 | EPIC 1 — Socle technique | ⬜ | |
| 2 | EPIC 2 — Landing page publique | ⬜ | |
| 3 | EPIC 3 — Espace Chauffeur | ⬜ | |
| 4 | EPIC 4 — Espace Entreprise | ⬜ | |
| 5 | EPIC 5 — Matching et discipline | ⬜ | |
| 6 | EPIC 6 — Back-office administrateur | ⬜ | |
| 7 | EPIC 7 — Notifications et automatisation | ⬜ | |
| 8 | EPIC 8 — Facturation et export comptable | ⬜ | |
| 9 | EPIC 9 — QA recette et lancement | ⬜ | |

### Commandes utiles

```bash
# Démarrer le projet
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Lancer les tests
npm run test

# Vérifier TypeScript
npm run type-check

# Linter
npm run lint

# Format
cd backend && npx prisma migrate dev
```

### Structure de dossiers cible

```
vectura/
├── docker-compose.yml
├── .env.example
├── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── utils/
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
└── nginx/
    └── nginx.conf
```

---

*Généré automatiquement depuis le backlog Vectura — Dernière mise à jour : 2026-06-10*
