import { useMemo, useState } from "react";
import { Plus, Trash2, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Appliance } from "@/lib/sizing";
import { APPLIANCE_PRESETS } from "@/lib/sizing";

interface Props {
  appliances: Appliance[];
  onChange: (list: Appliance[]) => void;
}

let uid = 0;
const nextId = () => `app-${++uid}-${Date.now()}`;

export function ApplianceTable({ appliances, onChange }: Props) {
  const [presetKey, setPresetKey] = useState<string>("");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const map = new Map<string, typeof APPLIANCE_PRESETS>();
    const q = search.trim().toLowerCase();
    for (const p of APPLIANCE_PRESETS) {
      if (q && !p.name.toLowerCase().includes(q)) continue;
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return [...map.entries()];
  }, [search]);

  const addPreset = (key: string) => {
    const preset = APPLIANCE_PRESETS.find((p) => p.name === key);
    if (!preset) return;
    onChange([
      ...appliances,
      { id: nextId(), name: preset.name, powerW: preset.powerW, quantity: 1, hoursPerDay: preset.hoursPerDay },
    ]);
    setPresetKey("");
  };

  const addCustom = () => {
    onChange([
      ...appliances,
      { id: nextId(), name: "Nouvel appareil", powerW: 100, quantity: 1, hoursPerDay: 4 },
    ]);
  };

  const update = (id: string, patch: Partial<Appliance>) => {
    onChange(appliances.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const remove = (id: string) => {
    onChange(appliances.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Ajout d'appareils */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={presetKey} onValueChange={addPreset}>
          <SelectTrigger className="flex-1 bg-white">
            <SelectValue placeholder="⚡ Ajouter un appareil du catalogue..." />
          </SelectTrigger>
          <SelectContent>
            <div className="flex items-center gap-2 px-2 pb-2 pt-1 sticky top-0 bg-white">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="w-full text-sm outline-none placeholder:text-slate-400"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            {categories.map(([cat, presets]) => (
              <SelectGroup key={cat}>
                <SelectLabel>{cat}</SelectLabel>
                {presets.map((p) => (
                  <SelectItem key={p.name} value={p.name}>
                    {p.name} — {p.powerW} W
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={addCustom} className="gap-2">
          <Plus className="h-4 w-4" /> Appareil personnalisé
        </Button>
      </div>

      {/* Tableau */}
      {appliances.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 text-center text-slate-400">
          <Zap className="mx-auto mb-2 h-8 w-8 opacity-40" />
          <p className="text-sm">Aucun appareil. Ajoutez des équipements depuis le catalogue ci-dessus.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-slate-800 text-left text-white">
                <th className="px-3 py-2.5 font-medium min-w-[150px]">Appareil</th>
                <th className="px-3 py-2.5 font-medium w-24">Puiss. (W)</th>
                <th className="px-3 py-2.5 font-medium w-20">Qté</th>
                <th className="px-3 py-2.5 font-medium w-24">Heures/j</th>
                <th className="px-3 py-2.5 font-medium w-28 text-right">Énergie/j</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {appliances.map((a, i) => (
                <tr key={a.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-3 py-1.5">
                    <Input
                      value={a.name}
                      onChange={(e) => update(a.id, { name: e.target.value })}
                      className="h-8 border-transparent bg-transparent hover:border-slate-200 focus:bg-white"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      type="number"
                      min={0}
                      value={a.powerW}
                      onChange={(e) => update(a.id, { powerW: Math.max(0, Number(e.target.value)) })}
                      className="h-8 border-transparent bg-transparent hover:border-slate-200 focus:bg-white"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      type="number"
                      min={1}
                      value={a.quantity}
                      onChange={(e) => update(a.id, { quantity: Math.max(1, Number(e.target.value)) })}
                      className="h-8 border-transparent bg-transparent hover:border-slate-200 focus:bg-white"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={a.hoursPerDay}
                      onChange={(e) =>
                        update(a.id, { hoursPerDay: Math.min(24, Math.max(0, Number(e.target.value))) })
                      }
                      className="h-8 border-transparent bg-transparent hover:border-slate-200 focus:bg-white"
                    />
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-700">
                    {(a.powerW * a.quantity * a.hoursPerDay).toLocaleString("fr-FR")} Wh
                  </td>
                  <td className="pr-2 text-right">
                    <button
                      onClick={() => remove(a.id)}
                      className="rounded p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
