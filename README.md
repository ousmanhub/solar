# SMARTSOLAR — Calculateur de Dimensionnement Solaire

Application web professionnelle de **dimensionnement photovoltaïque** et de **génération de devis commerciaux**, conçue pour les sociétés de vente de batteries, panneaux solaires et équipements dérivés.

## Fonctionnalités

### Dimensionnement technique
- **Bilan énergétique** : catalogue de 35+ appareils prédéfinis (éclairage, froid, climatisation, pompage, bureautique, commerce, atelier) + appareils personnalisés
- **Installations site isolé (off-grid) et hybride** (réseau + secours)
- Calculs automatiques :
  - Puissance totale, puissance de pointe (facteur de simultanéité), énergie journalière
  - **Parc batteries** : capacité en Ah selon tension (12/24/48 V), technologie (plomb, gel/AGM, lithium) et autonomie souhaitée
  - **Champ photovoltaïque** : nombre de panneaux selon l'ensoleillement local
  - **Onduleur** : calibre en kVA avec marge de sécurité
  - **Régulateur MPPT** : courant adapté
- Graphique de répartition de la consommation par appareil

### Outil commercial
- **Devis PDF professionnel** : logo et coordonnées de la société, informations client, tableau du matériel, Total HT / TVA / Total TTC, zones de signature
- **Tarifs personnalisables** : modèles et prix du matériel (panneaux, batteries, onduleur, régulateur), accessoires en %, pose forfaitaire, TVA, multi-devises (FCFA, EUR, USD, MAD, GNF, CDF)
- **Historique des devis sur 3 mois** : sauvegarde automatique, re-téléchargement, rechargement dans le formulaire, purge automatique
- Persistance locale (logo, tarifs, historique) via localStorage

## Stack technique

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **Recharts** (graphiques), **jsPDF** + **jspdf-autotable** (devis PDF), **date-fns**

## Installation et lancement

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Compiler pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## Méthodologie de calcul

| Étape | Formule |
|---|---|
| Énergie journalière | Σ (puissance × quantité × heures d'utilisation) |
| Capacité batteries | (énergie × autonomie) ÷ (DoD × rendement batterie 90 %) |
| Champ PV | énergie ÷ (heures de soleil équivalent × rendement système 75 %) |
| Onduleur | puissance de pointe × (1 + marge 25 %) |
| Régulateur MPPT | (puissance PV ÷ tension parc) × 1,25 |

Profondeurs de décharge : plomb ouvert 50 %, gel/AGM 60 %, lithium LiFePO4 90 %.

## Structure du code

```
src/
├── lib/
│   ├── sizing.ts      # Moteur de calcul de dimensionnement
│   ├── quote.ts       # Logique commerciale (prix, totaux, devis)
│   ├── history.ts     # Historique des devis (3 mois, localStorage)
│   └── pdf.ts         # Génération du devis PDF
├── components/
│   ├── ApplianceTable.tsx     # Tableau des équipements du client
│   ├── ParametersPanel.tsx    # Paramètres de l'installation
│   ├── ResultsPanel.tsx       # Résultats du dimensionnement
│   ├── CompanyClientPanel.tsx # Société & client (logo, coordonnées)
│   ├── PricingPanel.tsx       # Tarifs et modèles de matériel
│   ├── QuotePanel.tsx         # Offre commerciale
│   └── HistoryPanel.tsx       # Historique des devis
└── App.tsx
```

---

Développé avec SMARTSOLAR — Outil d'aide à la vente de solutions solaires · Maisons, commerces & entreprises
