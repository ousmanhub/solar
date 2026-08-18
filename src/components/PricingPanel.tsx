import { Tag, Sun, Battery, ArrowRightLeft, Gauge, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Pricing } from "@/lib/quote";

interface Props {
  pricing: Pricing;
  onChange: (p: Pricing) => void;
}

function PriceRow({
  icon,
  label,
  model,
  onModelChange,
  price,
  onPriceChange,
  priceLabel,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  model: string;
  onModelChange: (v: string) => void;
  price: number;
  onPriceChange: (v: number) => void;
  priceLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {icon} {label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          placeholder="Modèle / marque"
          className="h-8 flex-1 bg-white text-sm"
        />
        <div className="relative w-32">
          <Input
            type="number"
            min={0}
            value={price}
            onChange={(e) => onPriceChange(Math.max(0, Number(e.target.value)))}
            className="h-8 bg-white pr-2 text-right text-sm"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{priceLabel}</span>
        {children}
      </div>
    </div>
  );
}

export function PricingPanel({ pricing, onChange }: Props) {
  const set = <K extends keyof Pricing>(key: K, value: Pricing[K]) =>
    onChange({ ...pricing, [key]: value });

  return (
    <div className="space-y-3">
      {/* Devise */}
      <div className="flex items-center gap-3">
        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Tag className="h-4 w-4 text-amber-600" /> Devise
        </Label>
        <Select value={pricing.currency} onValueChange={(v) => set("currency", v)}>
          <SelectTrigger className="h-8 w-32 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["FCFA", "EUR", "USD", "MAD", "GNF", "CDF"].map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PriceRow
        icon={<Sun className="h-3.5 w-3.5 text-blue-500" />}
        label="Panneau solaire"
        model={pricing.panelModel}
        onModelChange={(v) => set("panelModel", v)}
        price={pricing.panelUnitPrice}
        onPriceChange={(v) => set("panelUnitPrice", v)}
        priceLabel="Prix par panneau"
      />

      <PriceRow
        icon={<Battery className="h-3.5 w-3.5 text-emerald-500" />}
        label="Batterie"
        model={pricing.batteryModel}
        onModelChange={(v) => set("batteryModel", v)}
        price={pricing.batteryUnitPrice}
        onPriceChange={(v) => set("batteryUnitPrice", v)}
        priceLabel="Prix par batterie"
      >
        <div className="flex gap-1">
          {([100, 200] as const).map((ah) => (
            <button
              key={ah}
              onClick={() => set("batteryAhChoice", ah)}
              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold transition ${
                pricing.batteryAhChoice === ah
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
              }`}
            >
              {ah} Ah
            </button>
          ))}
        </div>
      </PriceRow>

      <PriceRow
        icon={<ArrowRightLeft className="h-3.5 w-3.5 text-amber-500" />}
        label="Onduleur"
        model={pricing.inverterModel}
        onModelChange={(v) => set("inverterModel", v)}
        price={pricing.inverterPricePerKva}
        onPriceChange={(v) => set("inverterPricePerKva", v)}
        priceLabel="Prix par kVA (multiplié par le calibre)"
      />

      <PriceRow
        icon={<Gauge className="h-3.5 w-3.5 text-violet-500" />}
        label="Régulateur MPPT"
        model={pricing.controllerModel}
        onModelChange={(v) => set("controllerModel", v)}
        price={pricing.controllerUnitPrice}
        onPriceChange={(v) => set("controllerUnitPrice", v)}
        priceLabel="Prix unitaire"
      />

      {/* Frais annexes */}
      <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <Wrench className="h-3.5 w-3.5 text-slate-400" /> Frais annexes
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-slate-400">Accessoires (%)</span>
            <Input
              type="number"
              min={0}
              value={pricing.accessoriesPct}
              onChange={(e) => set("accessoriesPct", Math.max(0, Number(e.target.value)))}
              className="h-8 bg-white text-right text-sm"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Pose / install.</span>
            <Input
              type="number"
              min={0}
              value={pricing.installationFee}
              onChange={(e) => set("installationFee", Math.max(0, Number(e.target.value)))}
              className="h-8 bg-white text-right text-sm"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">TVA (%)</span>
            <Input
              type="number"
              min={0}
              value={pricing.tvaPct}
              onChange={(e) => set("tvaPct", Math.max(0, Number(e.target.value)))}
              className="h-8 bg-white text-right text-sm"
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-400">
          Accessoires = câbles, protections, structure (% du matériel) · Pose = montant forfaitaire
        </p>
      </div>
    </div>
  );
}
