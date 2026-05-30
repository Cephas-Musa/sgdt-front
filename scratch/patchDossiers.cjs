const fs = require('fs');
let code = fs.readFileSync('src/routes/app.dossiers.tsx', 'utf8');

// 1. In InspecteurDossiersView, we need to add the tabs.
const inspecteurViewRegex = /function InspecteurDossiersView\(\) \{[\s\S]*?(?=function SecretaireDossiersView)/;
let inspecteurViewCode = code.match(inspecteurViewRegex)[0];

const newInspecteurViewCode = `function InspecteurDossiersView() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState("mes_dossiers");

  const [searchRef, setSearchRef] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("tous");

  const [reprSearchDra, setReprSearchDra] = useState("");
  const [articlePopup, setArticlePopup] = useState(null);

  const allDossiers = (rawDossiers || []);

  const inspecteurDossiers = allDossiers.filter((d) => String(d.created_by) === String(user?.id) || String(d.inspecteur_id) === String(user?.id));
  const reprDossiers = allDossiers.filter((d) => d.representation_entry !== null && d.representation_entry !== undefined);

  const getCompletionStatus = (dossier) => {
    const hasBasicInfo = dossier.importateur && dossier.reference;
    const hasExtraData = dossier.extra_data && Object.keys(dossier.extra_data).length > 0;
    const isAppured = dossier.status === "appure";
    return { createdByInspecteur: !!hasBasicInfo, completedBySecretary: !!hasExtraData, isAppured: isAppured };
  };

  const getFilteredDossiers = () => {
    let filtered = [...inspecteurDossiers];
    if (searchRef) filtered = filtered.filter((d) => d.reference.toLowerCase().includes(searchRef.toLowerCase()));
    if (startDate) filtered = filtered.filter((d) => d.date >= startDate);
    if (endDate) filtered = filtered.filter((d) => d.date <= endDate);
    if (filterStatus !== "tous") filtered = filtered.filter((d) => d.status === filterStatus);
    return filtered;
  };

  const filteredDossiers = getFilteredDossiers();

  const filteredReprDossiers = reprDossiers.filter(d => {
    const dra = (d.representation_entry?.dra_reference || d.dra || "").toLowerCase();
    return reprSearchDra ? dra.includes(reprSearchDra.toLowerCase()) : true;
  });

  const handleSearch = () => {
    setIsLoading(true); setHasSearched(true);
    setTimeout(() => { setIsLoading(false); toast.success(filteredDossiers.length + " dossier(s) trouvé(s)."); }, 300);
  };
  const handleReset = () => { setSearchRef(""); setStartDate(""); setEndDate(""); setFilterStatus("tous"); setHasSearched(false); };
  const handleFinalApproval = async (dossierId, dossierRef) => {
    try { await apiUpdateDossierStatus(dossierId, "appure"); toast.success("Dossier appuré"); window.location.reload(); } catch(e) {}
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Mes Dossiers" description="Création, suivi et appurement final de vos dossiers douaniers." />

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <FileText className="h-4 w-4 text-accent" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Créer un nouveau dossier</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <DynamicDossierFormsContainer onSuccess={() => window.location.reload()} />
        </div>
      </div>

      <div className="flex gap-4 border-b border-border">
        <button onClick={() => setActiveTab("mes_dossiers")} className={\`pb-2 text-sm font-semibold transition-colors \${activeTab === "mes_dossiers" ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-foreground"}\`}>Mes Dossiers ({inspecteurDossiers.length})</button>
        <button onClick={() => setActiveTab("bureau_repr")} className={\`pb-2 text-sm font-semibold transition-colors \${activeTab === "bureau_repr" ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-foreground"}\`}>Bureau Représentation ({reprDossiers.length})</button>
      </div>

      {activeTab === "mes_dossiers" && (
        <>
          <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-accent/[0.03] p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div><label className="text-xs text-muted-foreground">Référence dossier</label><Input value={searchRef} onChange={e=>setSearchRef(e.target.value)} placeholder="RD-XXXX" className="h-9"/></div>
              <div><label className="text-xs text-muted-foreground">Date Début</label><Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="h-9"/></div>
              <div><label className="text-xs text-muted-foreground">Date Fin</label><Input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="h-9"/></div>
              <div><label className="text-xs text-muted-foreground">Statut</label><select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="tous">Tous</option><option value="brouillon">Brouillon</option><option value="complet">Complet</option><option value="appure">Appuré</option></select></div>
              <div className="flex items-end gap-2"><Button onClick={handleSearch} className="h-9 w-full">Rechercher</Button>{hasSearched && <Button variant="outline" onClick={handleReset} className="h-9">Reset</Button>}</div>
            </div>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-[10px] font-bold uppercase text-muted-foreground">
                <tr><th className="px-4 py-4">N°</th><th className="px-4 py-4">Référence</th><th className="px-4 py-4">Importateur</th><th className="px-4 py-4">Type</th><th className="px-4 py-4 text-center">Complétude</th><th className="px-4 py-4">Statut</th><th className="px-4 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDossiers.map((d, i) => {
                  const comp = getCompletionStatus(d);
                  return (
                    <tr key={d.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">{i+1}</span></td>
                      <td className="px-4 py-4 font-mono text-xs font-bold">{d.reference}</td>
                      <td className="px-4 py-4">{d.importateur || "—"}</td>
                      <td className="px-4 py-4"><span className="rounded-full bg-muted px-2 py-0.5 text-[10px] capitalize">{d.type || "—"}</span></td>
                      <td className="px-4 py-4 text-center text-xs">{comp.createdByInspecteur?"✓":"-"} {comp.completedBySecretary?"✓":"⏱"} {comp.isAppured?"✓":"-"}</td>
                      <td className="px-4 py-4"><Badge variant="outline" className="text-[10px]">{d.status?.toUpperCase()||"BROUILLON"}</Badge></td>
                      <td className="px-4 py-4 text-right">
                        <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/app/dossiers/$dossierId", params: { dossierId: d.id } })} className="h-8 w-8 p-0 border border-accent/20 text-accent hover:bg-accent hover:text-white"><ArrowRight className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "bureau_repr" && (
        <>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-end gap-3">
            <div><label className="text-xs text-muted-foreground">Recherche DRA</label><Input value={reprSearchDra} onChange={e=>setReprSearchDra(e.target.value)} placeholder="Ex: DRA-..." className="h-9 w-56" /></div>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-[10px] font-bold uppercase text-muted-foreground">
                <tr><th className="px-4 py-3">N°</th><th className="px-4 py-3">Réf DRA</th><th className="px-4 py-3">Importateur</th><th className="px-4 py-3">Bureau</th><th className="px-4 py-3 text-right">Articles</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReprDossiers.map((d, i) => {
                  const repr = d.representation_entry || {};
                  const dra = repr.dra_reference || d.dra || "—";
                  const imp = repr.importateur || d.importateur || "—";
                  const bureau = \`\${repr.bureau_etranger_code||""} \${repr.bureau_etranger_nom||""}\`.trim() || "—";
                  const allArticles = [...(d.articles||[]), ...(repr.articles||[])].filter((a,idx,arr)=>arr.findIndex(x=>x.id===a.id)===idx);
                  return (
                    <tr key={d.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs text-accent font-semibold">{i+1}</span></td>
                      <td className="px-4 py-3 font-mono font-bold text-accent">{dra}</td>
                      <td className="px-4 py-3 font-medium">{imp}</td>
                      <td className="px-4 py-3 text-xs">{bureau}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="outline" className="h-7 text-xs border-accent/20 text-accent hover:bg-accent hover:text-white" onClick={() => setArticlePopup({ dra, importateur: imp, articles: allArticles })}>Afficher</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {articlePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setArticlePopup(null)}>
          <div className="relative w-full max-w-3xl mx-4 rounded-xl border bg-card shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <div><h3 className="font-semibold text-sm">Articles — DRA : <span className="font-mono text-accent">{articlePopup.dra}</span></h3><p className="text-xs text-muted-foreground">{articlePopup.importateur}</p></div>
              <button onClick={() => setArticlePopup(null)} className="h-8 w-8 hover:bg-muted rounded text-muted-foreground">✕</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b font-bold uppercase text-muted-foreground text-[10px]">
                  <tr><th className="py-2">Désignation</th><th className="py-2">Position Tarifaire</th><th className="py-2 text-right">Poids (kg)</th><th className="py-2 text-right">Qté</th><th className="py-2 text-right">FOB</th></tr>
                </thead>
                <tbody className="divide-y">
                  {articlePopup.articles.map((a,i)=>(
                    <tr key={i}><td className="py-2">{a.designation||"—"}</td><td className="py-2 font-mono text-accent">{a.position_tarifaire||a.position||"—"}</td><td className="py-2 text-right">{a.poids||"—"}</td><td className="py-2 text-right">{a.quantite||"—"}</td><td className="py-2 text-right text-success font-bold">{a.fob||"—"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t flex justify-end"><Button variant="outline" size="sm" onClick={()=>setArticlePopup(null)}>Fermer</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(inspecteurViewRegex, newInspecteurViewCode + "\n\n");

// 2. ChefReprDossiersView
const chefReprRegex = /function ChefReprDossiersView\(\) \{[\s\S]*?(?=\nexport )/;
let chefReprCodeMatch = code.match(chefReprRegex);

if (!chefReprCodeMatch) {
    // If we didn't match the export, just match until the end of the file
    const fallbackRegex = /function ChefReprDossiersView\(\) \{[\s\S]*$/;
    chefReprCodeMatch = code.match(fallbackRegex);
}

const newChefReprCode = `function ChefReprDossiersView() {
  const { data: rawDossiersChef } = useApi(apiGetDossiers);
  const { user } = useAuth();
  const allDossiers = (rawDossiersChef || []);
  const [searchDra, setSearchDra] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [hasSearched, setHasSearched] = useState(false);
  const [articlePopup, setArticlePopup] = useState(null);

  // Filtrer les dossiers créés par l'opérateur de saisie de ce bureau (ou liés à ce bureau)
  // On filtre par le code bureau_etranger_code si on l'a, ou si user_id de l'opérateur correspond.
  // Pour l'instant, on prend tous les dossiers de représentation et on laisse le backend gérer, 
  // OU on utilise user?.bureauReprId si ça existe. Comme on a pas la liaison exacte dans le modèle mocké de l'utilisateur,
  // On va utiliser le filtrage frontend par d.created_by_role === 'operateur_saisie' (si on avait cette info).
  // Faisons un filtre sur "representation_entry" existante :
  const reprDossiers = allDossiers.filter((d) => d.representation_entry);

  const filteredDossiers = reprDossiers.filter((d) => {
    const dra = (d.representation_entry?.dra_reference || d.dra || "").toLowerCase();
    const matchesDra = searchDra ? dra.includes(searchDra.toLowerCase()) : true;
    return matchesDra;
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Dossiers (Bureau Représentation)" description="Supervision des dossiers traités par votre opérateur de saisie." />
      
      <div className="flex gap-3 items-end bg-card p-4 rounded-xl border">
        <div><label className="text-xs text-muted-foreground">Référence DRA</label><Input value={searchDra} onChange={e=>setSearchDra(e.target.value)} placeholder="DRA-..." className="h-9 w-56"/></div>
        <Button size="sm" className="h-9" onClick={() => setHasSearched(true)}>Rechercher</Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/50 font-bold uppercase text-muted-foreground text-[10px]">
            <tr><th className="px-4 py-3">N°</th><th className="px-4 py-3">Importateur</th><th className="px-4 py-3">DRA Réf</th><th className="px-4 py-3">Incoterm</th><th className="px-4 py-3">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredDossiers.map((d, i) => {
              const repr = d.representation_entry || {};
              const dra = repr.dra_reference || d.dra || "—";
              const imp = repr.importateur || d.importateur || "—";
              const allArticles = [...(d.articles||[]), ...(repr.articles||[])].filter((a,idx,arr)=>arr.findIndex(x=>x.id===a.id)===idx);
              return (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[10px] text-accent font-semibold">{i+1}</span></td>
                  <td className="px-4 py-3 font-bold">{imp}</td>
                  <td className="px-4 py-3 font-mono font-bold text-accent">{dra}</td>
                  <td className="px-4 py-3">{repr.incoterm || "—"}</td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] border-accent/20 text-accent hover:bg-accent hover:text-white" onClick={() => setArticlePopup({ dra, importateur: imp, articles: allArticles })}>Afficher</Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {articlePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setArticlePopup(null)}>
          <div className="relative w-full max-w-3xl mx-4 rounded-xl border bg-card shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <div><h3 className="font-semibold text-sm">Articles — DRA : <span className="font-mono text-accent">{articlePopup.dra}</span></h3><p className="text-xs text-muted-foreground">{articlePopup.importateur}</p></div>
              <button onClick={() => setArticlePopup(null)} className="h-8 w-8 hover:bg-muted rounded text-muted-foreground">✕</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b font-bold uppercase text-muted-foreground text-[10px]">
                  <tr><th className="py-2">Désignation</th><th className="py-2">Position Tarifaire</th><th className="py-2 text-right">Poids (kg)</th><th className="py-2 text-right">Qté</th><th className="py-2 text-right">FOB</th></tr>
                </thead>
                <tbody className="divide-y">
                  {articlePopup.articles.map((a,i)=>(
                    <tr key={i}><td className="py-2">{a.designation||"—"}</td><td className="py-2 font-mono text-accent">{a.position_tarifaire||a.position||"—"}</td><td className="py-2 text-right">{a.poids||"—"}</td><td className="py-2 text-right">{a.quantite||"—"}</td><td className="py-2 text-right text-success font-bold">{a.fob||"—"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t flex justify-end"><Button variant="outline" size="sm" onClick={()=>setArticlePopup(null)}>Fermer</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

if (chefReprCodeMatch) {
    code = code.replace(chefReprRegex, newChefReprCode + "\n\n");
    // if fallback matched to EOF, we just append it
    if (code.includes('function ChefReprDossiersView()') && fallbackRegex.test(code)) {
        code = code.replace(fallbackRegex, newChefReprCode);
    }
} else {
    code += "\n\n" + newChefReprCode;
}

fs.writeFileSync('src/routes/app.dossiers.tsx', code);
console.log('Patched');
