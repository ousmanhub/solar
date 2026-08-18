import { History, FileDown, RotateCcw, Trash2, Inbox } from "lucide-react";
import type { SavedQuote } from "@/lib/history";
import { formatSavedDate } from "@/lib/history";
import { formatMoney } from "@/lib/quote";

interface Props {
  history: SavedQuote[];
  onRedownload: (entry: SavedQuote) => void;
  onRestore: (entry: SavedQuote) => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({ history, onRedownload, onRestore, onDelete }: Props) {
  return (
    <div>
      {history.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center text-slate-400">
          <Inbox className="mx-auto mb-2 h-8 w-8 opacity-40" />
          <p className="text-sm font-medium">Aucun devis enregistré</p>
          <p className="mt-1 text-xs">
            Les devis téléchargés ou enregistrés apparaîtront ici
            <br />
            et seront conservés pendant 3 mois.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <History className="h-3.5 w-3.5" />
            {history.length} devis conservé{history.length > 1 ? "s" : ""} — suppression automatique après 3 mois
          </p>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 transition hover:border-amber-300 hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-slate-800">
                      {entry.client.name || "Client sans nom"}
                    </span>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      {formatMoney(entry.quote.totalTTC, entry.pricing.currency)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    {entry.quote.number} · {formatSavedDate(entry.savedAt)}
                    {entry.client.location ? ` · ${entry.client.location}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => onRestore(entry)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                    title="Recharger ce devis dans le formulaire"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onRedownload(entry)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                    title="Re-télécharger le PDF"
                  >
                    <FileDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
