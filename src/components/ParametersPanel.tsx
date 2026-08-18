import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SizingParams, InstallationType, BatteryType } from "@/lib/sizing";
import { BATTERY_LABELS } from "@/lib/sizing";
import { Home, Building2, Sun, Battery, BatteryCharging, Percent } from "lucide-react";

interface Props {
  params: SizingParams;
  onChange: (p: SizingParams) => void;
}

export function ParametersPanel({ params, onChange }: Props) {
  const set = <K extends keyof SizingParams>(key: K, value: SizingParams[K]) =>
    onChange({ ...params, [key]: value });

  return (
    <div className="space-y-6">
      {/* Type d'installation */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Type d'installation</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => set("installationType", "offgrid" as InstallationType)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-medium transition ${
              params.installationType === "offgrid"
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            <Home className="h-5 w-5" />
            Site isolé
            <span className="text-[11px] font-normal opacity-70">100 % autonome</span>
          </button>
          <button
            onClick={() => set("installationType", "hybride" as InstallationType)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-medium transition ${
              params.installationType === "hybride"
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            <Building2 className="h-5 w-5" />
            Hybride
            <span className="text-[11px] font-normal opacity-70">Réseau + secours</span>
          </button>
        </div>
      </div>

      {/* Tension du parc batteries */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Battery className="h-4 w-4 text-amber-600" /> Tension du parc batteries
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {([12, 24, 48] as const).map((v) => (
            <button
              key={v}
              onClick={() => set("batteryVoltage", v)}
              className={`rounded-lg border-2 py-2 text-sm font-semibold transition ${
                params.batteryVoltage === v
                  ? "border-amber-500 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              {v} V
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400">12 V : petites installations · 24 V : moyennes · 48 V : &gt; 2 kW</p>
      </div>

      {/* Technologie de batterie */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <BatteryCharging className="h-4 w-4 text-amber-600" /> Technologie de batterie
        </Label>
        <Select value={params.batteryType} onValueChange={(v) => set("batteryType", v as BatteryType)}>
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(BATTERY_LABELS) as BatteryType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {BATTERY_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Autonomie */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-slate-700">
            Autonomie {params.installationType === "hybride" ? "en cas de coupure" : "sans soleil"}
          </Label>
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-sm font-bold text-amber-800">
            {params.autonomyDays} j
          </span>
        </div>
        <Slider
          value={[params.autonomyDays]}
          onValueChange={([v]) => set("autonomyDays", v)}
          min={0.5}
          max={5}
          step={0.5}
        />
      </div>

      {/* Ensoleillement */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Sun className="h-4 w-4 text-amber-600" /> Ensoleillement quotidien
          </Label>
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-sm font-bold text-amber-800">
            {params.sunHoursPerDay} h
          </span>
        </div>
        <Slider
          value={[params.sunHoursPerDay]}
          onValueChange={([v]) => set("sunHoursPerDay", v)}
          min={3}
          max={8}
          step={0.5}
        />
        <p className="text-xs text-slate-400">Afrique de l'Ouest / centrale : 4,5 à 6 h en moyenne</p>
      </div>

      {/* Puissance panneau */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Sun className="h-4 w-4 text-amber-600" /> Puissance unitaire des panneaux vendus
        </Label>
        <Select
          value={String(params.panelPowerW)}
          onValueChange={(v) => set("panelPowerW", Number(v))}
        >
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[300, 400, 450, 500, 550, 600, 650, 700].map((w) => (
              <SelectItem key={w} value={String(w)}>
                {w} Wc
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Facteur de simultanéité */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Percent className="h-4 w-4 text-amber-600" /> Facteur de simultanéité
          </Label>
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-sm font-bold text-amber-800">
            {Math.round(params.simultaneityFactor * 100)} %
          </span>
        </div>
        <Slider
          value={[params.simultaneityFactor * 100]}
          onValueChange={([v]) => set("simultaneityFactor", v / 100)}
          min={30}
          max={100}
          step={5}
        />
        <p className="text-xs text-slate-400">Part des appareils pouvant fonctionner en même temps</p>
      </div>
    </div>
  );
}
