import { useState } from "react";
import { Plus, Trash2, Building2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { BUREAUX_DOUANIERS, TYPES_DOSSIERS } from "@/lib/mock";
import type { PartenaireBureau, PartenaireCommission, Partenaire } from "@/lib/mock";
import { toast } from "sonner";

interface Props {
  trigger: React.ReactNode;
  title: string;
  initial?: Partenaire;
}

export function PartnerFormDialog({ trigger, title, initial }: Props) {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [telephone, setTelephone] = useState(initial?.telephone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [bureaux, setBureaux] = useState<PartenaireBureau[]>(initial?.bureaux ?? []);
  const [expanded, setExpanded] = useState<string[]>([]);

  const selectedBureauIds = bureaux.map(b => b.bureauId);

  const toggleBureau = (bureauId: string) => {
    if (selectedBureauIds.includes(bureauId)) {
      setBureaux(prev => prev.filter(b => b.bureauId !== bureauId));
    } else {
      setBureaux(prev => [...prev, { bureauId, commissions: [] }]);
      setExpanded(prev => [...prev, bureauId]);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addCommission = (bureauId: string) => {
    setBureaux(prev => prev.map(b => {
      if (b.bureauId !== bureauId) return b;
      const used = b.commissions.map(c => c.typeDossierId);
      const available = TYPES_DOSSIERS.filter(t => t.actif && !used.includes(t.id));
      if (available.length === 0) { toast.info("Tous les types sont déjà ajoutés"); return b; }
      return { ...b, commissions: [...b.commissions, { typeDossierId: available[0].id, typeCommission: "pourcentage" as const, valeurCommission: 0 }] };
    }));
  };

  const updateCommission = (bureauId: string, idx: number, patch: Partial<PartenaireCommission>) => {
    setBureaux(prev => prev.map(b => {
      if (b.bureauId !== bureauId) return b;
      const comms = [...b.commissions];
      comms[idx] = { ...comms[idx], ...patch };
      return { ...b, commissions: comms };
    }));
  };

  const removeCommission = (bureauId: string, idx: number) => {
    setBureaux(prev => prev.map(b => {
      if (b.bureauId !== bureauId) return b;
      return { ...b, commissions: b.commissions.filter((_, i) => i !== idx) };
    }));
  };

  const handleSubmit = () => {
    if (!nom.trim()) { toast.error("Le nom est requis"); return; }
    toast.success(initial ? "Partenaire modifié" : "Partenaire créé");
    setOpen(false);
  };

  const getBureauName = (id: string) => BUREAUX_DOUANIERS.find(b => b.id === id)?.denomination ?? id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>

        {/* Basic info */}
        <div className="grid gap-3 sm:grid-cols-2 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Nom entreprise <span className="text-destructive">*</span></label>
            <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="ex: SOCOTRANS SARL" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Personne de contact <span className="text-destructive">*</span></label>
            <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="ex: M. Kalume" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Téléphone <span className="text-destructive">*</span></label>
            <Input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+243 ..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Email</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemple.cd" />
          </div>
        </div>

        {/* Bureau selection */}
        <div className="mt-2">
          <label className="text-xs font-medium block mb-2">Bureaux assignés</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BUREAUX_DOUANIERS.map(b => (
              <label key={b.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-all text-sm ${selectedBureauIds.includes(b.id) ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:bg-muted/30"}`}>
                <Checkbox checked={selectedBureauIds.includes(b.id)} onCheckedChange={() => toggleBureau(b.id)} />
                <span className="font-medium">{b.denomination}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Per-bureau commissions */}
        {bureaux.length > 0 && (
          <div className="mt-4 space-y-3">
            <label className="text-xs font-medium block">Configuration des commissions par bureau</label>
            {bureaux.map(pb => {
              const isExpanded = expanded.includes(pb.bureauId);
              const usedTypes = pb.commissions.map(c => c.typeDossierId);
              const availableTypes = TYPES_DOSSIERS.filter(t => t.actif && !usedTypes.includes(t.id));
              return (
                <div key={pb.bureauId} className="rounded-lg border border-border overflow-hidden">
                  <button type="button" onClick={() => toggleExpand(pb.bureauId)} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors">
                    <Building2 className="h-4 w-4 text-accent shrink-0" />
                    <span className="flex-1 text-left">{getBureauName(pb.bureauId)}</span>
                    <span className="text-xs text-muted-foreground">{pb.commissions.length} type(s)</span>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/5 p-3 space-y-2">
                      {pb.commissions.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="text-xs uppercase text-muted-foreground">
                              <tr><th className="text-left pb-2">Type dossier</th><th className="text-left pb-2">Prix global</th><th className="text-left pb-2">Commission</th><th className="text-left pb-2">Mode</th><th className="text-left pb-2">Résultat</th><th className="pb-2"></th></tr>
                            </thead>
                            <tbody>
                              {pb.commissions.map((c, idx) => {
                                const td = TYPES_DOSSIERS.find(t => t.id === c.typeDossierId);
                                const tarif = td?.tarif ?? 0;
                                const partVal = c.typeCommission === "pourcentage" ? Math.round(tarif * c.valeurCommission / 100 * 100) / 100 : c.valeurCommission;
                                return (
                                  <tr key={idx} className="border-t border-border/50">
                                    <td className="py-2 pr-2">
                                      <Select value={c.typeDossierId} onValueChange={v => updateCommission(pb.bureauId, idx, { typeDossierId: v })}>
                                        <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>{TYPES_DOSSIERS.filter(t => t.actif).map(t => <SelectItem key={t.id} value={t.id}>{t.libelle}</SelectItem>)}</SelectContent>
                                      </Select>
                                    </td>
                                    <td className="py-2 pr-2 font-mono text-xs text-muted-foreground">${tarif}</td>
                                    <td className="py-2 pr-2">
                                      <Input type="number" min={0} value={c.valeurCommission} onChange={e => updateCommission(pb.bureauId, idx, { valeurCommission: Number(e.target.value) })} className="h-8 w-20 text-xs" />
                                    </td>
                                    <td className="py-2 pr-2">
                                      <Select value={c.typeCommission} onValueChange={v => updateCommission(pb.bureauId, idx, { typeCommission: v as "fixe" | "pourcentage" })}>
                                        <SelectTrigger className="h-8 text-xs w-[90px]"><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="pourcentage">%</SelectItem><SelectItem value="fixe">$ fixe</SelectItem></SelectContent>
                                      </Select>
                                    </td>
                                    <td className="py-2 pr-2">
                                      <span className="text-xs font-semibold text-success">${partVal}</span>
                                      <span className="text-[10px] text-muted-foreground ml-1">/ ${tarif - partVal} sys</span>
                                    </td>
                                    <td className="py-2">
                                      <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeCommission(pb.bureauId, idx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <Button type="button" size="sm" variant="outline" onClick={() => addCommission(pb.bureauId)} disabled={availableTypes.length === 0} className="text-xs">
                        <Plus className="h-3 w-3 mr-1" />Ajouter un type
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
