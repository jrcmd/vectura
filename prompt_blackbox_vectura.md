# 🚀 PROMPT BLACKBOX (VS Code) — DÉVELOPPEMENT MVP VECTURA

> Contexte : Tu es un développeur full-stack senior. Tu dois implémenter le projet Vectura, une plateforme de mise en relation entre chauffeurs PL/SPL et entreprises de transport, étape par étape, dans l'ordre chronologique du backlog.

> Stack technique : React + TypeScript (frontend) | Node.js + Express + TypeScript (backend) | PostgreSQL | Redis | Docker | JWT | Nodemailer/SMTP

> Règles : 
> - Implémente UNE SEULE étape à la fois (une story ou un groupe de tasks cohérent)
> - Attends ma validation avant de passer à la suivante
> - Propose le code complet, testé et fonctionnel
> - Respecte les conventions de nommage et la structure de dossiers
> - Ajoute des commentaires explicatifs en français

---


## 📦 ÉTAPE 1 : EPIC 1 — Socle technique
**Objectif :** Mettre en place la base technique exploitable du produit Vectura
**Priorité :** Critique

### 📖 1.1 — STORY 1.1 — Initialiser le projet
> *En tant qu'équipe projet nous avons besoin d'une base de code propre pour démarrer le développement* | Priorité: Critique

### 📖 1.2 — STORY 1.2 — Mettre en place Docker
> *En tant qu'équipe projet nous avons besoin d'environnements homogènes via conteneurs* | Priorité: Critique

### 📖 1.3 — STORY 1.3 — Préparer les environnements
> *En tant qu'équipe projet nous avons besoin d'une configuration claire par environnement* | Priorité: Critique

### 📖 1.4 — STORY 1.4 — Mettre en place la base de données
> *En tant que système Vectura nous avons besoin d'une base relationnelle fiable* | Priorité: Critique

### 📖 1.5 — STORY 1.5 — Mettre en place CI CD
> *En tant qu'équipe projet nous avons besoin d'automatiser qualité et déploiement* | Priorité: Haute

#### 🔧 Tasks à implémenter :

- [ ] **Créer le repository Git**
  - Description : Créer le dépôt principal et définir la structure initiale du projet
  - Priorité : Critique | Labels : infra | Rôle : Admin Système

- [ ] **Définir la convention de branches**
  - Description : Définir main develop feature hotfix et règles de merge
  - Priorité : Haute | Labels : infra,process | Rôle : Admin Système

- [ ] **Initialiser le frontend**
  - Description : Créer l'application frontend avec structure de base
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Initialiser le backend**
  - Description : Créer l'API backend avec structure de base
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter TypeScript**
  - Description : Configurer TypeScript sur le frontend et le backend
  - Priorité : Haute | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Créer la structure dossiers front et back**
  - Description : Organiser composants routes services modèles utilitaires et configuration
  - Priorité : Haute | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter README technique initial**
  - Description : Documenter démarrage local architecture et conventions
  - Priorité : Normale | Labels : documentation | Rôle : Admin Système

- [ ] **Créer docker-compose.yml**
  - Description : Définir les services nécessaires au projet
  - Priorité : Critique | Labels : infra,docker | Rôle : Admin Système

- [ ] **Ajouter service frontend**
  - Description : Conteneuriser l'application frontend
  - Priorité : Critique | Labels : infra,docker,frontend | Rôle : Admin Système

- [ ] **Ajouter service backend**
  - Description : Conteneuriser l'API backend
  - Priorité : Critique | Labels : infra,docker,backend | Rôle : Admin Système

- [ ] **Ajouter service PostgreSQL**
  - Description : Déployer la base PostgreSQL avec persistance
  - Priorité : Critique | Labels : infra,database | Rôle : Admin Système

- [ ] **Ajouter service Redis**
  - Description : Déployer Redis pour cache files et tâches
  - Priorité : Haute | Labels : infra,backend | Rôle : Admin Système

- [ ] **Ajouter volumes persistants**
  - Description : Persister base de données uploads et logs
  - Priorité : Critique | Labels : infra,docker | Rôle : Admin Système

- [ ] **Ajouter réseau Docker interne**
  - Description : Isoler les services et organiser la communication interne
  - Priorité : Haute | Labels : infra,docker | Rôle : Admin Système

- [ ] **Documenter commandes de démarrage**
  - Description : Lister les commandes utiles pour lancer et arrêter le projet
  - Priorité : Normale | Labels : documentation | Rôle : Admin Système

- [ ] **Créer .env.example**
  - Description : Lister toutes les variables nécessaires au projet
  - Priorité : Critique | Labels : infra | Rôle : Admin Système

- [ ] **Définir variables frontend**
  - Description : Déclarer URL API mode debug et autres paramètres front
  - Priorité : Haute | Labels : frontend,infra | Rôle : Développeur Full-Stack

- [ ] **Définir variables backend**
  - Description : Déclarer port secrets services tiers et options serveur
  - Priorité : Critique | Labels : backend,infra | Rôle : Développeur Full-Stack

- [ ] **Définir variables DB**
  - Description : Déclarer hôte port nom base utilisateur mot de passe
  - Priorité : Critique | Labels : database,infra | Rôle : Admin Système

- [ ] **Définir variables SMTP**
  - Description : Déclarer configuration du service mail
  - Priorité : Haute | Labels : notifications,infra | Rôle : Admin Système

- [ ] **Définir variables stockage fichiers**
  - Description : Déclarer chemin ou bucket de stockage des documents
  - Priorité : Critique | Labels : infra,security | Rôle : Admin Système

- [ ] **Définir variables JWT**
  - Description : Déclarer secrets et durées de session
  - Priorité : Critique | Labels : backend,security | Rôle : Développeur Full-Stack

- [ ] **Créer la connexion PostgreSQL**
  - Description : Configurer la connexion applicative à la base
  - Priorité : Critique | Labels : database,backend | Rôle : Développeur Full-Stack

- [ ] **Configurer ORM ou query builder**
  - Description : Choisir et intégrer l'outil d'accès aux données
  - Priorité : Haute | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Créer système de migrations**
  - Description : Permettre l'évolution contrôlée du schéma de base
  - Priorité : Critique | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Créer seed de base**
  - Description : Préparer des données de test minimales
  - Priorité : Normale | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Tester le démarrage local**
  - Description : Vérifier que la base démarre correctement avec l'application
  - Priorité : Haute | Labels : backend,infra | Rôle : Développeur Full-Stack

- [ ] **Documenter reset DB**
  - Description : Décrire la procédure de remise à zéro en dev
  - Priorité : Normale | Labels : documentation,database | Rôle : Admin Système

- [ ] **Configurer lint frontend**
  - Description : Automatiser le contrôle qualité du code frontend
  - Priorité : Haute | Labels : frontend,quality | Rôle : Développeur Full-Stack

