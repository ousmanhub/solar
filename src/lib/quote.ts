// ============================================================
// Module commercial SMARTSOLAR — société, client, tarifs, offre
// ============================================================

import type { SizingResult, SizingParams } from "./sizing";

export interface CompanyInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  logoDataUrl: string; // image encodée en base64 (vide si aucun logo)
}

export interface ClientInfo {
  name: string;
  phone: string;
  location: string;
}

export interface Pricing {
  currency: string;            // ex. FCFA, €, $, MAD
  // Panneaux
  panelModel: string;          // ex. "Jinko Tiger Neo"
  panelUnitPrice: number;      // prix par panneau
  // Batteries
  batteryModel: string;        // ex. "Lithium LiFePO4"
  batteryAhChoice: 100 | 200;  // capacité unitaire commercialisée
  batteryUnitPrice: number;    // prix par batterie
  // Onduleur
  inverterModel: string;       // ex. "Growatt SPF"
  inverterPricePerKva: number; // prix par kVA
  // Régulateur
  controllerModel: string;     // ex. "MPPT 60A"
  controllerUnitPrice: number; // prix unitaire
  // Divers
  accessoriesPct: number;      // câbles, protections, structure (% du matériel)
  installationFee: number;     // main d'œuvre / pose (montant fixe)
  tvaPct: number;              // TVA (%)
}

export interface QuoteLine {
  designation: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  number: string;
  date: string;
  lines: QuoteLine[];
  materielHT: number;
  accessoires: number;
  installation: number;
  totalHT: number;
  tva: number;
  totalTTC: number;
  batteryQty: number;
}

export const DEFAULT_COMPANY: CompanyInfo = {
  name: "Ma Société Solaire",
  phone: "+00 0 00 00 00 00",
  email: "contact@masociete.com",
  address: "Adresse de la société",
  logoDataUrl: "",
};

export const DEFAULT_CLIENT: ClientInfo = {
  name: "",
  phone: "",
  location: "",
};

export const DEFAULT_PRICING: Pricing = {
  currency: "FCFA",
  panelModel: "Panneau monocristallin",
  panelUnitPrice: 85000,
  batteryModel: "Batterie Gel",
  batteryAhChoice: 200,
  batteryUnitPrice: 180000,
  inverterModel: "Onduleur hybride",
  inverterPricePerKva: 60000,
  controllerModel: "Régulateur MPPT",
  controllerUnitPrice: 45000,
  accessoriesPct: 15,
  installationFee: 100000,
  tvaPct: 18,
};

export function formatMoney(amount: number, currency: string): string {
  // Espace classique (compatible PDF) plutôt que l'espace fine insécable
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} ${currency}`;
}

export function buildQuote(
  result: SizingResult,
  params: SizingParams,
  pricing: Pricing,
): Quote {
  const batteryQty =
    pricing.batteryAhChoice === 200 ? result.batteryCount200Ah : result.batteryCount100Ah;

  const lines: QuoteLine[] = [
    {
      designation: `${pricing.panelModel} ${params.panelPowerW} Wc`,
      qty: result.panelCount,
      unitPrice: pricing.panelUnitPrice,
      total: result.panelCount * pricing.panelUnitPrice,
    },
    {
      designation: `${pricing.batteryModel} ${params.batteryVoltage} V ${pricing.batteryAhChoice} Ah`,
      qty: batteryQty,
      unitPrice: pricing.batteryUnitPrice,
      total: batteryQty * pricing.batteryUnitPrice,
    },
    {
      designation: `${pricing.inverterModel} ${result.inverterSuggestedKva} kVA`,
      qty: 1,
      unitPrice: result.inverterSuggestedKva * pricing.inverterPricePerKva,
      total: result.inverterSuggestedKva * pricing.inverterPricePerKva,
    },
    {
      designation: `${pricing.controllerModel} ${result.controllerCurrentA} A`,
      qty: 1,
      unitPrice: pricing.controllerUnitPrice,
      total: pricing.controllerUnitPrice,
    },
  ];

  const materielHT = lines.reduce((s, l) => s + l.total, 0);
  const accessoires = (materielHT * pricing.accessoriesPct) / 100;
  const installation = pricing.installationFee;
  const totalHT = materielHT + accessoires + installation;
  const tva = (totalHT * pricing.tvaPct) / 100;
  const totalTTC = totalHT + tva;

  const now = new Date();
  const number = `DEV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  const date = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  return {
    number,
    date,
    lines,
    materielHT,
    accessoires,
    installation,
    totalHT,
    tva,
    totalTTC,
    batteryQty,
  };
}

// Persistance locale (logo, tarifs, coordonnées conservés entre les sessions)
const STORAGE_KEY = "smartsolar-settings-v1";

export interface SavedSettings {
  company: CompanyInfo;
  pricing: Pricing;
}

export function loadSettings(): SavedSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSettings;
  } catch {
    return null;
  }
}

export function saveSettings(s: SavedSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // stockage plein ou indisponible : on ignore silencieusement
  }
}
