// ============================================================
// Moteur de calcul de dimensionnement solaire — SMARTSOLAR
// Méthodologie standard : bilan énergétique → batteries → PV → conversion
// ============================================================

export interface Appliance {
  id: string;
  name: string;
  powerW: number;      // puissance unitaire en watts
  quantity: number;    // quantité
  hoursPerDay: number; // heures d'utilisation par jour
}

export type InstallationType = "offgrid" | "hybride";
export type BatteryType = "plomb" | "gel" | "lithium";

export interface SizingParams {
  installationType: InstallationType;
  batteryVoltage: 12 | 24 | 48;
  autonomyDays: number;        // jours d'autonomie souhaités
  batteryType: BatteryType;
  sunHoursPerDay: number;      // heures d'ensoleillement équivalentes (PSH)
  panelPowerW: number;         // puissance unitaire des panneaux (Wc)
  simultaneityFactor: number;  // 0 à 1 — part des appareils fonctionnant en même temps
  inverterMarginPct: number;   // marge de sécurité onduleur (%)
}

export interface ApplianceResult {
  appliance: Appliance;
  totalPowerW: number;   // puissance × quantité
  dailyEnergyWh: number; // puissance × quantité × heures
}

export interface SizingResult {
  appliances: ApplianceResult[];
  totalPowerW: number;          // puissance totale installée
  peakPowerW: number;           // puissance de pointe (avec simultanéité)
  dailyEnergyWh: number;        // énergie journalière (kWh si > 1000 affiché ailleurs)

  inverterPowerW: number;       // puissance onduleur recommandée
  inverterSuggestedKva: number; // calibre standard supérieur

  batteryCapacityWh: number;    // capacité utile nécessaire
  batteryCapacityAh: number;    // capacité en Ah à la tension choisie
  batteryCount100Ah: number;    // nombre de batteries 100 Ah équivalentes
  batteryCount200Ah: number;    // nombre de batteries 200 Ah équivalentes
  dod: number;                  // profondeur de décharge utilisée

  pvPowerWc: number;            // puissance crête photovoltaïque nécessaire
  panelCount: number;           // nombre de panneaux
  pvPowerInstalledWc: number;   // puissance réellement installée (arrondie aux panneaux)

  controllerCurrentA: number;   // courant régulateur MPPT recommandé
}

export const BATTERY_DOD: Record<BatteryType, number> = {
  plomb: 0.5,   // plomb ouvert : 50 %
  gel: 0.6,     // plomb gel / AGM : 60 %
  lithium: 0.9, // LiFePO4 : 90 %
};

export const BATTERY_LABELS: Record<BatteryType, string> = {
  plomb: "Plomb ouvert (DoD 50 %)",
  gel: "Gel / AGM (DoD 60 %)",
  lithium: "Lithium LiFePO4 (DoD 90 %)",
};

// Rendement global de la chaîne (câbles, régulateur, batteries, température)
const SYSTEM_EFFICIENCY = 0.75;
const BATTERY_EFFICIENCY = 0.9;

// Calibres standards d'onduleurs (kVA)
const INVERTER_SIZES_KVA = [0.8, 1, 1.5, 2, 3, 3.5, 4, 5, 5.5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50];

// Calibres standards de régulateurs MPPT (A)
const CONTROLLER_SIZES_A = [20, 30, 40, 50, 60, 80, 100, 120, 150, 200];

function nextStandard(value: number, sizes: number[]): number {
  for (const s of sizes) if (s >= value) return s;
  return sizes[sizes.length - 1];
}

export function computeSizing(appliances: Appliance[], p: SizingParams): SizingResult {
  const results: ApplianceResult[] = appliances.map((a) => ({
    appliance: a,
    totalPowerW: a.powerW * a.quantity,
    dailyEnergyWh: a.powerW * a.quantity * a.hoursPerDay,
  }));

  const totalPowerW = results.reduce((s, r) => s + r.totalPowerW, 0);
  const peakPowerW = totalPowerW * p.simultaneityFactor;
  const dailyEnergyWh = results.reduce((s, r) => s + r.dailyEnergyWh, 0);

  // --- Onduleur : pointe × marge de sécurité ---
  const margin = 1 + p.inverterMarginPct / 100;
  const inverterPowerW = peakPowerW * margin;
  const inverterSuggestedKva = nextStandard(inverterPowerW / 1000, INVERTER_SIZES_KVA);

  // --- Batteries : énergie × autonomie / (DoD × rendement) ---
  const dod = BATTERY_DOD[p.batteryType];
  // En hybride, l'autonomie couvre les coupures (souvent < 1 jour)
  const effectiveAutonomy = p.installationType === "hybride" ? Math.min(p.autonomyDays, 2) : p.autonomyDays;
  const batteryCapacityWh = (dailyEnergyWh * effectiveAutonomy) / (dod * BATTERY_EFFICIENCY);
  const batteryCapacityAh = batteryCapacityWh / p.batteryVoltage;
  const batteryCount100Ah = Math.ceil(batteryCapacityAh / 100);
  const batteryCount200Ah = Math.ceil(batteryCapacityAh / 200);

  // --- Champ PV : énergie journalière / (PSH × rendement système) ---
  const pvPowerWc = dailyEnergyWh / (p.sunHoursPerDay * SYSTEM_EFFICIENCY);
  const panelCount = Math.max(1, Math.ceil(pvPowerWc / p.panelPowerW));
  const pvPowerInstalledWc = panelCount * p.panelPowerW;

  // --- Régulateur MPPT : courant max côté batterie × 1,25 ---
  const controllerNeeded = (pvPowerInstalledWc / p.batteryVoltage) * 1.25;
  const controllerCurrentA = nextStandard(controllerNeeded, CONTROLLER_SIZES_A);

  return {
    appliances: results,
    totalPowerW,
    peakPowerW,
    dailyEnergyWh,
    inverterPowerW,
    inverterSuggestedKva,
    batteryCapacityWh,
    batteryCapacityAh,
    batteryCount100Ah,
    batteryCount200Ah,
    dod,
    pvPowerWc,
    panelCount,
    pvPowerInstalledWc,
    controllerCurrentA,
  };
}