- [ ] **Configurer lint backend**
  - Description : Automatiser le contrôle qualité du code backend
  - Priorité : Haute | Labels : backend,quality | Rôle : Développeur Full-Stack

- [ ] **Configurer pipeline test**
  - Description : Lancer automatiquement les tests sur chaque push
  - Priorité : Haute | Labels : infra,quality | Rôle : Admin Système

- [ ] **Configurer pipeline build**
  - Description : Vérifier la construction des artefacts applicatifs
  - Priorité : Haute | Labels : infra | Rôle : Admin Système

- [ ] **Configurer pipeline staging**
  - Description : Déployer automatiquement en préproduction
  - Priorité : Haute | Labels : infra,deploy | Rôle : Admin Système

- [ ] **Préparer stratégie de déploiement production**
  - Description : Définir le mode de déploiement et la validation
  - Priorité : Critique | Labels : infra,deploy | Rôle : Admin Système

- [ ] **Prévoir rollback minimal**
  - Description : Permettre un retour arrière rapide en cas d'incident
  - Priorité : Critique | Labels : infra,deploy | Rôle : Admin Système

---

## 📦 ÉTAPE 2 : EPIC 2 — Landing page publique
**Objectif :** Créer la vitrine publique de Vectura pour convertir chauffeurs et entreprises
**Priorité :** Haute

### 📖 2.1 — STORY 2.1 — Concevoir l'arborescence publique
> *En tant que visiteur je comprends rapidement l'offre et les actions disponibles* | Priorité: Haute

### 📖 2.2 — STORY 2.2 — Produire les wireframes landing
> *En tant qu'équipe projet nous avons besoin d'une base UX avant la maquette finale* | Priorité: Haute

### 📖 2.3 — STORY 2.3 — Produire la maquette UI
> *En tant qu'équipe projet nous avons besoin d'un design system visuel cohérent* | Priorité: Haute

### 📖 2.4 — STORY 2.4 — Développer la landing
> *En tant que visiteur je peux accéder à une page publique claire et responsive* | Priorité: Haute

### 📖 2.5 — STORY 2.5 — Prévoir acquisition
> *En tant que porteur du projet je peux capter des inscrits depuis les supports marketing* | Priorité: Normale

#### 🔧 Tasks à implémenter :

- [ ] **Définir sections landing**
  - Description : Structurer hero bénéfices fonctionnement preuves et footer
  - Priorité : Haute | Labels : ux | Rôle : UI/UX Designer

- [ ] **Définir hiérarchie des CTA**
  - Description : Mettre en avant chauffeur et entreprise avec priorités visuelles
  - Priorité : Haute | Labels : ux | Rôle : UI/UX Designer

- [ ] **Définir messages de réassurance**
  - Description : Préparer arguments confiance conformité et simplicité
  - Priorité : Haute | Labels : ux,content | Rôle : UI/UX Designer

- [ ] **Définir parcours mobile first**
  - Description : Prévoir une navigation efficace sur smartphone
  - Priorité : Haute | Labels : ux,mobile | Rôle : UI/UX Designer

- [ ] **Wireframe hero section**
  - Description : Dessiner la zone d'entrée principale avec CTA
  - Priorité : Haute | Labels : ux | Rôle : UI/UX Designer

- [ ] **Wireframe bloc bénéfices chauffeur**
  - Description : Présenter l'intérêt du service pour les chauffeurs
  - Priorité : Normale | Labels : ux | Rôle : UI/UX Designer

- [ ] **Wireframe bloc bénéfices entreprise**
  - Description : Présenter l'intérêt du service pour les entreprises
  - Priorité : Normale | Labels : ux | Rôle : UI/UX Designer

- [ ] **Wireframe bloc fonctionnement**
  - Description : Illustrer le cycle inscription mission validation
  - Priorité : Normale | Labels : ux | Rôle : UI/UX Designer

- [ ] **Wireframe footer légal**
  - Description : Prévoir liens vers mentions et confidentialité
  - Priorité : Normale | Labels : ux | Rôle : UI/UX Designer

- [ ] **Wireframe version mobile**
  - Description : Adapter le parcours et les sections à petit écran
  - Priorité : Haute | Labels : ux,mobile | Rôle : UI/UX Designer

- [ ] **Définir palette CTA chauffeur**
  - Description : Choisir une couleur vive et cohérente
  - Priorité : Normale | Labels : ui | Rôle : UI/UX Designer

- [ ] **Définir palette CTA entreprise**
  - Description : Choisir une couleur sobre et professionnelle
  - Priorité : Normale | Labels : ui | Rôle : UI/UX Designer

- [ ] **Définir typographie**
  - Description : Choisir la hiérarchie visuelle des textes
  - Priorité : Normale | Labels : ui | Rôle : UI/UX Designer

- [ ] **Définir composants landing**
  - Description : Créer boutons cartes sections et footer
  - Priorité : Normale | Labels : ui,design-system | Rôle : UI/UX Designer

- [ ] **Définir style cartes et boutons**
  - Description : Spécifier états et variantes visuelles
  - Priorité : Normale | Labels : ui | Rôle : UI/UX Designer

- [ ] **Définir états hover focus**
  - Description : Spécifier les interactions utilisateur
  - Priorité : Normale | Labels : ui,accessibility | Rôle : UI/UX Designer

- [ ] **Intégrer header**
  - Description : Développer l'en-tête public avec navigation
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Intégrer hero et doubles CTA**
  - Description : Développer la section d'accroche principale
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Intégrer sections réassurance**
  - Description : Développer les preuves de confiance et bénéfices
  - Priorité : Normale | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Intégrer bloc fonctionnement**
  - Description : Développer la section explicative du service
  - Priorité : Normale | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Intégrer footer**
  - Description : Développer le pied de page avec liens utiles
  - Priorité : Normale | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Rendre la page responsive**
  - Description : Adapter la page mobile tablette desktop
  - Priorité : Critique | Labels : frontend,mobile | Rôle : Développeur Full-Stack

- [ ] **Optimiser performances mobile**
  - Description : Réduire poids et améliorer vitesse d'affichage
  - Priorité : Normale | Labels : frontend,performance | Rôle : Développeur Full-Stack

- [ ] **Ajouter emplacement QR code**
  - Description : Prévoir un bloc dédié pour les flyers
  - Priorité : Normale | Labels : frontend,marketing | Rôle : Développeur Full-Stack

- [ ] **Créer bouton vers inscription chauffeur**
  - Description : Relier le CTA chauffeur à son parcours
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Créer bouton vers espace entreprise**
  - Description : Relier le CTA entreprise à son parcours
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter tracking clic CTA**
  - Description : Mesurer les conversions sur les boutons principaux
  - Priorité : Normale | Labels : frontend,analytics | Rôle : Développeur Full-Stack

