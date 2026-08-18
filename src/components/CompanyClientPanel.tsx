import { useRef } from "react";
import { Building2, User, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompanyInfo, ClientInfo } from "@/lib/quote";

interface Props {
  company: CompanyInfo;
  client: ClientInfo;
  onCompanyChange: (c: CompanyInfo) => void;
  onClientChange: (c: ClientInfo) => void;
}

export function CompanyClientPanel({ company, client, onCompanyChange, onClientChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogo = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Le logo est trop lourd (max 2 Mo). Choisissez une image plus petite.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onCompanyChange({ ...company, logoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      {/* Société */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Building2 className="h-4 w-4 text-amber-600" /> Votre société (affichée sur le devis)
        </Label>

        <div className="flex items-center gap-3">
          {company.logoDataUrl ? (
            <div className="relative">
              <img
                src={company.logoDataUrl}
                alt="Logo"
                className="h-16 w-16 rounded-xl border border-slate-200 object-contain bg-white p-1"
              />
              <button
                onClick={() => onCompanyChange({ ...company, logoDataUrl: "" })}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600"
                title="Supprimer le logo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-amber-400 hover:text-amber-500"
            >
              <Upload className="h-5 w-5" />
              <span className="text-[9px] font-medium">Logo</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleLogo(e.target.files?.[0])}
          />
          <div className="flex-1">
            <Input
              value={company.name}
              onChange={(e) => onCompanyChange({ ...company, name: e.target.value })}
              placeholder="Nom de votre société"
              className="bg-white font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input
            value={company.phone}
            onChange={(e) => onCompanyChange({ ...company, phone: e.target.value })}
            placeholder="Téléphone"
            className="bg-white"
          />
          <Input
            value={company.email}
            onChange={(e) => onCompanyChange({ ...company, email: e.target.value })}
            placeholder="Email"
            className="bg-white"
          />
        </div>
        <Input
          value={company.address}
          onChange={(e) => onCompanyChange({ ...company, address: e.target.value })}
          placeholder="Adresse complète"
          className="bg-white"
        />
      </div>

      {/* Client */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <User className="h-4 w-4 text-amber-600" /> Informations du client
        </Label>
        <Input
          value={client.name}
          onChange={(e) => onClientChange({ ...client, name: e.target.value })}
          placeholder="Nom du client ou de l'entreprise"
          className="bg-white"
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input
            value={client.phone}
            onChange={(e) => onClientChange({ ...client, phone: e.target.value })}
            placeholder="Téléphone du client"
            className="bg-white"
          />
          <Input
            value={client.location}
            onChange={(e) => onClientChange({ ...client, location: e.target.value })}
            placeholder="Ville / quartier"
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
}
