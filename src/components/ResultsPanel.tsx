import {
  Zap,
  Activity,
  Battery,
  Sun,
  ArrowRightLeft,
  Gauge,
  Package,
  Info,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { SizingResult, SizingParams } from "@/lib/sizing";
import { formatW, formatWh, BATTERY_LABELS } from "@/lib/sizing";

interface Props {
  result: SizingResult;
  params: SizingParams;
}

const COLORS = ["#f59e0b", "#0ea5e9", "#10b981", "#8b5cf6", "#ef4444", "#f97316", "#14b8a6", "#6366f1", "#eab308", "#ec4899", "#84cc16", "#64748b"];

function ResultCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${accent}`}>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-70">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs opacity-70">{sub}</div>
    </div>
  );
}

export function ResultsPanel({ result, params }: Props) {
  const chartData = result.appliances
    .filter((r) => r.dailyEnergyWh > 0)
    .sort((a, b) => b.dailyEnergyWh - a.dailyEnergyWh)
    .slice(0, 8)
    .map((r) => ({ name: r.appliance.name, value: Math.round(r.dailyEnergyWh) }));

  const isEmpty = result.dailyEnergyWh === 0 && result.totalPowerW === 0;

  if (isEmpty) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400">
        <Package className="mb-3 h-10 w-10 opacity-40" />
        <p className="font-medium">En attente d'équipements</p>
        <p className="text-sm">Ajoutez des appareils pour obtenir le dimensionnement complet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Besoins */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
          1 · Besoins du client
        </h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ResultCard
            icon={<Zap className="h-4 w-4" />}
            label="Puissance totale"
            value={formatW(result.totalPowerW)}
            sub="Somme de tous les appareils"
            accent="border-sky-200 bg-sky-50 text-sky-900"
          />
          <ResultCard
            icon={<Activity className="h-4 w-4" />}
            label="Puissance de pointe"
            value={formatW(result.peakPowerW)}
            sub={`Avec simultanéité de ${Math.round(params.simultaneityFactor * 100)} %`}
            accent="border-sky-200 bg-sky-50 text-sky-900"
          />
          <ResultCard
            icon={<Gauge className="h-4 w-4" />}
            label="Énergie journalière"
            value={formatWh(result.dailyEnergyWh)}
            sub="Consommation par jour"
            accent="border-sky-200 bg-sky-50 text-sky-900"
          />
          <ResultCard
            icon={<Sun className="h-4 w-4" />}
            label="Énergie mensuelle"
            value={formatWh(result.dailyEnergyWh * 30)}
            sub="Estimation sur 30 jours"
            accent="border-sky-200 bg-sky-50 text-sky-900"
          />
        </div>
      </div>

      {/* Équipements à vendre */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
          2 · Matériel à proposer au client
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 normal-case tracking-normal">
            {params.installationType === "offgrid" ? "Kit site isolé" : "Kit hybride"}
          </span>
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Onduleur */}
          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-amber-950">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-700">
              <ArrowRightLeft className="h-4 w-4" /> Onduleur {params.installationType === "hybride" ? "hybride" : ""}
            </div>
            <div className="text-3xl font-extrabold">{result.inverterSuggestedKva} kVA</div>
            <div className="mt-1 text-xs text-amber-700">
              Besoin calculé : {formatW(result.inverterPowerW)} (marge {params.inverterMarginPct} % incluse)
            </div>
          </div>

          {/* Batteries */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 text-emerald-950">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
              <Battery className="h-4 w-4" /> Parc batteries {params.batteryVoltage} V
            </div>
            <div className="text-3xl font-extrabold">
              {Math.ceil(result.batteryCapacityAh).toLocaleString("fr-FR")} Ah
            </div>
            <div className="mt-1 text-xs text-emerald-700">
              ≈ {result.batteryCount200Ah} × batteries 200 Ah / {params.batteryVoltage} V
              {" "}ou {result.batteryCount100Ah} × 100 Ah
            </div>
            <div className="mt-1 text-xs text-emerald-700">
              {BATTERY_LABELS[params.batteryType]} · {formatWh(result.batteryCapacityWh)} stockés
            </div>
          </div>

          {/* Panneaux */}
          <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 text-blue-950">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-700">
              <Sun className="h-4 w-4" /> Champ photovoltaïque
            </div>
            <div className="text-3xl font-extrabold">
              {result.panelCount} × {params.panelPowerW} Wc
            </div>
            <div className="mt-1 text-xs text-blue-700">
              Total installé : {formatW(result.pvPowerInstalledWc)}p (besoin : {formatW(result.pvPowerWc)}p)
            </div>
            <div className="mt-1 text-xs text-blue-700">
              Base : {params.sunHoursPerDay} h de soleil équivalent / jour
            </div>
          </div>

          {/* Régulateur */}
          <div className="rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-purple-50 p-5 text-violet-950">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-violet-700">
              <Gauge className="h-4 w-4" /> Régulateur de charge MPPT
            </div>
            <div className="text-3xl font-extrabold">{result.controllerCurrentA} A</div>
            <div className="mt-1 text-xs text-violet-700">
              Compatible {params.batteryVoltage} V · marge de sécurité 25 % incluse
            </div>
          </div>
        </div>
      </div>

      {/* Répartition de la consommation */}
      {chartData.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
            3 · Répartition de la consommation
          </h3>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString("fr-FR")} Wh/j`, "Consommation"]}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Note méthodologique */}
      <div className="flex gap-3 rounded-xl bg-slate-100 p-4 text-xs text-slate-500">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Hypothèses : rendement global du système 75 % (câbles, température, régulateur), rendement
          batterie 90 %, profondeur de décharge selon la technologie choisie. Ce dimensionnement est une
          base commerciale solide — ajustez selon les contraintes du site (orientation, ombrage, pic de
          démarrage des moteurs ×3 à ×7 pour pompes et climatiseurs).
        </p>
      </div>
    </div>
  );
}