- [ ] **Ajouter métadonnées SEO**
  - Description : Améliorer la visibilité et le partage de la page
  - Priorité : Normale | Labels : frontend,seo | Rôle : Développeur Full-Stack

- [ ] **Ajouter page mentions légales**
  - Description : Créer la page légale minimale
  - Priorité : Critique | Labels : frontend,legal | Rôle : Développeur Full-Stack

- [ ] **Ajouter page politique confidentialité**
  - Description : Créer la page RGPD minimale
  - Priorité : Critique | Labels : frontend,legal,compliance | Rôle : Développeur Full-Stack

---

## 📦 ÉTAPE 3 : EPIC 3 — Espace Chauffeur
**Objectif :** Permettre l'inscription chauffeur le dépôt documentaire et l'accès contrôlé aux missions
**Priorité :** Critique

### 📖 3.1 — STORY 3.1 — Inscription chauffeur
> *En tant que chauffeur je peux créer mon compte* | Priorité: Critique

### 📖 3.2 — STORY 3.2 — Authentification chauffeur
> *En tant que chauffeur je peux me connecter et accéder à mon espace* | Priorité: Critique

### 📖 3.3 — STORY 3.3 — Dépôt de documents
> *En tant que chauffeur je peux déposer mes pièces justificatives* | Priorité: Critique

### 📖 3.4 — STORY 3.4 — Tableau de bord chauffeur
> *En tant que chauffeur je peux voir mon statut et mes missions* | Priorité: Haute

### 📖 3.5 — STORY 3.5 — Consultation mission
> *En tant que chauffeur je peux consulter et accepter une mission* | Priorité: Critique

### 📖 3.6 — STORY 3.6 — Discipline chauffeur
> *En tant que plateforme je gère les annulations tardives automatiquement* | Priorité: Critique

#### 🔧 Tasks à implémenter :

- [ ] **Concevoir wireframe formulaire inscription**
  - Description : Définir l'organisation du formulaire d'entrée
  - Priorité : Haute | Labels : ux | Rôle : UI/UX Designer

- [ ] **Concevoir maquette formulaire inscription**
  - Description : Créer la version UI finale du formulaire
  - Priorité : Haute | Labels : ux,ui | Rôle : UI/UX Designer

- [ ] **Développer formulaire front**
  - Description : Coder le formulaire d'inscription chauffeur
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter validation nom et prénom**
  - Description : Contrôler les champs obligatoires
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter validation téléphone**
  - Description : Contrôler le format du numéro
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter champ ville avec auto-complétion**
  - Description : Permettre la sélection assistée de la ville
  - Priorité : Haute | Labels : frontend,ux | Rôle : Développeur Full-Stack

- [ ] **Créer endpoint API inscription**
  - Description : Créer la route backend d'enregistrement chauffeur
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Sauvegarder chauffeur en base**
  - Description : Persister le profil et ses informations initiales
  - Priorité : Critique | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Définir statut EN_ATTENTE par défaut**
  - Description : Appliquer le statut initial au nouveau chauffeur
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Développer écran connexion chauffeur**
  - Description : Créer l'interface de login
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Créer endpoint login chauffeur**
  - Description : Créer la route de connexion sécurisée
  - Priorité : Critique | Labels : backend,security | Rôle : Développeur Full-Stack

- [ ] **Générer token de session**
  - Description : Mettre en place l'authentification sécurisée
  - Priorité : Critique | Labels : backend,security | Rôle : Développeur Full-Stack

- [ ] **Protéger routes chauffeur**
  - Description : Limiter l'accès aux pages privées
  - Priorité : Critique | Labels : frontend,backend,security | Rôle : Développeur Full-Stack

- [ ] **Ajouter déconnexion**
  - Description : Permettre la fermeture de session
  - Priorité : Normale | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Prévoir reset mot de passe**
  - Description : Créer le flux minimal de récupération
  - Priorité : Normale | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Concevoir bloc upload documents**
  - Description : Définir l'expérience d'ajout de documents
  - Priorité : Haute | Labels : ux,ui | Rôle : UI/UX Designer

- [ ] **Développer composants upload**
  - Description : Coder les champs d'envoi de fichiers
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Gérer upload permis C CE**
  - Description : Traiter le dépôt du permis
  - Priorité : Critique | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Gérer upload FIMO FCO**
  - Description : Traiter le dépôt FIMO ou FCO
  - Priorité : Critique | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Gérer upload carte chrono**
  - Description : Traiter le dépôt de la carte conducteur
  - Priorité : Critique | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Gérer upload Kbis**
  - Description : Traiter le dépôt du Kbis
  - Priorité : Critique | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Gérer upload attestation URSSAF**
  - Description : Traiter le dépôt de l'attestation de vigilance
  - Priorité : Critique | Labels : frontend,backend,compliance | Rôle : Développeur Full-Stack

- [ ] **Gérer upload RC Pro**
  - Description : Traiter le dépôt de l'assurance RC Pro
  - Priorité : Critique | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter date d'expiration**
  - Description : Associer une date à chaque document
  - Priorité : Critique | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Sauvegarder URL fichier en base**
  - Description : Enregistrer les références de stockage
  - Priorité : Critique | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Contrôler taille et type fichier**
  - Description : Sécuriser les uploads côté front et back
  - Priorité : Critique | Labels : backend,security | Rôle : Développeur Full-Stack

- [ ] **Concevoir wireframe dashboard chauffeur**
  - Description : Définir la hiérarchie de l'écran principal chauffeur
  - Priorité : Normale | Labels : ux | Rôle : UI/UX Designer

- [ ] **Développer bannière de statut**
  - Description : Afficher en attente validé suspendu ou radié
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Afficher documents manquants**
  - Description : Lister les pièces à compléter
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Afficher documents validés rejetés**
  - Description : Montrer le statut des documents soumis
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Afficher missions disponibles**
  - Description : Présenter la liste des missions compatibles
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter message profil en attente**
  - Description : Bloquer l'accès tant que validation admin absente
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter état vide sans mission**
  - Description : Créer un affichage clair si aucune mission
  - Priorité : Normale | Labels : frontend,ux | Rôle : Développeur Full-Stack

