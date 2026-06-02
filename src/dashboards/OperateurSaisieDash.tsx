import { useState, useEffect } from "react";
import { FolderKanban, Globe, DollarSign, Bell, Plus, Search, Edit2 } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useApi, apiGetDossiers, apiGetLocodes, apiGetCountries, apiGetCurrencies, apiGetBureauxRepresentation, apiCreateDossier, apiSaveRepresentationEntry, apiCreateLocode, apiUpdateLocode, apiCreateCountry, apiUpdateCountry, apiCreateCurrency, apiUpdateCurrency } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";

function CompleterDossierDialog({ dossier, devises, pays, bureaux_repr, reload }: { dossier: any, devises: any[], pays: any[], bureaux_repr: any[], reload: () => void }) {
  const repr = dossier.representation_entry || {};
  const reprArticles = repr.articles?.length ? repr.articles : (dossier.articles || []);
  const [nombreArticles, setNombreArticles] = useState(Math.max(1, reprArticles.length));
  const [open, setOpen] = useState(false);
  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      hideFooter
      trigger={
        <Button size="sm" variant="outline" className="w-full text-accent border-accent hover:bg-accent/10">
          Compléter
        </Button>
      }
      title={`Compléter les informations — ${dossier.dra || "Dossier"}`}
      className="space-y-4"
    >
      <form onSubmit={async (e) => {
        e.preventDefault();
        try {
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          
          const articles = [];
          for (let i=0; i<nombreArticles; i++) {
            articles.push({
               designation: formData.get(`art_${i}_designation`),
               position_tarifaire: formData.get(`art_${i}_position`),
               quantite: formData.get(`art_${i}_quantite`),
               poids: formData.get(`art_${i}_poids`),
               fob: formData.get(`art_${i}_fob`)
            });
          }

          const reprPayload = {
            importateur: dossier.importateur || formData.get("importateur") || null,
            nif: dossier.nif || formData.get("nif") || null,
            bureau_etranger_code: formData.get("bureau_etranger_code") || null,
            dra_reference: dossier.dra || formData.get("dra_reference") || null,
            dra_date: formData.get("dra_date") || null,
            t1_reference: dossier.t1 || formData.get("t1_reference") || null,
            t1_date: formData.get("t1_date") || null,
            immatriculation_avant: formData.get("immatriculation_avant") || null,
            immatriculation_arriere: formData.get("immatriculation_arriere") || null,
            devise: formData.get("devise") || null,
            pays_provenance_code: formData.get("pays_provenance_code") || null,
            numero_conteneur: formData.get("numero_conteneur") || null,
            container_20: formData.get("container_20") ? 1 : 0,
            container_40: formData.get("container_40") ? 1 : 0,
            incoterm: formData.get("incoterm") || null,
            bureau_sortie_code: formData.get("bureau_sortie_code") || null,
            articles: articles
          };
          
          await apiSaveRepresentationEntry(dossier.id, reprPayload);
          toast.success("Dossier complété avec succès !");
          reload();
          setOpen(false);
        } catch (err: any) {
          toast.error(err.message || "Erreur d'enregistrement");
        }
      }} className="space-y-4">
        <FormGrid>
          <Field label="Importateur">
            <Input name="importateur" defaultValue={repr.importateur || dossier.importateur || ""} placeholder="Nom de l'importateur" disabled={!!dossier.importateur} className={dossier.importateur ? "bg-muted font-bold" : ""} />
          </Field>
          <Field label="NIF">
            <Input name="nif" defaultValue={repr.nif || dossier.nif || ""} placeholder="NIF de l'importateur" disabled={!!dossier.nif} className={dossier.nif ? "bg-muted font-bold" : ""} />
          </Field>
          <Field label="Code bureau étranger">
            <div className="flex gap-2">
              <Input name="bureau_etranger_code" defaultValue={repr.bureau_etranger_code || ""} placeholder="Code (ex: UGMPO)" className="max-w-[120px]" />
              <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
            </div>
          </Field>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <Field label="Référence DRA (E-XXX)">
              <Input name="dra_reference" defaultValue={repr.dra_reference || dossier.dra || ""} placeholder="E-001" disabled={!!dossier.dra} className={dossier.dra ? "bg-muted font-bold" : ""} />
            </Field>
            <Field label="Sa date">
              <Input name="dra_date" type="date" defaultValue={repr.dra_date ? repr.dra_date.split('T')[0] : ""} />
            </Field>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <Field label="Référence T1">
              <Input name="t1_reference" defaultValue={repr.t1_reference || dossier.t1 || ""} placeholder="T1-…" disabled={!!dossier.t1} className={dossier.t1 ? "bg-muted font-bold" : ""} />
            </Field>
            <Field label="Sa date">
              <Input name="t1_date" type="date" defaultValue={repr.t1_date ? repr.t1_date.split('T')[0] : ""} />
            </Field>
          </div>
          <Field label="Immatriculation avant">
            <Input name="immatriculation_avant" defaultValue={repr.immatriculation_avant || ""} placeholder="AA 0000 XY" />
          </Field>
          <Field label="Immatriculation arrière">
            <Input name="immatriculation_arriere" defaultValue={repr.immatriculation_arriere || ""} placeholder="BB 0000 ZA" />
          </Field>
          <Field label="Devise">
            <Select name="devise" defaultValue={repr.devise || "USD"}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {devises?.map((d) => (
                  <SelectItem key={d.id} value={d.codeDevise}>
                    {d.codeDevise} — {d.denomination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Pays de provenance">
            <div className="flex gap-2">
              <Select name="pays_provenance_code" defaultValue={repr.pays_provenance_code || ""}>
                <SelectTrigger className="max-w-[100px]">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {pays?.map((p) => (
                    <SelectItem key={p.id} value={p.code}>
                      {p.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
            </div>
          </Field>
          <Field label="Numéro centenaire">
            <Input name="numero_conteneur" defaultValue={repr.numero_conteneur || ""} />
          </Field>
          <Field label="Conteneur">
            <div className="flex flex-wrap gap-4 items-center h-9">
              <label className="flex items-center gap-2 text-sm">
                <input name="container_40" value="1" defaultChecked={repr.container_40 === 1} type="checkbox" className="rounded border-input" /> 1x40
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input name="container_20" value="1" defaultChecked={repr.container_20 === 1} type="checkbox" className="rounded border-input" /> 1x20
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-input" /> Conventionnel
              </label>
            </div>
          </Field>
          <Field label="Incoterm">
            <Input name="incoterm" defaultValue={repr.incoterm || ""} placeholder="FOB, CIF, etc." />
          </Field>
          <Field label="Bureau de sortie">
            <div className="flex gap-2">
              <Select name="bureau_sortie_code" defaultValue={repr.bureau_sortie_code || ""}>
                <SelectTrigger className="max-w-[120px]">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {bureaux_repr?.filter((b) => b.type === "sortie").map((b) => (
                    <SelectItem key={b.id} value={b.code}>
                      {b.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
            </div>
          </Field>
          <Field label="Nombre d'articles">
            <Input 
              name="nombreArticles"
              type="number" 
              min={1} 
              value={nombreArticles} 
              onChange={e => setNombreArticles(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </Field>
        </FormGrid>

        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <h4 className="font-semibold text-sm">Détail des Articles</h4>
          {Array.from({length: nombreArticles}).map((_, i) => (
            <div key={i} className="p-4 bg-muted/20 border border-border rounded-lg space-y-3">
              <h5 className="text-xs font-bold uppercase text-muted-foreground">Article {i + 1}</h5>
              <FormGrid>
                <Field label="Désignation"><Input name={`art_${i}_designation`} defaultValue={reprArticles[i]?.designation || ""} /></Field>
                <Field label="Position tarifaire"><Input name={`art_${i}_position`} defaultValue={reprArticles[i]?.position_tarifaire || reprArticles[i]?.position || ""} /></Field>
                <Field label="Quantité"><Input type="number" step="0.01" name={`art_${i}_quantite`} defaultValue={reprArticles[i]?.quantite || ""} /></Field>
                <Field label="Poids (kg)"><Input type="number" step="0.01" name={`art_${i}_poids`} defaultValue={reprArticles[i]?.poids || ""} /></Field>
                <Field label="FOB"><Input type="number" step="0.01" name={`art_${i}_fob`} defaultValue={reprArticles[i]?.fob || ""} /></Field>
              </FormGrid>
            </div>
          ))}
        </div>
        
        <Button type="submit" className="w-full mt-4 bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest text-[10px]">
          Enregistrer la Représentation
        </Button>
      </form>
    </FormDialog>
  );
}

export default function OperateurSaisieDash() {
  const { user } = useAuth();
  const { data: DOSSIERS, reload: reloadDossiers } = useApi(apiGetDossiers);
  const { data: rawLocodes, reload: reloadLocodes } = useApi(apiGetLocodes);
  const { data: rawPays, reload: reloadPays } = useApi(apiGetCountries);
  const { data: rawDevises, reload: reloadDevises } = useApi(apiGetCurrencies);
  const { data: rawBureaux } = useApi(apiGetBureauxRepresentation);

  // Fallback to empty array if data isn't loaded yet
  const safeDossiers = Array.isArray(DOSSIERS) ? DOSSIERS : [];
  const safeLocodes = Array.isArray(rawLocodes) ? rawLocodes : [];
  const safePays = Array.isArray(rawPays) ? rawPays : [];
  const safeDevises = Array.isArray(rawDevises) ? rawDevises : [];
  const safeBureaux = Array.isArray(rawBureaux) ? rawBureaux : [];

  const [searchRef, setSearchRef] = useState("");
  const [searchDra, setSearchDra] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [devise, setDevise] = useState("USD");
  const [nombreArticles, setNombreArticles] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  // States for Locode, Pays, Devises
  const [newLocode, setNewLocode] = useState({ code: "", designation: "", codePays: "", denomination: "" });
  const [newPays, setNewPays] = useState({ code: "", designation: "" });
  const [newDevise, setNewDevise] = useState({ codePays: "", codeDevise: "", denominationPays: "", denominationDevise: "" });
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    if (newLocode.codePays) {
      const found = safePays.find((p: any) => p.code.toUpperCase() === newLocode.codePays.toUpperCase());
      setNewLocode(prev => ({ ...prev, denomination: found?.designation || "" }));
    }
  }, [newLocode.codePays, safePays]);

  useEffect(() => {
    if (newDevise.codePays) {
      const found = safePays.find((p: any) => p.code.toUpperCase() === newDevise.codePays.toUpperCase());
      setNewDevise(prev => ({ ...prev, denominationPays: found?.designation || "" }));
    }
  }, [newDevise.codePays, safePays]);

  const filtered = safeDossiers.filter((d: any) => {
    // Le backend filtre déjà les dossiers selon les accès de l'utilisateur

    const matchRef = !searchRef || d.reference?.toLowerCase().includes(searchRef.toLowerCase());
    const matchDra = !searchDra || (d.dra || "").toLowerCase().includes(searchDra.toLowerCase());
    const matchDate = (!dateStart || d.created_at >= dateStart) && (!dateEnd || d.created_at <= dateEnd);
    return matchRef && matchDra && matchDate;
  });

  return (
    <div>
      <DashHeader subtitle="Opérateur Saisie — dossiers, locode, pays, devises, alertes" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={safeDossiers.length} />
        <StatCard icon={Globe} label="Locodes" value={safeLocodes.length} />
        <StatCard icon={DollarSign} label="Devises" value={safeDevises.length} />
        <StatCard
          icon={Bell}
          label="Alertes actives"
          value={0} // Simulate active alerts
        />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="dossiers">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
            <TabsTrigger value="nouveau">Nouveau dossier</TabsTrigger>
            <TabsTrigger value="locode">Locode</TabsTrigger>
            <TabsTrigger value="pays">Pays</TabsTrigger>
            <TabsTrigger value="devises">Devises</TabsTrigger>
          </TabsList>

          {/* DOSSIERS TAB */}
          <TabsContent value="dossiers" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-3 items-end bg-card/50 p-4 rounded-xl border shrink-0">
                <div className="w-48">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Réf. Dossier</label>
                  <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent/40 bg-background">
                    <span className="flex h-9 items-center rounded-l-md border-r border-input bg-muted/60 px-3 text-sm font-semibold select-none">
                      RD-
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={searchRef.replace(/^RD-/i, "")}
                      onChange={(e) => setSearchRef("RD-" + e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="0001"
                      className="h-9 w-full flex-1 rounded-r-md bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
              <div className="w-48">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Réf. DRA</label>
                <Input placeholder="Recherche par DRA…" value={searchDra} onChange={(e) => setSearchDra(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="w-36">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Date Début</label>
                <input type="date" className="w-full h-9 rounded-lg border bg-background px-2 text-xs" value={dateStart} onChange={e => setDateStart(e.target.value)} />
              </div>
              <div className="w-36">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Date Fin</label>
                <input type="date" className="w-full h-9 rounded-lg border bg-background px-2 text-xs" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
              </div>
              <Button size="sm" className="h-9 px-4 font-black uppercase tracking-widest text-[10px]" onClick={() => { setHasSearched(true); toast.success("Filtres appliqués"); }}>Rechercher</Button>
              {hasSearched && <Button variant="ghost" size="sm" className="h-9 px-4 text-[10px]" onClick={() => { setSearchRef(""); setSearchDra(""); setDateStart(""); setDateEnd(""); setHasSearched(false); }}>Reset</Button>}
            </div>

            <Panel title={`Liste des dossiers (${filtered.length})`}>
              <div className="space-y-3">
                {filtered.slice(0, 15).map((d, index) => (
                  <div
                    key={d.id}
                    className="border border-border rounded-lg overflow-hidden hover:bg-muted/30 transition"
                  >
                    {/* Dossier Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-3 bg-muted/20 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">N°</span>
                        <p className="font-mono font-semibold text-accent">{index + 1}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Bureau</span>
                        <p className="font-semibold">{d.bureauRepr}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Importateur</span>
                        <p className="font-semibold">{d.importateur}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">DRA</span>
                        <p className="font-semibold text-accent font-mono">{d.dra}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">T1</span>
                        <p className="font-semibold font-mono">{d.t1}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Date</span>
                        <p className="font-semibold">{d.date}</p>
                      </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 p-3 text-sm border-t border-border items-center">
                      <div className="hidden">
                        <span className="text-xs text-muted-foreground">Réf. Dossier</span>
                        <p className="font-semibold">{d.reference}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Véhicule</span>
                        <p className="font-semibold">{d.vehicule || "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Devise</span>
                        <p className="font-semibold">{d.devise}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Marchandise</span>
                        <p className="font-semibold">{d.typeMarchandises}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Contenaire</span>
                        <p className="font-semibold">
                          {d.colis}x{d.poids > 500 ? "40" : "20"}
                        </p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <CompleterDossierDialog dossier={d} devises={safeDevises} pays={safePays} bureaux_repr={safeBureaux} reload={reloadDossiers} />
                        <FormDialog
                          trigger={
                            <Button size="sm" className="w-full bg-accent text-white hover:bg-accent/90">
                              Afficher
                            </Button>
                          }
                          title={`Articles du Dossier`}
                        >
                          <div className="space-y-4">
                            <table className="w-full text-xs">
                              <thead className="bg-muted/50 text-left text-muted-foreground uppercase font-bold text-[10px]">
                                <tr>
                                  <th className="px-2 py-2">Article</th>
                                  <th className="px-2 py-2">Position Tarifaire</th>
                                  <th className="px-2 py-2 text-right">Qté</th>
                                  <th className="px-2 py-2 text-right">Poids (kg)</th>
                                  <th className="px-2 py-2 text-right">FOB</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {(() => {
                                  const allArticles = [
                                    ...(d.articles || []),
                                    ...(d.representation_entry?.articles || d.representationEntry?.articles || [])
                                  ];
                                  if (allArticles.length === 0) {
                                    return (
                                      <tr>
                                        <td colSpan={5} className="px-2 py-4 text-center text-muted-foreground">Aucun article enregistré.</td>
                                      </tr>
                                    );
                                  }
                                  return allArticles.map((art: any, i: number) => (
                                    <tr key={art.id || i}>
                                      <td className="px-2 py-2 font-semibold">{art.designation}</td>
                                      <td className="px-2 py-2 font-mono">{art.position_tarifaire || art.position || "—"}</td>
                                      <td className="px-2 py-2 text-right">{art.quantite}</td>
                                      <td className="px-2 py-2 text-right font-mono">{art.poids}</td>
                                      <td className="px-2 py-2 text-right font-bold text-success">{art.fob}</td>
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </FormDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>

          {/* NOUVEAU DOSSIER */}
          <TabsContent value="nouveau" className="mt-4">
            <Panel title="Segment général — Nouveau dossier">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const form = e.target as HTMLFormElement;
                    const formData = new FormData(form);

                    // Construire le payload création dossier
                    const articles = [];
                    for (let i = 0; i < nombreArticles; i++) {
                      const designation = formData.get(`art_${i}_designation`) as string | null;
                      if (!designation) continue;
                      articles.push({
                        designation,
                        position_tarifaire: formData.get(`art_${i}_position`),
                        quantite: formData.get(`art_${i}_quantite`),
                        poids: formData.get(`art_${i}_poids`),
                        fob: formData.get(`art_${i}_fob`),
                      });
                    }

                    const dossierPayload = {
                      importateur: formData.get("importateur") || null,
                      nif: formData.get("nif") || null,
                      bureau_id: user?.bureau_id || null,
                      metadata: { source: "representation" },
                    };

                    // 1. Créer le dossier
                    const created = await apiCreateDossier(dossierPayload) as any;
                    if (!created?.id) throw new Error("Échec création dossier");

                    // 2. Sauvegarder les données de représentation
                    const reprPayload = {
                      importateur: formData.get("importateur") || null,
                      nif: formData.get("nif") || null,
                      bureau_etranger_code: formData.get("bureau_etranger_code") || null,
                      dra_reference: formData.get("dra_reference") || null,
                      dra_date: formData.get("dra_date") || null,
                      t1_reference: formData.get("t1_reference") || null,
                      t1_date: formData.get("t1_date") || null,
                      immatriculation_avant: formData.get("immatriculation_avant") || null,
                      immatriculation_arriere: formData.get("immatriculation_arriere") || null,
                      devise: devise || null,
                      pays_provenance_code: formData.get("pays_provenance_code") || null,
                      numero_conteneur: formData.get("numero_conteneur") || null,
                      container_20: formData.get("container_20") ? 1 : 0,
                      container_40: formData.get("container_40") ? 1 : 0,
                      incoterm: formData.get("incoterm") || null,
                      bureau_sortie_code: formData.get("bureau_sortie_code") || null,
                      articles,
                    };

                    await apiSaveRepresentationEntry(created.id, reprPayload);

                    toast.success(`Dossier créé avec succès !`);
                    reloadDossiers();
                    setNombreArticles(1);
                    form.reset();
                  } catch (err: any) {
                    toast.error(err.message || "Erreur lors de la création du dossier.");
                  }
                }}
                className="space-y-4"
              >
                <FormGrid>
                  <Field label="Importateur">
                    <Input name="importateur" placeholder="Nom de l'importateur" />
                  </Field>
                  <Field label="NIF">
                    <Input name="nif" placeholder="NIF de l'importateur (Facultatif)" />
                  </Field>
                  <Field label="Code bureau étranger">
                    <div className="flex gap-2">
                      <Input name="bureau_etranger_code" placeholder="Code (ex: UGMPO)" className="max-w-[120px]" />
                      <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
                    </div>
                  </Field>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <Field label="Réf. DRA">
                      <Input name="dra_reference" placeholder="E-001" />
                    </Field>
                    <Field label="Date DRA">
                      <Input name="dra_date" type="date" />
                    </Field>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <Field label="Réf. T1">
                      <Input name="t1_reference" placeholder="T1-…" />
                    </Field>
                    <Field label="Date T1">
                      <Input name="t1_date" type="date" />
                    </Field>
                  </div>
                  <Field label="Immatriculation avant">
                    <Input name="immatriculation_avant" placeholder="AA 0000 XY" />
                  </Field>
                  <Field label="Immatriculation arrière">
                    <Input name="immatriculation_arriere" placeholder="BB 0000 ZA" />
                  </Field>
                  <Field label="Devise">
                    <Select value={devise} onValueChange={setDevise}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {safeDevises?.map((d) => (
                          <SelectItem key={d.id} value={d.code_devise || d.codeDevise || d.code}>
                            {d.code_devise || d.codeDevise || d.code} — {d.denomination}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Pays de provenance">
                    <div className="flex gap-2">
                      <Select name="pays_provenance_code">
                        <SelectTrigger className="max-w-[100px]">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {safePays?.map((p) => (
                            <SelectItem key={p.id} value={p.code}>
                              {p.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
                    </div>
                  </Field>
                  <Field label="Numéro centenaire">
                    <Input name="numero_conteneur" />
                  </Field>
                  <Field label="Conteneur">
                    <div className="flex flex-wrap gap-4 items-center h-9">
                      <label className="flex items-center gap-2 text-sm">
                        <input name="container_40" value="1" type="checkbox" className="rounded border-input" /> 1x40
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input name="container_20" value="1" type="checkbox" className="rounded border-input" /> 1x20
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-input" /> Conventionnel
                      </label>
                    </div>
                  </Field>
                  <Field label="Incoterm">
                    <Input name="incoterm" placeholder="FOB, CIF, etc." />
                  </Field>
                  <Field label="Bureau de sortie">
                    <div className="flex gap-2">
                      <Select name="bureau_sortie_code">
                        <SelectTrigger className="max-w-[120px]">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {safeBureaux?.filter((b: any) => b.type === "sortie").map((b: any) => (
                            <SelectItem key={b.id} value={b.code}>
                              {b.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
                    </div>
                  </Field>
                  <Field label="Nombre d'articles">
                    <Input
                      name="nombreArticles"
                      type="number"
                      min={1}
                      value={nombreArticles}
                      onChange={(e) => setNombreArticles(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </Field>
                </FormGrid>

                {/* GESTION AUTOMATIQUE DES ARTICLES */}
                <div className="mt-6 pt-4 border-t space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Détails des Articles ({nombreArticles})</h3>
                  {Array.from({ length: nombreArticles }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border bg-muted/10 space-y-3">
                      <h4 className="text-xs font-bold text-accent uppercase">Article {i + 1}</h4>
                      <FormGrid>
                        <Field label="Désignation"><Input name={`art_${i}_designation`} /></Field>
                        <Field label="Position tarifaire"><Input name={`art_${i}_position`} /></Field>
                        <Field label="Quantité"><Input name={`art_${i}_quantite`} type="number" /></Field>
                        <Field label="Poids (kg)"><Input name={`art_${i}_poids`} type="number" /></Field>
                        <Field label="FOB ($)"><Input name={`art_${i}_fob`} type="number" /></Field>
                      </FormGrid>
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full h-11 font-bold uppercase tracking-wider">Enregistrer le Dossier</Button>
              </form>
            </Panel>
          </TabsContent>

          {/* LOCODE */}
          <TabsContent value="locode" className="flex-1 mt-4 min-h-0">
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-center bg-card/50 p-4 rounded-xl border shrink-0">
                <div className="relative w-64">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Chercher Locode..." className="pl-9 h-9 text-xs" />
                </div>
                <FormDialog
                  trigger={<Button size="sm" className="gap-2 bg-accent text-[10px] font-black uppercase h-9 px-4" onClick={() => { setEditingItem(null); setNewLocode({ code: "", designation: "", codePays: "", denomination: "" }); }}><Plus className="h-4 w-4" />Nouveau Locode</Button>}
                  title={editingItem ? "Editer Locode" : "Ajouter Locode"}
                  onSubmit={async () => {
                    try {
                      if (editingItem) {
                        await apiUpdateLocode(editingItem.id, { ...newLocode, code_pays: newLocode.codePays });
                        toast.success("Locode mis à jour");
                      } else {
                        await apiCreateLocode({ code: newLocode.code, designation: newLocode.designation, code_pays: newLocode.codePays, denomination: newLocode.denomination, id: "loc-" + Date.now() });
                        toast.success("Locode ajouté");
                      }
                      reloadLocodes();
                    } catch (e: any) {
                      toast.error(e?.message || "Erreur lors de l'enregistrement");
                    }
                  }}
                >
                  <FormGrid>
                    <Field label="Code Locode"><Input placeholder="UGKLA" value={newLocode.code} onChange={e => setNewLocode({...newLocode, code: e.target.value.toUpperCase()})} /></Field>
                    <Field label="Désignation"><Input value={newLocode.designation} onChange={e => setNewLocode({...newLocode, designation: e.target.value})} /></Field>
                    <Field label="Code Pays (ISO)"><Input placeholder="UG" value={newLocode.codePays} onChange={e => setNewLocode({...newLocode, codePays: e.target.value.toUpperCase()})} /></Field>
                    <Field label="Dénomination Pays"><Input disabled className="bg-muted font-bold" value={newLocode.denomination} /></Field>
                  </FormGrid>
                  <Button className="w-full h-11 mt-4 font-black uppercase text-[10px]">{editingItem ? "Mettre à jour" : "Ajouter"}</Button>
                </FormDialog>
              </div>
              <Panel title="Liste des Locodes" className="flex-1 min-h-0">
                <div className="h-full overflow-y-auto">
                  <DataTable
                    data={safeLocodes}
                    columns={[
                      { key: "code", header: "Code", render: (r) => <span className="font-mono font-bold text-accent">{r.code}</span> },
                      { key: "designation", header: "Désignation" },
                      { key: "denomination", header: "Pays", render: (r) => <span className="font-bold">{r.denomination}</span> },
                      { key: "actions", header: "", render: (r) => <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingItem(r); setNewLocode(r); }}><Edit2 className="h-3.5 w-3.5" /></Button> }
                    ]}
                  />
                </div>
              </Panel>
            </div>
          </TabsContent>

          {/* PAYS */}
          <TabsContent value="pays" className="flex-1 mt-4 min-h-0">
            <div className="flex flex-col h-full gap-4">
               <div className="flex justify-between items-center bg-card/50 p-4 rounded-xl border shrink-0">
                  <div className="relative w-64">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Filtrer pays..." className="pl-9 h-9 text-xs" />
                  </div>
                   <FormDialog
                     trigger={<Button size="sm" className="gap-2 h-9 text-[10px] font-black uppercase" onClick={() => { setEditingItem(null); setNewPays({ code: "", designation: "" }); }}><Plus className="h-4 w-4" />Nouveau Pays</Button>}
                     title={editingItem ? "Editer Pays" : "Enregistrer un pays"}
                     onSubmit={async () => {
                       try {
                         const payload: Record<string, any> = {
                           id: "p-" + Date.now(),
                           code: (newPays.code || editingItem?.code || "").toUpperCase(),
                           designation: newPays.designation || editingItem?.designation || ""
                         };
                         if (editingItem) {
                           await apiUpdateCountry(editingItem.id, payload);
                           toast.success("Pays mis à jour");
                         } else {
                           await apiCreateCountry(payload);
                           toast.success("Pays ajouté");
                         }
                         reloadPays();
                       } catch (e: any) {
                         toast.error(e?.message || "Erreur");
                       }
                     }}
                   >
                      <FormGrid>
                        <Field label="Code ISO 2"><Input placeholder="UG" value={newPays.code} onChange={e => setNewPays({...newPays, code: e.target.value.toUpperCase()})} /></Field>
                        <Field label="Désignation"><Input placeholder="OUGANDA" value={newPays.designation} onChange={e => setNewPays({...newPays, designation: e.target.value})} /></Field>
                      </FormGrid>
                      <Button className="w-full h-11 mt-4 font-black uppercase text-[10px]">{editingItem ? "Mettre à jour" : "Ajouter"}</Button>
                   </FormDialog>
               </div>
               <Panel title="Liste des Pays" className="flex-1 min-h-0">
                  <div className="h-full overflow-y-auto">
                    <DataTable
                      data={safePays}
                      columns={[
                        { key: "code", header: "ISO", render: (r) => <Badge variant="secondary" className="font-mono">{r.code}</Badge> },
                        { key: "designation", header: "Dénomination", render: (r) => <span className="font-bold">{r.designation}</span> },
                        { key: "actions", header: "", render: (r) => <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingItem(r); setNewPays({ code: r.code, designation: r.designation }); }}><Edit2 className="h-3.5 w-3.5" /></Button> }
                      ]}
                    />
                  </div>
               </Panel>
            </div>
          </TabsContent>

          {/* DEVISES */}
          <TabsContent value="devises" className="flex-1 mt-4 min-h-0">
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-center bg-card/50 p-4 rounded-xl border shrink-0">
                  <div className="relative w-64">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Chercher devise..." className="pl-9 h-9 text-xs" />
                  </div>
                  <FormDialog
                    trigger={<Button size="sm" className="gap-2 h-9 text-[10px] font-black uppercase" onClick={() => { setEditingItem(null); setNewDevise({ codePays: "", codeDevise: "", denominationPays: "", denominationDevise: "" }); }}><Plus className="h-4 w-4" />Nouvelle Devise</Button>}
                    title={editingItem ? "Editer Devise" : "Ajouter Devise"}
                    onSubmit={async () => {
                      try {
                        const payload = {
                          id: "dev-" + Date.now(),
                          code_pays: newDevise.codePays,
                          code_devise: newDevise.codeDevise,
                          denomination: newDevise.denominationDevise
                        };
                        if (editingItem) {
                          await apiUpdateCurrency(editingItem.id, payload);
                          toast.success("Devise mise à jour");
                        } else {
                          await apiCreateCurrency(payload);
                          toast.success("Devise ajoutée");
                        }
                        reloadDevises();
                      } catch (e: any) {
                        toast.error(e?.message || "Erreur");
                      }
                    }}
                  >
                    <FormGrid>
                      <Field label="Code Pays"><Input placeholder="UG" value={newDevise.codePays} onChange={e => setNewDevise({...newDevise, codePays: e.target.value.toUpperCase()})} /></Field>
                      <Field label="Dénomination Pays"><Input disabled className="bg-muted font-bold" value={newDevise.denominationPays} /></Field>
                      <Field label="Code Devise"><Input placeholder="UGX" value={newDevise.codeDevise} onChange={e => setNewDevise({...newDevise, codeDevise: e.target.value.toUpperCase()})} /></Field>
                      <Field label="Désignation Devise"><Input placeholder="Shilling Ougandais" value={newDevise.denominationDevise} onChange={e => setNewDevise({...newDevise, denominationDevise: e.target.value})} /></Field>
                    </FormGrid>
                    <Button className="w-full h-11 mt-4 font-black uppercase text-[10px]">{editingItem ? "Mettre à jour" : "Ajouter"}</Button>
                  </FormDialog>
              </div>
              <Panel title="Gestion des Devises" className="flex-1 min-h-0">
                <div className="h-full overflow-y-auto">
                  <DataTable
                    data={safeDevises}
                    columns={[
                      { key: "codePays", header: "Pays", render: (r) => <Badge variant="outline">{r.codePays}</Badge> },
                      { key: "codeDevise", header: "Devise", render: (r) => <Badge className="bg-success/10 text-success border-success/30 font-black">{r.codeDevise}</Badge> },
                      { key: "denomination", header: "Dénomination", render: (r) => <span className="font-bold">{r.denomination}</span> },
                      { key: "actions", header: "", render: (r) => <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingItem(r); setNewDevise({ codePays: r.codePays, codeDevise: r.codeDevise, denominationPays: "", denominationDevise: r.denomination }); }}><Edit2 className="h-3.5 w-3.5" /></Button> }
                    ]}
                  />
                </div>
              </Panel>
            </div>
          </TabsContent>

          {/* ALERTES / NOTIFICATIONS REMOVED - NOW IN SIDEBAR */}
        </Tabs>
      </div>
    </div>
  );
}
