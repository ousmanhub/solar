import { FileDown, ReceiptText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Quote, Pricing } from "@/lib/quote";
import { formatMoney } from "@/lib/quote";

interface Props {
  quote: Quote;
  pricing: Pricing;
  onDownload: () => void;
  onSave: () => void;
}

export function QuotePanel({ quote, pricing, onDownload, onSave }: Props) {
  const fmt = (n: number) => formatMoney(n, pricing.currency);

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
        4 · Offre commerciale
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 normal-case tracking-normal">
          {quote.number}
        </span>
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        {/* Lignes du devis */}
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-left text-white">
              <th className="px-3 py-2 font-medium">Désignation</th>
              <th className="px-3 py-2 font-medium w-12 text-center">Qté</th>
              <th className="px-3 py-2 font-medium w-28 text-right">P.U.</th>
              <th className="px-3 py-2 font-medium w-28 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((l, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="px-3 py-2 text-slate-700">{l.designation}</td>
                <td className="px-3 py-2 text-center text-slate-500">{l.qty}</td>
                <td className="px-3 py-2 text-right text-slate-500">{fmt(l.unitPrice)}</td>
                <td className="px-3 py-2 text-right font-medium text-slate-800">{fmt(l.total)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 text-slate-500">
              <td className="px-3 py-2">Câbles, protections, structure &amp; accessoires ({pricing.accessoriesPct} %)</td>
              <td className="px-3 py-2 text-center">1</td>
              <td className="px-3 py-2 text-right">{fmt(quote.accessoires)}</td>
              <td className="px-3 py-2 text-right font-medium">{fmt(quote.accessoires)}</td>
            </tr>
            <tr className="bg-white text-slate-500">
              <td className="px-3 py-2">Installation &amp; mise en service</td>
              <td className="px-3 py-2 text-center">1</td>
              <td className="px-3 py-2 text-right">{fmt(quote.installation)}</td>
              <td className="px-3 py-2 text-right font-medium">{fmt(quote.installation)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totaux */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
          <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Total HT</span>
              <span className="font-medium">{fmt(quote.totalHT)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>TVA ({pricing.tvaPct} %)</span>
              <span className="font-medium">{fmt(quote.tva)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-amber-500 px-3 py-2 text-base font-extrabold text-white">
              <span>TOTAL TTC</span>
              <span>{fmt(quote.totalTTC)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="mt-4 flex gap-2">
        <Button
          onClick={onDownload}
          className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 py-6 text-base font-bold text-white shadow-md hover:from-amber-600 hover:to-orange-600"
        >
          <FileDown className="h-5 w-5" />
          Télécharger le devis PDF
        </Button>
        <Button
          onClick={onSave}
          variant="outline"
          className="gap-2 border-amber-300 py-6 font-bold text-amber-700 hover:bg-amber-50"
          title="Enregistrer dans l'historique (3 mois)"
        >
          <Save className="h-5 w-5" />
          Enregistrer
        </Button>
      </div>
      <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
        <ReceiptText className="h-3.5 w-3.5" />
        Le téléchargement enregistre aussi le devis dans l'historique (conservé 3 mois).
      </p>
    </div>
  );
}