- [ ] **Développer liste missions**
  - Description : Créer la vue de liste
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Développer détail mission**
  - Description : Créer la vue détaillée
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Afficher lieu date horaires tarif**
  - Description : Afficher les données principales de la mission
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Afficher type camion requis**
  - Description : Montrer la qualification attendue
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter bouton accepter mission**
  - Description : Permettre l'acceptation de la mission
  - Priorité : Critique | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter confirmation d'acceptation**
  - Description : Sécuriser l'action utilisateur
  - Priorité : Normale | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter bouton désistement**
  - Description : Permettre l'annulation dans le cadre autorisé
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Bloquer désistement à H-24**
  - Description : Interdire l'annulation tardive depuis l'interface
  - Priorité : Critique | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Créer règle annulation tardive**
  - Description : Détecter les annulations sous 24 heures
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Suspendre compte 7 jours automatiquement**
  - Description : Appliquer la sanction temporaire
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Incrémenter compteur d'annulations**
  - Description : Suivre le nombre d'incidents par chauffeur
  - Priorité : Critique | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Radier au troisième désistement tardif**
  - Description : Appliquer la radiation automatique
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Afficher statut suspendu ou radié au chauffeur**
  - Description : Informer clairement l'utilisateur de sa situation
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

---

## 📦 ÉTAPE 4 : EPIC 4 — Espace Entreprise
**Objectif :** Permettre aux entreprises de créer des missions et gérer leurs relations chauffeurs
**Priorité :** Critique

### 📖 4.1 — STORY 4.1 — Compte entreprise
> *En tant qu'entreprise je peux créer et utiliser mon espace* | Priorité: Critique

### 📖 4.2 — STORY 4.2 — Création de mission
> *En tant qu'entreprise je peux publier une mission* | Priorité: Critique

### 📖 4.3 — STORY 4.3 — Tarification plancher
> *En tant que plateforme je contrôle les prix minimums* | Priorité: Critique

### 📖 4.4 — STORY 4.4 — Favoris
> *En tant qu'entreprise je peux sauvegarder des chauffeurs favoris* | Priorité: Haute

### 📖 4.5 — STORY 4.5 — Priorité favoris
> *En tant qu'entreprise je peux réserver mes missions à mes favoris au départ* | Priorité: Haute

### 📖 4.6 — STORY 4.6 — Historique et factures
> *En tant qu'entreprise je peux suivre mes missions et récupérer mes factures* | Priorité: Haute

#### 🔧 Tasks à implémenter :

- [ ] **Développer inscription entreprise**
  - Description : Créer le formulaire entreprise
  - Priorité : Critique | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Développer connexion entreprise**
  - Description : Créer le login entreprise
  - Priorité : Critique | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Créer rôle ENTREPRISE**
  - Description : Ajouter le rôle et ses permissions
  - Priorité : Critique | Labels : backend,security | Rôle : Développeur Full-Stack

- [ ] **Protéger routes entreprise**
  - Description : Limiter l'accès aux utilisateurs autorisés
  - Priorité : Critique | Labels : frontend,backend,security | Rôle : Développeur Full-Stack

- [ ] **Ajouter page profil entreprise**
  - Description : Créer la vue de profil société
  - Priorité : Normale | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Concevoir wireframe création mission**
  - Description : Définir le parcours de saisie
  - Priorité : Normale | Labels : ux | Rôle : UI/UX Designer

- [ ] **Concevoir maquette création mission**
  - Description : Créer la maquette de l'écran
  - Priorité : Normale | Labels : ux,ui | Rôle : UI/UX Designer

- [ ] **Développer formulaire mission**
  - Description : Coder le formulaire de mission
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter champ type camion**
  - Description : Créer le champ de qualification véhicule
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter champ date**
  - Description : Créer la sélection de date
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter champ horaires**
  - Description : Créer les champs d'horaire
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter champ lieu**
  - Description : Créer la saisie du lieu
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter champ description courte**
  - Description : Créer la description opérationnelle
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter champ taux horaire**
  - Description : Créer la saisie du tarif
  - Priorité : Critique | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Créer endpoint création mission**
  - Description : Créer l'API de création mission
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Enregistrer mission en base**
  - Description : Persister la mission et son statut
  - Priorité : Critique | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Définir règles PL et SPL**
  - Description : Fixer les seuils minimaux métier
  - Priorité : Critique | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter validation front prix minimum**
  - Description : Empêcher une saisie trop basse côté interface
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter validation back prix minimum**
  - Description : Empêcher une saisie trop basse côté API
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Retourner message erreur explicite**
  - Description : Informer clairement l'utilisateur
  - Priorité : Normale | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Couvrir la règle par tests**
  - Description : Assurer la non régression
  - Priorité : Haute | Labels : backend,quality | Rôle : Développeur Full-Stack

- [ ] **Ajouter bouton ajouter aux favoris**
  - Description : Permettre la mémorisation d'un chauffeur
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Créer table favoris**
  - Description : Modéliser la relation entreprise chauffeur
  - Priorité : Critique | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Développer liste favoris entreprise**
  - Description : Créer la page de gestion des favoris
  - Priorité : Haute | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter suppression favori**
  - Description : Permettre le retrait d'un favori
  - Priorité : Normale | Labels : frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter filtre favoris**
  - Description : Filtrer la liste sur l'espace entreprise
  - Priorité : Normale | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter case priorité favoris 2h**
  - Description : Créer l'option au formulaire de mission
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Enregistrer fenêtre de priorité**
  - Description : Sauvegarder la durée de priorité
  - Priorité : Critique | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Restreindre diffusion aux favoris pendant 2h**
  - Description : Appliquer la règle de diffusion initiale
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Ouvrir mission au reste des profils qualifiés après délai**
  - Description : Basculer automatiquement en diffusion générale
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter test métier de bascule**
  - Description : Valider le bon passage de priorité
  - Priorité : Haute | Labels : backend,quality | Rôle : Développeur Full-Stack

- [ ] **Développer liste missions passées**
  - Description : Créer l'historique des missions terminées
  - Priorité : Normale | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Développer liste missions en cours**
  - Description : Créer la vue active des missions
  - Priorité : Normale | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Développer vue facturation**
  - Description : Créer l'écran de facturation
  - Priorité : Haute | Labels : frontend | Rôle : Développeur Full-Stack

- [ ] **Afficher factures hebdomadaires**
  - Description : Lister les factures disponibles
  - Priorité : Haute | Labels : frontend,backend,billing | Rôle : Développeur Full-Stack

- [ ] **Ajouter téléchargement PDF**
  - Description : Permettre l'export de facture
  - Priorité : Haute | Labels : frontend,backend,billing | Rôle : Développeur Full-Stack

---

## 📦 ÉTAPE 5 : EPIC 5 — Matching et discipline
**Objectif :** Gérer automatiquement la compatibilité missions chauffeurs et les règles de sanction
**Priorité :** Critique

### 📖 5.1 — STORY 5.1 — Modèle de qualification chauffeur
> *En tant que plateforme je connais les qualifications valides du chauffeur* | Priorité: Critique

### 📖 5.2 — STORY 5.2 — Calcul de distance
> *En tant que plateforme je calcule la distance entre le chauffeur et la mission* | Priorité: Critique

