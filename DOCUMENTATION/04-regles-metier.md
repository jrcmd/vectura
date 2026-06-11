# Règles métier - Vectura

## Tarification plancher

| Type de mission | Tarif minimum horaire |
|-----------------|----------------------|
| PL | 25€/h (MIN_RATE_PL) |
| SPL | 30€/h (MIN_RATE_SPL) |

> La validation backend empêche toute mission sous le seuil. Message d'erreur explicite retourné au client.

## Statuts chauffeur

| Statut | Couleur/UI | Accès missions |
|--------|-----------|----------------|
| `EN_ATTENTE` | Gris | Bloqué (documents à valider) |
| `VALIDE` | Vert | Accès complet |
| `SUSPENDU` | Orange | Accès bloqué temporairement |
| `RADIE` | Rouge | Accès bloqué définitivement |

## Statuts mission

| Statut | Description | Transition |
|--------|-------------|----------|
| `OUVERTE` | Mission disponible | → `POURVUE` ou `ANNULEE` |
| `POURVUE` | Chauffeur assigné | → `TERMINEE` ou `ANNULEE` |
| `ANNULEE` | Annulée (tardive ou non) | Finale |
| `TERMINEE` | Mission exécutée | Finale |

## Discipline annulation chauffeur

| Scénario | Action automatique |
|----------|------------------|
| Annulation > H-24 | Autorisée, pas de sanction |
| Annulation ≤ H-24 | +1 suspension 7j + incrément compteur |
| 3 annulations tardives | Radiation définitive (RADIATION) |

> Le compteur `lateCancellationCount` est incrémenté à chaque annulation tardive.

## Qualifications chauffeur

### Documents obligatoires (chauffeur indépendant)
- Permis C
- Permis CE
- FIMO ou FCO
- Carte chrono
- Kbis (si entreprise)
- Attestation URSSAF (< 6 mois)
- RC Pro

### Qualifications complémentaires
- ADR (Transport de marchandises dangereuses)
- Frigo (Étiquetage réfrigéré)

> Une qualification n'est valide que si le document correspondant est `VALIDE` et non expiré.

## Priorité favoris

1. Entreprise crée une mission avec option "priorité favoris" (2h)
2. Pendant 2h, la mission n'est visible que par les chauffeurs favoris de l'entreprise
3. Après 2h, la mission devient visible par tous les chauffeurs qualifiés géographiquement

## Matching géographique

1. Mission géocodée (latitude/longitude du lieu)
2. Chauffeur géocodé (latitude/longitude de sa ville)
3. Distance calculée entre les deux points
4. Si distance > `MATCHING_MAX_RADIUS_KM` (50 km), le chauffeur ne voit pas la mission

## Facturation

- Facturation hebdomadaire par entreprise
- Marge plateforme : 15% du montant total
- Export PDF disponible dans l'espace entreprise
- Statuts : `PENDING` → `INVOICED` → `PAID`