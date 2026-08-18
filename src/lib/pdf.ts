// ============================================================
// Génération du devis PDF — SMARTSOLAR
// ============================================================

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanyInfo, ClientInfo, Pricing, Quote } from "./quote";
import { formatMoney } from "./quote";
import type { SizingResult, SizingParams } from "./sizing";
import { formatW, formatWh } from "./sizing";

const AMBER: [number, number, number] = [217, 119, 6];
const DARK: [number, number, number] = [30, 41, 59];
const GREY: [number, number, number] = [100, 116, 139];

function money(n: number, p: Pricing): string {
  return formatMoney(n, p.currency);
}

export function generateQuotePdf(
  company: CompanyInfo,
  client: ClientInfo,
  pricing: Pricing,
  result: SizingResult,
  params: SizingParams,
  quote: Quote,
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // ---------- Bandeau supérieur ----------
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, 4, "F");

  // Logo (si fourni)
  let textX = margin;
  if (company.logoDataUrl) {
    try {
      const format = company.logoDataUrl.includes("image/png") ? "PNG" : "JPEG";
      doc.addImage(company.logoDataUrl, format, margin, y, 22, 22);
      textX = margin + 26;
    } catch {
      // logo illisible : on continue sans
    }
  }

  // Société
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text(company.name || "SMARTSOLAR", textX, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  const companyLines = [company.address, company.phone, company.email].filter(Boolean);
  companyLines.forEach((line, i) => doc.text(line, textX, y + 13 + i * 4.5));

  // Bloc DEVIS (droite)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...AMBER);
  doc.text("DEVIS", pageW - margin, y + 8, { align: "right" });
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.setFont("helvetica", "normal");
  doc.text(`N° ${quote.number}`, pageW - margin, y + 14, { align: "right" });
  doc.text(`Date : ${quote.date}`, pageW - margin, y + 18.5, { align: "right" });
  doc.text("Validité : 30 jours", pageW - margin, y + 23, { align: "right" });

  y = margin + 28;

  // ---------- Client ----------
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageW - margin * 2, client.phone || client.location ? 20 : 14, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(`Client : ${client.name || "____________________"}`, margin + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  if (client.phone) doc.text(`Tél : ${client.phone}`, margin + 4, y + 13);
  if (client.location) doc.text(`Lieu : ${client.location}`, margin + 80, y + 13);
  if (client.phone || client.location) {
    doc.text(
      `Installation : ${params.installationType === "offgrid" ? "Site isolé (autonome)" : "Hybride (réseau + secours)"}`,
      margin + 4,
      y + 17.5,
    );
  }

  y += client.phone || client.location ? 26 : 20;

  // ---------- Récapitulatif des besoins ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text("Récapitulatif de vos besoins", margin, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Puissance totale", "Puissance de pointe", "Énergie journalière", "Autonomie", "Ensoleillement"]],
    body: [
      [
        formatW(result.totalPowerW),
        formatW(result.peakPowerW),
        `${formatWh(result.dailyEnergyWh)} / jour`,
        `${params.autonomyDays} jour(s)`,
        `${params.sunHoursPerDay} h / jour`,
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: AMBER, fontSize: 8, halign: "center" },
    bodyStyles: { fontSize: 9, halign: "center", textColor: DARK },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ---------- Tableau du matériel ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Matériel proposé", margin, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Désignation", "Qté", "Prix unitaire", "Total"]],
    body: [
      ...quote.lines.map((l) => [
        l.designation,
        String(l.qty),
        money(l.unitPrice, pricing),
        money(l.total, pricing),
      ]),
      [
        `Câbles, protections, structure & accessoires (${pricing.accessoriesPct} %)`,
        "1",
        money(quote.accessoires, pricing),
        money(quote.accessoires, pricing),
      ],
      [
        "Installation & mise en service",
        "1",
        money(quote.installation, pricing),
        money(quote.installation, pricing),
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: DARK, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 15, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right" },
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  // ---------- Totaux ----------
  const boxW = 90;
  const boxX = pageW - margin - boxW;
  const rows: [string, string, boolean][] = [
    ["Total HT", money(quote.totalHT, pricing), false],
    [`TVA (${pricing.tvaPct} %)`, money(quote.tva, pricing), false],
    ["TOTAL TTC", money(quote.totalTTC, pricing), true],
  ];

  rows.forEach(([label, value, highlight], i) => {
    const rowY = y + i * 8;
    if (highlight) {
      doc.setFillColor(...AMBER);
      doc.roundedRect(boxX, rowY, boxW, 8, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
    } else {
      doc.setFillColor(248, 250, 252);
      doc.rect(boxX, rowY, boxW, 8, "F");
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
    }
    doc.text(label, boxX + 3, rowY + 5.5);
    doc.text(value, boxX + boxW - 3, rowY + 5.5, { align: "right" });
  });

  // ---------- Caractéristiques techniques ----------
  y += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Caractéristiques techniques de l'installation", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  const tech = [
    `Champ photovoltaïque : ${result.panelCount} panneaux de ${params.panelPowerW} Wc — puissance totale ${formatW(result.pvPowerInstalledWc)}c`,
    `Parc batteries : ${formatWh(result.batteryCapacityWh)} utiles sous ${params.batteryVoltage} V (${Math.ceil(result.batteryCapacityAh)} Ah)`,
    `Onduleur ${result.inverterSuggestedKva} kVA — régulateur MPPT ${result.controllerCurrentA} A`,
    "Hypothèses : rendement système 75 %, rendement batterie 90 %, profondeur de décharge selon technologie.",
  ];
  tech.forEach((t, i) => doc.text(t, margin, y + 5 + i * 4.5));

  // ---------- Pied de page ----------
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageH - 28, pageW - margin, pageH - 28);
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text("Signature du client (précédée de « Bon pour accord »)", margin, pageH - 20);
  doc.text("Signature de la société", pageW - margin, pageH - 20, { align: "right" });
  doc.setFontSize(7.5);
  doc.text(
    `${company.name} — ${company.phone} — ${company.email}`,
    pageW / 2,
    pageH - 8,
    { align: "center" },
  );

  // ---------- Enregistrement ----------
  const safeName = (client.name || "client").replace(/[^a-zA-Z0-9àâäéèêëîïôöùûüç -]/g, "").trim().replace(/\s+/g, "-");
  doc.save(`devis-${safeName || "client"}-${quote.number}.pdf`);
}