### 📖 5.3 — STORY 5.3 — Algorithme de matching
> *En tant que chauffeur je ne vois que les missions compatibles* | Priorité: Critique

### 📖 5.4 — STORY 5.4 — Cycle mission
> *En tant que plateforme je trace les changements d'état d'une mission* | Priorité: Critique

### 📖 5.5 — STORY 5.5 — Rappels mission
> *En tant que plateforme j'envoie les relances nécessaires avant mission* | Priorité: Haute

#### 🔧 Tasks à implémenter :

- [ ] **Créer champs permis**
  - Description : Ajouter les champs C CE et autres si nécessaire
  - Priorité : Critique | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Créer champs options ADR et Frigo**
  - Description : Ajouter les qualifications complémentaires
  - Priorité : Haute | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Créer logique qualification validée**
  - Description : Déduire l'état exploitable des documents
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Bloquer qualification si document invalide**
  - Description : Empêcher l'usage d'un document expiré ou rejeté
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Prévoir extensibilité future**
  - Description : Concevoir des règles ajoutables
  - Priorité : Normale | Labels : backend,architecture | Rôle : Développeur Full-Stack

- [ ] **Géocoder ville chauffeur**
  - Description : Obtenir des coordonnées pour la localisation chauffeur
  - Priorité : Haute | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Géocoder lieu mission**
  - Description : Obtenir des coordonnées pour le lieu de mission
  - Priorité : Haute | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Calculer distance km**
  - Description : Mesurer la distance entre les deux points
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Définir rayon max configurable**
  - Description : Permettre l'ajustement métier de la distance acceptable
  - Priorité : Haute | Labels : backend,config | Rôle : Développeur Full-Stack

- [ ] **Stocker distance calculée si nécessaire**
  - Description : Optimiser l'affichage ou la recherche
  - Priorité : Normale | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Tester cas hors zone**
  - Description : Vérifier le rejet des missions trop éloignées
  - Priorité : Haute | Labels : backend,quality | Rôle : Développeur Full-Stack

- [ ] **Exclure profils EN_ATTENTE**
  - Description : Ne pas afficher les missions aux profils non validés
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Exclure profils SUSPENDU**
  - Description : Bloquer temporairement l'accès aux missions
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Exclure profils RADIE**
  - Description : Bloquer définitivement l'accès aux missions
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Vérifier permis compatibles**
  - Description : Comparer permis chauffeur et exigences mission
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Vérifier documents valides**
  - Description : Contrôler la conformité des pièces
  - Priorité : Critique | Labels : backend,compliance | Rôle : Développeur Full-Stack

- [ ] **Vérifier distance compatible**
  - Description : Appliquer le filtre géographique
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Vérifier fenêtre priorité favoris**
  - Description : Filtrer selon la priorité de diffusion
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Retourner liste missions filtrées**
  - Description : Servir les résultats compatibles au front
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Écrire tests unitaires matching**
  - Description : Sécuriser le comportement métier
  - Priorité : Haute | Labels : backend,quality | Rôle : Développeur Full-Stack

- [ ] **Passer mission de OUVERTE à POURVUE**
  - Description : Changer l'état après acceptation
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Associer chauffeur à mission**
  - Description : Enregistrer l'affectation
  - Priorité : Critique | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Gérer annulation entreprise**
  - Description : Prévoir le changement d'état côté société
  - Priorité : Haute | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Gérer annulation chauffeur**
  - Description : Prévoir le changement d'état côté chauffeur
  - Priorité : Haute | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Gérer mission terminée**
  - Description : Clôturer la mission après exécution
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Gérer historique des statuts**
  - Description : Journaliser les transitions
  - Priorité : Haute | Labels : backend,database | Rôle : Développeur Full-Stack

- [ ] **Planifier notification J-1**
  - Description : Créer la logique de rappel veille
  - Priorité : Haute | Labels : backend,notifications | Rôle : Développeur Full-Stack

- [ ] **Planifier notification matin J**
  - Description : Créer la logique de rappel jour J
  - Priorité : Haute | Labels : backend,notifications | Rôle : Développeur Full-Stack

- [ ] **Déclencher envoi automatique**
  - Description : Connecter les jobs au service mail
  - Priorité : Haute | Labels : backend,notifications | Rôle : Développeur Full-Stack

- [ ] **Journaliser les envois**
  - Description : Tracer succès et erreurs
  - Priorité : Normale | Labels : backend,notifications | Rôle : Développeur Full-Stack

- [ ] **Gérer échec d'envoi**
  - Description : Prévoir reprises ou alertes
  - Priorité : Normale | Labels : backend,notifications | Rôle : Développeur Full-Stack

---

## 📦 ÉTAPE 6 : EPIC 6 — Back-office administrateur
**Objectif :** Créer l'interface de pilotage exploitation conformité et contrôle
**Priorité :** Critique

### 📖 6.1 — STORY 6.1 — Dashboard administrateur
> *En tant qu'administrateur je vois les indicateurs clés de Vectura* | Priorité: Critique

### 📖 6.2 — STORY 6.2 — Gestion des chauffeurs
> *En tant qu'administrateur je peux filtrer et piloter les profils chauffeurs* | Priorité: Critique

### 📖 6.3 — STORY 6.3 — Validation documents
> *En tant qu'administrateur je peux contrôler les documents chauffeurs* | Priorité: Critique

### 📖 6.4 — STORY 6.4 — Suivi des missions
> *En tant qu'administrateur je peux surveiller l'exploitation des missions* | Priorité: Haute

### 📖 6.5 — STORY 6.5 — Conformité vigilance
> *En tant qu'administrateur je peux suivre la conformité URSSAF* | Priorité: Critique

#### 🔧 Tasks à implémenter :

- [ ] **Concevoir wireframe dashboard admin**
  - Description : Définir la structure du centre de contrôle
  - Priorité : Normale | Labels : ux | Rôle : UI/UX Designer

- [ ] **Concevoir maquette dashboard admin**
  - Description : Créer la maquette visuelle du tableau de bord
  - Priorité : Normale | Labels : ux,ui | Rôle : UI/UX Designer

- [ ] **Développer KPI missions en cours**
  - Description : Afficher le nombre de chauffeurs en mission
  - Priorité : Critique | Labels : admin,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Développer KPI alertes documents**
  - Description : Afficher les alertes d'expiration proches
  - Priorité : Critique | Labels : admin,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Développer KPI nouveaux inscrits**
  - Description : Afficher les profils en attente d'entretien
  - Priorité : Critique | Labels : admin,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Développer KPI CA semaine**
  - Description : Afficher le chiffre d'affaires hebdomadaire
  - Priorité : Haute | Labels : admin,frontend,backend,billing | Rôle : Développeur Full-Stack

