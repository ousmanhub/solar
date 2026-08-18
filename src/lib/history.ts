// ============================================================
// Historique des devis — conservation 3 mois (localStorage)
// ============================================================

import { subMonths } from "date-fns";
import type { Appliance, SizingParams, SizingResult } from "./sizing";
import type { CompanyInfo, ClientInfo, Pricing, Quote } from "./quote";

export interface SavedQuote {
  id: string;
  savedAt: number; // timestamp de sauvegarde
  // Instantané complet pour re-télécharger ou recharger le devis
  quote: Quote;
  result: SizingResult;
  params: SizingParams;
  appliances: Appliance[];
  pricing: Pricing;
  company: CompanyInfo;
  client: ClientInfo;
}

const HISTORY_KEY = "smartsolar-history-v1";

/** Supprime les devis de plus de 3 mois */
function purgeOld(entries: SavedQuote[]): SavedQuote[] {
  const limit = subMonths(new Date(), 3).getTime();
  return entries.filter((e) => e.savedAt >= limit);
}

export function loadHistory(): SavedQuote[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw) as SavedQuote[];
    const fresh = purgeOld(entries);
    // Si la purge a retiré des éléments, on réécrit le stockage
    if (fresh.length !== entries.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(fresh));
    }
    return fresh.sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

export function saveHistory(entries: SavedQuote[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(purgeOld(entries)));
  } catch {
    // stockage plein ou indisponible : on ignore silencieusement
  }
}

export function makeHistoryEntry(
  quote: Quote,
  result: SizingResult,
  params: SizingParams,
  appliances: Appliance[],
  pricing: Pricing,
  company: CompanyInfo,
  client: ClientInfo,
): SavedQuote {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: Date.now(),
    quote,
    result,
    params,
    appliances,
    pricing,
    company,
    client,
  };
}

export function formatSavedDate(ts: number): string {
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
