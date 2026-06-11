# Architecture - Vectura

## Vue d'ensemble

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend      │────▶│    PostgreSQL   │
│   (React/Vite)  │     │ (Express/Node)  │     │   (Données)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │     Redis       │
                        │ (Cache/Jobs)    │
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │     SMTP        │
                        │ (Notifications) │
                        └─────────────────┘
```

## Models Prisma

### User (Utilisateur)
- `id` : UUID unique
- `email`, `password` : Authentification
- `role` : CHAUFFEUR | ENTREPRISE | ADMIN
- `status` : EN_ATTENTE | VALIDE | SUSPENDU | RADIE

### DriverProfile (Profil chauffeur)
- `hasPermisC`, `hasPermisCE` : Permis C/CE
- `hasADR`, `hasFrigo` : Qualifications complémentaires
- `lateCancellationCount` : Compteur d'annulations tardives

### CompanyProfile (Profil entreprise)
- `companyName`, `siret`, `address`

### Document (Pièce justificative)
- `type` : PERMIS_C | PERMIS_CE | FIMO | FCO | CARTE_CHRONO | KBIS | URSSAF | RC_PRO
- `status` : EN_ATTENTE | VALIDE | REJETE | EXPIRE
- `expiryDate` : Date d'expiration

### Mission
- `truckType` : PL | SPL | ADR | FRIGO
- `status` : OUVERTE | POURVUE | ANNULEE | TERMINEE
- `favoritePriorityHours` : Fenêtre priorité favoris (en heures)

### Favorite
- Relation entreprise ↔ chauffeur
- `priorityHours` : Durée de priorité

### Billing / Invoice
- Facturation hebdo pour entreprises
- Marge plateforme configurable

## Flows métiers

### Inscription chauffeur
1. Formulaire inscription (email, nom, prénom, téléphone, ville)
2. Compte créé avec statut `EN_ATTENTE`
3. Upload documents (permis, FIMO/FCO, carte chrono, Kbis, URSSAF, RC Pro)
4. Admin valide les documents
5. Statut passe à `VALIDE`

### Création mission
1. Entreprise crée mission (type, date, horaires, lieu, tarif)
2. Validation prix minimum (PL: 25€/h, SPL: 30€/h)
3. Si priorité favoris activée (2h), diffusion réservée aux favoris
4. Après 2h, mission visible par tous les chauffeurs qualifiés

### Discipline chauffeur
- Annulation avant H-24 : autorisée
- Annulation après H-24 : `SUSPENSION` 7 jours + incrément compteur
- 3 annulations tardives : `RADIATION` définitive