- [ ] **Ajouter états de chargement**
  - Description : Prévoir loading et fallback sur les KPI
  - Priorité : Normale | Labels : frontend,ux | Rôle : Développeur Full-Stack

- [ ] **Développer tableau chauffeurs**
  - Description : Créer la liste principale admin
  - Priorité : Critique | Labels : admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter colonnes nom prénom téléphone**
  - Description : Afficher les infos principales
  - Priorité : Critique | Labels : admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter colonne statut**
  - Description : Afficher validé en attente suspendu radié
  - Priorité : Critique | Labels : admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter colonne qualifications**
  - Description : Afficher C CE ADR Frigo
  - Priorité : Haute | Labels : admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter colonne note moyenne**
  - Description : Afficher la moyenne des évaluations
  - Priorité : Normale | Labels : admin,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter filtres par statut**
  - Description : Faciliter le tri opérationnel
  - Priorité : Haute | Labels : admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter recherche par nom téléphone**
  - Description : Faciliter l'accès rapide à un profil
  - Priorité : Haute | Labels : admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Développer vue détail chauffeur**
  - Description : Afficher les détails d'un dossier
  - Priorité : Critique | Labels : admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Afficher documents uploadés**
  - Description : Présenter les pièces envoyées
  - Priorité : Critique | Labels : admin,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Afficher dates d'expiration**
  - Description : Montrer les échéances documentaires
  - Priorité : Critique | Labels : admin,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter bouton valider document**
  - Description : Permettre la validation individuelle
  - Priorité : Critique | Labels : admin,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter bouton rejeter document**
  - Description : Permettre le rejet motivé
  - Priorité : Critique | Labels : admin,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Journaliser validation rejet**
  - Description : Tracer l'action et son auteur
  - Priorité : Haute | Labels : admin,backend,security | Rôle : Développeur Full-Stack

- [ ] **Notifier chauffeur après action**
  - Description : Informer le chauffeur du résultat
  - Priorité : Haute | Labels : notifications,backend | Rôle : Développeur Full-Stack

- [ ] **Développer liste missions non pourvues**
  - Description : Afficher les missions urgentes à couvrir
  - Priorité : Critique | Labels : admin,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Développer liste missions à venir**
  - Description : Afficher les missions planifiées
  - Priorité : Haute | Labels : admin,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Développer historique missions**
  - Description : Afficher les missions passées et leurs statuts
  - Priorité : Normale | Labels : admin,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Ajouter filtres date et statut**
  - Description : Faciliter le pilotage quotidien
  - Priorité : Normale | Labels : admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter accès détail mission**
  - Description : Permettre la consultation détaillée
  - Priorité : Normale | Labels : admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Identifier attestations URSSAF de plus de 6 mois**
  - Description : Détecter automatiquement les dossiers non conformes
  - Priorité : Critique | Labels : backend,compliance | Rôle : Développeur Full-Stack

- [ ] **Développer vue conformité**
  - Description : Créer l'écran de suivi vigilance
  - Priorité : Haute | Labels : admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter bouton relance mail type**
  - Description : Permettre l'envoi rapide d'une relance
  - Priorité : Haute | Labels : admin,notifications | Rôle : Développeur Full-Stack

- [ ] **Journaliser relances conformité**
  - Description : Tracer les envois et leurs dates
  - Priorité : Normale | Labels : backend,compliance | Rôle : Développeur Full-Stack

- [ ] **Bloquer visibilité missions si non conforme**
  - Description : Appliquer la règle métier décidée
  - Priorité : Critique | Labels : backend,compliance | Rôle : Développeur Full-Stack

---

## 📦 ÉTAPE 7 : EPIC 7 — Notifications et automatisation
**Objectif :** Automatiser les alertes documents missions et sanctions
**Priorité :** Haute

### 📖 7.1 — STORY 7.1 — Service e-mail
> *En tant que plateforme je peux envoyer des messages transactionnels* | Priorité: Haute

### 📖 7.2 — STORY 7.2 — Alertes documents
> *En tant que plateforme je relance avant expiration des documents* | Priorité: Critique

### 📖 7.3 — STORY 7.3 — Relances mission
> *En tant que plateforme je rappelle les missions avant leur démarrage* | Priorité: Haute

### 📖 7.4 — STORY 7.4 — Sanctions automatiques
> *En tant que plateforme j'applique automatiquement les sanctions liées aux annulations* | Priorité: Critique

#### 🔧 Tasks à implémenter :

- [ ] **Choisir fournisseur SMTP API**
  - Description : Sélectionner le service d'envoi
  - Priorité : Haute | Labels : notifications,infra | Rôle : Admin Système

- [ ] **Configurer service mail**
  - Description : Brancher l'application au fournisseur retenu
  - Priorité : Critique | Labels : notifications,infra | Rôle : Admin Système

- [ ] **Créer template expiration document**
  - Description : Préparer le modèle de mail dédié
  - Priorité : Haute | Labels : notifications,backend | Rôle : Développeur Full-Stack

- [ ] **Créer template rappel mission**
  - Description : Préparer le modèle de rappel
  - Priorité : Haute | Labels : notifications,backend | Rôle : Développeur Full-Stack

- [ ] **Créer template relance conformité**
  - Description : Préparer le modèle de conformité
  - Priorité : Haute | Labels : notifications,backend,compliance | Rôle : Développeur Full-Stack

- [ ] **Créer template validation rejet document**
  - Description : Préparer le modèle de retour admin
  - Priorité : Haute | Labels : notifications,backend | Rôle : Développeur Full-Stack

- [ ] **Créer job quotidien documents**
  - Description : Planifier l'analyse quotidienne des échéances
  - Priorité : Critique | Labels : backend,notifications | Rôle : Développeur Full-Stack

- [ ] **Détecter expirations à J-30**
  - Description : Identifier les documents proches d'expiration
  - Priorité : Critique | Labels : backend,compliance | Rôle : Développeur Full-Stack

- [ ] **Détecter expirations à J-7**
  - Description : Identifier les urgences proches
  - Priorité : Haute | Labels : backend,compliance | Rôle : Développeur Full-Stack

- [ ] **Envoyer notifications documents**
  - Description : Envoyer les relances au chauffeur
  - Priorité : Critique | Labels : notifications,backend | Rôle : Développeur Full-Stack

- [ ] **Journaliser résultats alertes**
  - Description : Tracer les envois et retours
  - Priorité : Normale | Labels : backend,notifications | Rôle : Développeur Full-Stack

- [ ] **Empêcher doublons excessifs**
  - Description : Éviter les relances répétées non contrôlées
  - Priorité : Normale | Labels : backend,notifications | Rôle : Développeur Full-Stack

- [ ] **Créer job J-1**
  - Description : Planifier la relance la veille
  - Priorité : Haute | Labels : backend,notifications | Rôle : Développeur Full-Stack