// Catalogue d'appareils prédéfinis (puissances typiques)
export interface Preset {
  name: string;
  powerW: number;
  hoursPerDay: number;
  category: string;
}

export const APPLIANCE_PRESETS: Preset[] = [
  { name: "Ampoule LED", powerW: 10, hoursPerDay: 6, category: "Éclairage" },
  { name: "Tube LED 120 cm", powerW: 18, hoursPerDay: 8, category: "Éclairage" },
  { name: "Projecteur LED extérieur", powerW: 50, hoursPerDay: 10, category: "Éclairage" },
  { name: "Télévision LED 32\"", powerW: 60, hoursPerDay: 5, category: "Multimédia" },
  { name: "Télévision LED 55\"", powerW: 120, hoursPerDay: 5, category: "Multimédia" },
  { name: "Décodeur / Box TV", powerW: 15, hoursPerDay: 6, category: "Multimédia" },
  { name: "Ordinateur portable", powerW: 65, hoursPerDay: 8, category: "Bureautique" },
  { name: "Ordinateur de bureau", powerW: 250, hoursPerDay: 8, category: "Bureautique" },
  { name: "Imprimante", powerW: 300, hoursPerDay: 1, category: "Bureautique" },
  { name: "Routeur Wi-Fi", powerW: 10, hoursPerDay: 24, category: "Bureautique" },
  { name: "Ventilateur sur pied", powerW: 60, hoursPerDay: 8, category: "Confort" },
  { name: "Ventilateur de plafond", powerW: 75, hoursPerDay: 10, category: "Confort" },
  { name: "Climatiseur 9000 BTU", powerW: 900, hoursPerDay: 6, category: "Confort" },
  { name: "Climatiseur 12000 BTU", powerW: 1200, hoursPerDay: 6, category: "Confort" },
  { name: "Climatiseur 18000 BTU", powerW: 1800, hoursPerDay: 6, category: "Confort" },
  { name: "Réfrigérateur 150 L", powerW: 100, hoursPerDay: 8, category: "Froid" },
  { name: "Réfrigérateur 300 L", powerW: 150, hoursPerDay: 8, category: "Froid" },
  { name: "Congélateur 200 L", powerW: 120, hoursPerDay: 8, category: "Froid" },
  { name: "Vitrine réfrigérée", powerW: 400, hoursPerDay: 12, category: "Froid" },
  { name: "Fer à repasser", powerW: 1200, hoursPerDay: 1, category: "Électroménager" },
  { name: "Machine à laver", powerW: 500, hoursPerDay: 1, category: "Électroménager" },
  { name: "Micro-ondes", powerW: 1000, hoursPerDay: 0.5, category: "Électroménager" },
  { name: "Bouilloire électrique", powerW: 1800, hoursPerDay: 0.3, category: "Électroménager" },
  { name: "Cuisinière électrique", powerW: 2000, hoursPerDay: 1, category: "Électroménager" },
  { name: "Chauffe-eau 50 L", powerW: 1500, hoursPerDay: 2, category: "Électroménager" },
  { name: "Pompe à eau 0,5 CV", powerW: 375, hoursPerDay: 2, category: "Pompage" },
  { name: "Pompe à eau 1 CV", powerW: 750, hoursPerDay: 2, category: "Pompage" },
  { name: "Pompe immergée 1,5 CV", powerW: 1100, hoursPerDay: 3, category: "Pompage" },
  { name: "Chargeur téléphone", powerW: 10, hoursPerDay: 3, category: "Divers" },
  { name: "Caméra de surveillance", powerW: 8, hoursPerDay: 24, category: "Divers" },
  { name: "Caisse enregistreuse", powerW: 80, hoursPerDay: 10, category: "Commerce" },
  { name: "Terminal de paiement (TPE)", powerW: 5, hoursPerDay: 10, category: "Commerce" },
  { name: "Enseigne lumineuse", powerW: 150, hoursPerDay: 6, category: "Commerce" },
  { name: "Perceuse / outillage", powerW: 800, hoursPerDay: 1, category: "Atelier" },
  { name: "Poste à souder (petit)", powerW: 3000, hoursPerDay: 1, category: "Atelier" },
];

function frDecimal(v: number): string {
  return v.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
}

export function formatW(w: number): string {
  if (w >= 1000) return `${frDecimal(w / 1000)} kW`;
  return `${Math.round(w)} W`;
}

export function formatWh(wh: number): string {
  if (wh >= 1000) return `${frDecimal(wh / 1000)} kWh`;
  return `${Math.round(wh)} Wh`;
}
