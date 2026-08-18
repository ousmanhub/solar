import { useEffect, useMemo, useState } from "react";
import { Sun, Zap, ClipboardList, Settings2, Calculator, Building2, Tag, History, LogOut } from "lucide-react";
import { ApplianceTable } from "@/components/ApplianceTable";
import { ParametersPanel } from "@/components/ParametersPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { CompanyClientPanel } from "@/components/CompanyClientPanel";
import { PricingPanel } from "@/components/PricingPanel";
import { QuotePanel } from "@/components/QuotePanel";
import { HistoryPanel } from "@/components/HistoryPanel";
import LoginPage from "@/pages/Login";
import { useAuth } from "@/lib/auth";
import type { Appliance, SizingParams } from "@/lib/sizing";
import { computeSizing } from "@/lib/sizing";
import type { CompanyInfo, ClientInfo, Pricing } from "@/lib/quote";
import {
  DEFAULT_COMPANY,
  DEFAULT_CLIENT,
  DEFAULT_PRICING,
  buildQuote,
  loadSettings,
  saveSettings,
} from "@/lib/quote";
import type { SavedQuote } from "@/lib/history";
import { loadHistory, saveHistory, makeHistoryEntry } from "@/lib/history";
import { generateQuotePdf } from "@/lib/pdf";

// Exemple pré-rempli : petite maison type
const DEFAULT_APPLIANCES: Appliance[] = [
  { id: "d1", name: "Ampoule LED", powerW: 10, quantity: 6, hoursPerDay: 6 },
  { id: "d2", name: "Télévision LED 32\"", powerW: 60, quantity: 1, hoursPerDay: 5 },
  { id: "d3", name: "Réfrigérateur 150 L", powerW: 100, quantity: 1, hoursPerDay: 8 },
  { id: "d4", name: "Ventilateur sur pied", powerW: 60, quantity: 2, hoursPerDay: 8 },
  { id: "d5", name: "Chargeur téléphone", powerW: 10, quantity: 3, hoursPerDay: 3 },
  { id: "d6", name: "Routeur Wi-Fi", powerW: 10, quantity: 1, hoursPerDay: 24 },
];

const DEFAULT_PARAMS: SizingParams = {
  installationType: "offgrid",
  batteryVoltage: 24,
  autonomyDays: 1,
  batteryType: "gel",
  sunHoursPerDay: 5,
  panelPowerW: 550,
  simultaneityFactor: 0.7,
  inverterMarginPct: 25,
};

export default function App() {
  const { user, loading, logout } = useAuth();
  const [appliances, setAppliances] = useState<Appliance[]>(DEFAULT_APPLIANCES);
  const [params, setParams] = useState<SizingParams>(DEFAULT_PARAMS);

  // Paramètres commerciaux persistés localement (logo, tarifs, coordonnées)
  const saved = useMemo(() => loadSettings(), []);
  const [company, setCompany] = useState<CompanyInfo>(saved?.company ?? DEFAULT_COMPANY);
  const [pricing, setPricing] = useState<Pricing>(saved?.pricing ?? DEFAULT_PRICING);
  const [client, setClient] = useState<ClientInfo>(DEFAULT_CLIENT);

  useEffect(() => {
    saveSettings({ company, pricing });
  }, [company, pricing]);

  if (loading) return null;
  if (!user) return <LoginPage />;

  const result = useMemo(() => computeSizing(appliances, params), [appliances, params]);
  const quote = useMemo(() => buildQuote(result, params, pricing), [result, params, pricing]);
  const hasNeeds = result.dailyEnergyWh > 0;

  // ---------- Historique des devis (3 mois) ----------
  const [history, setHistory] = useState<SavedQuote[]>(() => loadHistory());

  const persistHistory = (entries: SavedQuote[]) => {
    setHistory(entries);
    saveHistory(entries);
  };

  const handleSaveQuote = () => {
    if (!hasNeeds) return;
    const entry = makeHistoryEntry(quote, result, params, appliances, pricing, company, client);
    persistHistory([entry, ...history]);
  };

  const handleDownloadQuote = () => {
    if (!hasNeeds) return;
    handleSaveQuote();
    generateQuotePdf(company, client, pricing, result, params, quote);
  };

  const handleRedownload = (entry: SavedQuote) => {
    generateQuotePdf(entry.company, entry.client, entry.pricing, entry.result, entry.params, entry.quote);
  };

  const handleRestore = (entry: SavedQuote) => {
    setAppliances(entry.appliances);
    setParams(entry.params);
    setPricing(entry.pricing);
    setCompany(entry.company);
    setClient(entry.client);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteQuote = (id: string) => {
    persistHistory(history.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* En-tête */}
      <header className="sticky top-0 z-20 border-b border-amber-200/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {company.logoDataUrl ? (
              <img
                src={company.logoDataUrl}
                alt="Logo"
                className="h-10 w-10 rounded-xl border border-slate-200 object-contain bg-white p-0.5"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                <Sun className="h-6 w-6" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                SMART<span className="text-amber-500">SOLAR</span>
              </h1>
              <p className="text-[11px] font-medium text-slate-400">
                Dimensionnement solaire · Devis commercial
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 sm:flex">
            <Zap className="h-3.5 w-3.5" />
            {result.dailyEnergyWh > 0
              ? `Besoin actuel : ${(result.dailyEnergyWh / 1000).toFixed(2).replace(".", ",")} kWh/jour`
              : "Outil commercial de pré-dimensionnement"}
          </div>
          <button
            onClick={() => logout?.()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Colonne gauche : saisie */}
          <div className="space-y-6 lg:col-span-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-amber-500" />
                <h2 className="font-bold text-slate-800">Équipements du client</h2>
              </div>
              <ApplianceTable appliances={appliances} onChange={setAppliances} />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-amber-500" />
                <h2 className="font-bold text-slate-800">Paramètres de l'installation</h2>
              </div>
              <ParametersPanel params={params} onChange={setParams} />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                <h2 className="font-bold text-slate-800">Société &amp; client</h2>
              </div>
              <CompanyClientPanel
                company={company}
                client={client}
                onCompanyChange={setCompany}
                onClientChange={setClient}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-500" />
                <h2 className="font-bold text-slate-800">Vos prix &amp; modèles de matériel</h2>
              </div>
              <PricingPanel pricing={pricing} onChange={setPricing} />
            </section>
          </div>

          {/* Colonne droite : résultats */}
          <div className="lg:col-span-7">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-amber-500" />
                <h2 className="font-bold text-slate-800">Résultats &amp; offre commerciale</h2>
              </div>
              <div className="space-y-6">
                <ResultsPanel result={result} params={params} />
                {hasNeeds && (
                  <QuotePanel
                    quote={quote}
                    pricing={pricing}
                    onDownload={handleDownloadQuote}
                    onSave={handleSaveQuote}
                  />
                )}
              </div>
            </section>

            {/* Historique des devis */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-amber-500" />
                <h2 className="font-bold text-slate-800">Historique des devis</h2>
                <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                  3 mois
                </span>
              </div>
              <HistoryPanel
                history={history}
                onRedownload={handleRedownload}
                onRestore={handleRestore}
                onDelete={handleDeleteQuote}
              />
            </section>
          </div>
        </div>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          SMARTSOLAR — Outil d'aide à la vente de solutions solaires · Maisons, commerces &amp; entreprises
        </footer>
      </main>
    </div>
  );
}