- [ ] **Créer job matin J**
  - Description : Planifier la relance du jour même
  - Priorité : Haute | Labels : backend,notifications | Rôle : Développeur Full-Stack

- [ ] **Filtrer missions concernées**
  - Description : Sélectionner les bonnes missions
  - Priorité : Haute | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Envoyer mail chauffeur**
  - Description : Notifier le chauffeur
  - Priorité : Haute | Labels : notifications,backend | Rôle : Développeur Full-Stack

- [ ] **Envoyer mail entreprise si besoin**
  - Description : Notifier la société selon le scénario
  - Priorité : Normale | Labels : notifications,backend | Rôle : Développeur Full-Stack

- [ ] **Journaliser succès et échecs**
  - Description : Conserver l'historique des envois
  - Priorité : Normale | Labels : backend,notifications | Rôle : Développeur Full-Stack

- [ ] **Créer job contrôle annulations tardives**
  - Description : Détecter les annulations hors délai
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Appliquer suspension 7 jours**
  - Description : Mettre à jour le compte du chauffeur
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Appliquer radiation au troisième cas**
  - Description : Déclencher la radiation automatique
  - Priorité : Critique | Labels : backend | Rôle : Développeur Full-Stack

- [ ] **Notifier chauffeur sanctionné**
  - Description : Envoyer un mail explicatif
  - Priorité : Haute | Labels : notifications,backend | Rôle : Développeur Full-Stack

- [ ] **Afficher sanction dans back office**
  - Description : Rendre visible la mesure côté admin
  - Priorité : Haute | Labels : admin,backend,frontend | Rôle : Développeur Full-Stack

---

## 📦 ÉTAPE 8 : EPIC 8 — Facturation et export comptable
**Objectif :** Automatiser la génération de factures et les exports de suivi financier
**Priorité :** Haute

### 📖 8.1 — STORY 8.1 — Données financières mission
> *En tant que plateforme je calcule les montants liés à chaque mission* | Priorité: Critique

### 📖 8.2 — STORY 8.2 — Facture hebdomadaire
> *En tant qu'entreprise je reçois une facture hebdomadaire récapitulative* | Priorité: Critique

### 📖 8.3 — STORY 8.3 — Export comptable
> *En tant qu'administrateur je peux exporter les données de facturation* | Priorité: Haute

### 📖 8.4 — STORY 8.4 — Marge admin
> *En tant qu'administrateur je peux visualiser la marge générée* | Priorité: Normale

#### 🔧 Tasks à implémenter :

- [ ] **Définir modèle montant facturé entreprise**
  - Description : Spécifier la donnée facturable côté société
  - Priorité : Critique | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Définir modèle montant reversé chauffeur**
  - Description : Spécifier la donnée de reversement
  - Priorité : Haute | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Définir calcul marge**
  - Description : Calculer l'écart entre facture et reversement
  - Priorité : Critique | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Gérer cas mission annulée**
  - Description : Définir le comportement financier des annulations
  - Priorité : Haute | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Gérer cas mission validée**
  - Description : Définir le comportement financier des missions exécutées
  - Priorité : Critique | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Créer job hebdomadaire facturation**
  - Description : Planifier la génération des factures
  - Priorité : Critique | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Regrouper missions validées par entreprise**
  - Description : Consolider les missions facturables
  - Priorité : Critique | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Générer numéro de facture**
  - Description : Créer un identifiant unique de facture
  - Priorité : Haute | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Générer PDF facture**
  - Description : Produire le document final
  - Priorité : Critique | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Stocker facture**
  - Description : Sauvegarder le PDF généré
  - Priorité : Haute | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Rendre facture téléchargeable**
  - Description : Exposer le document à l'utilisateur concerné
  - Priorité : Haute | Labels : billing,frontend,backend | Rôle : Développeur Full-Stack

- [ ] **Générer export CSV**
  - Description : Créer le fichier comptable CSV
  - Priorité : Haute | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Générer export Excel**
  - Description : Créer le fichier comptable Excel
  - Priorité : Normale | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Inclure facture mission dates montants**
  - Description : Définir les colonnes utiles à la comptabilité
  - Priorité : Haute | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Tester format comptable**
  - Description : Vérifier l'exploitabilité par le comptable
  - Priorité : Normale | Labels : billing,quality | Rôle : Développeur Full-Stack

- [ ] **Ajouter téléchargement admin**
  - Description : Permettre l'export côté back office
  - Priorité : Haute | Labels : billing,admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Ajouter téléchargement entreprise si besoin**
  - Description : Prévoir l'accès société selon périmètre retenu
  - Priorité : Normale | Labels : billing,frontend | Rôle : Développeur Full-Stack

- [ ] **Calculer marge par mission**
  - Description : Produire la marge unitaire
  - Priorité : Normale | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Calculer marge hebdomadaire**
  - Description : Produire l'agrégat sur la semaine
  - Priorité : Normale | Labels : billing,backend | Rôle : Développeur Full-Stack

- [ ] **Afficher marge dans dashboard admin**
  - Description : Exposer l'indicateur dans le back office
  - Priorité : Normale | Labels : billing,admin,frontend | Rôle : Développeur Full-Stack

- [ ] **Prévoir filtre par période**
  - Description : Permettre l'analyse temporelle
  - Priorité : Normale | Labels : billing,frontend,backend | Rôle : Développeur Full-Stack

---

## 📦 ÉTAPE 9 : EPIC 9 — QA recette et lancement
**Objectif :** Tester stabiliser et déployer le MVP Vectura
**Priorité :** Critique

### 📖 9.1 — STORY 9.1 — QA fonctionnelle
> *En tant qu'équipe projet nous validons les parcours métier clés* | Priorité: Critique

### 📖 9.2 — STORY 9.2 — QA sécurité
> *En tant qu'équipe projet nous validons les protections minimales du produit* | Priorité: Critique

### 📖 9.3 — STORY 9.3 — Préproduction
> *En tant qu'équipe projet nous validons l'environnement de staging avant production* | Priorité: Critique

### 📖 9.4 — STORY 9.4 — Production
> *En tant qu'équipe projet nous mettons en ligne le MVP* | Priorité: Critique

### 📖 9.5 — STORY 9.5 — Stabilisation
> *En tant qu'équipe projet nous corrigeons et priorisons l'après lancement* | Priorité: Haute

#### 🔧 Tasks à implémenter :

- [ ] **Tester inscription chauffeur**
  - Description : Vérifier le parcours complet d'inscription
  - Priorité : Critique | Labels : qa,frontend,backend | Rôle : Toi / PO

- [ ] **Tester inscription entreprise**
  - Description : Vérifier le parcours société
  - Priorité : Critique | Labels : qa,frontend,backend | Rôle : Toi / PO

- [ ] **Tester login logout**
  - Description : Vérifier les accès et déconnexions
  - Priorité : Critique | Labels : qa,security | Rôle : Toi / PO

- [ ] **Tester upload documents**
  - Description : Vérifier le dépôt et la validation de fichiers
  - Priorité : Critique | Labels : qa,compliance | Rôle : Toi / PO

- [ ] **Tester validation admin**
  - Description : Vérifier les actions du back office
  - Priorité : Critique | Labels : qa,admin | Rôle : Toi / PO

- [ ] **Tester création mission**
  - Description : Vérifier la publication côté entreprise
  - Priorité : Critique | Labels : qa | Rôle : Toi / PO

- [ ] **Tester matching**
  - Description : Vérifier la cohérence des missions visibles
  - Priorité : Critique | Labels : qa | Rôle : Toi / PO

- [ ] **Tester annulation tardive**
  - Description : Vérifier suspension et compteur
  - Priorité : Critique | Labels : qa,compliance | Rôle : Toi / PO

- [ ] **Tester facturation**
  - Description : Vérifier calculs et génération
  - Priorité : Haute | Labels : qa,billing | Rôle : Toi / PO

- [ ] **Tester exports**
  - Description : Vérifier téléchargement et format
  - Priorité : Normale | Labels : qa,billing | Rôle : Toi / PO

- [ ] **Tester accès non autorisés**
  - Description : Vérifier que chaque rôle reste à sa place
  - Priorité : Critique | Labels : qa,security | Rôle : Admin Système

- [ ] **Tester rôles et permissions**
  - Description : Vérifier les habilitations fonctionnelles
  - Priorité : Critique | Labels : qa,security | Rôle : Admin Système

- [ ] **Tester upload malveillant**
  - Description : Vérifier les contrôles de sécurité
  - Priorité : Critique | Labels : qa,security | Rôle : Admin Système

- [ ] **Tester erreurs API**
  - Description : Vérifier les retours et logs
  - Priorité : Haute | Labels : qa,backend | Rôle : Admin Système

- [ ] **Tester limites taille fichier**
  - Description : Vérifier le contrôle anti abus
  - Priorité : Haute | Labels : qa,security | Rôle : Admin Système

- [ ] **Tester journalisation incidents**
  - Description : Vérifier la traçabilité sécurité
  - Priorité : Normale | Labels : qa,security,infra | Rôle : Admin Système

- [ ] **Déployer staging**
  - Description : Créer la préproduction complète
  - Priorité : Critique | Labels : infra,deploy | Rôle : Admin Système

- [ ] **Injecter données de test**
  - Description : Préparer un jeu de test réaliste
  - Priorité : Haute | Labels : infra,qa | Rôle : Admin Système

- [ ] **Vérifier mails automatiques**
  - Description : Contrôler les notifications avant production
  - Priorité : Haute | Labels : notifications,qa | Rôle : Admin Système

- [ ] **Vérifier cron jobs**
  - Description : Contrôler les tâches planifiées
  - Priorité : Critique | Labels : infra,qa | Rôle : Admin Système

- [ ] **Vérifier sauvegardes**
  - Description : Contrôler la stratégie de backup
  - Priorité : Critique | Labels : infra,security | Rôle : Admin Système

- [ ] **Vérifier performance minimale**
  - Description : Contrôler la tenue de la plateforme
  - Priorité : Normale | Labels : infra,performance | Rôle : Admin Système

- [ ] **Déployer production**
  - Description : Mettre en ligne la plateforme
  - Priorité : Critique | Labels : infra,deploy | Rôle : Admin Système

- [ ] **Configurer domaine final**
  - Description : Brancher le nom de domaine officiel
  - Priorité : Critique | Labels : infra | Rôle : Admin Système

- [ ] **Activer SSL final**
  - Description : Sécuriser l'accès HTTPS
  - Priorité : Critique | Labels : infra,security | Rôle : Admin Système

- [ ] **Exécuter migrations production**
  - Description : Mettre à jour la base de prod
  - Priorité : Critique | Labels : infra,database | Rôle : Admin Système

- [ ] **Vérifier monitoring**
  - Description : Confirmer la supervision après mise en ligne
  - Priorité : Haute | Labels : infra,monitoring | Rôle : Admin Système

- [ ] **Vérifier disponibilité publique**
  - Description : Tester le service côté utilisateur réel
  - Priorité : Critique | Labels : infra,qa | Rôle : Toi / PO

- [ ] **Corriger bugs post lancement**
  - Description : Traiter les incidents des premiers jours
  - Priorité : Critique | Labels : qa,bugfix | Rôle : Développeur Full-Stack

- [ ] **Suivre erreurs critiques**
  - Description : Analyser les erreurs prioritaires
  - Priorité : Critique | Labels : monitoring,qa | Rôle : Admin Système

- [ ] **Ajuster UX selon retours terrain**
  - Description : Améliorer les écrans selon usage réel
  - Priorité : Normale | Labels : ux,product | Rôle : UI/UX Designer

- [ ] **Ajuster règles métier si besoin**
  - Description : Faire évoluer les règles opérationnelles
  - Priorité : Normale | Labels : product,backend | Rôle : Toi / PO

- [ ] **Prioriser V1 après MVP**
  - Description : Préparer la roadmap après lancement
  - Priorité : Normale | Labels : product | Rôle : Toi / PO

---


## 🎯 MODE D'EMPLOI

Pour utiliser ce prompt avec Blackbox sur VS Code :

1. **Copie** la section de l'étape en cours (un Epic complet)
2. **Ouvre** le chat Blackbox dans VS Code (`Ctrl+Shift+P` → "Blackbox: Chat")
3. **Colle** le prompt et ajoute : 
   ```
   "Implémente cette étape complète avec le code source. 
   Fournis les fichiers un par un, prêts à être copiés-collés."
   ```
4. **Valide** chaque fichier généré avant de demander le suivant
5. **Une fois l'étape terminée**, passe à l'étape suivante

---

## 📋 CHECKLIST GLOBALE


- [ ] **Étape 1** — EPIC 1 — Socle technique
- [ ] **Étape 2** — EPIC 2 — Landing page publique
- [ ] **Étape 3** — EPIC 3 — Espace Chauffeur
- [ ] **Étape 4** — EPIC 4 — Espace Entreprise
- [ ] **Étape 5** — EPIC 5 — Matching et discipline
- [ ] **Étape 6** — EPIC 6 — Back-office administrateur
- [ ] **Étape 7** — EPIC 7 — Notifications et automatisation
- [ ] **Étape 8** — EPIC 8 — Facturation et export comptable
- [ ] **Étape 9** — EPIC 9 — QA recette et lancement

---

*Généré automatiquement depuis le backlog Vectura*