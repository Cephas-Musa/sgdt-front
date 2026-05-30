import fs from 'fs';

let code = fs.readFileSync('src/routes/app.dossiers.tsx', 'utf8');

// Add the routing for inspecteur
if (!code.includes('return <InspecteurDossiersView />;')) {
  code = code.replace(
    '  if (user?.role === "chef_bureau_repr") {\n    return <ChefReprDossiersView />;\n  }',
    '  if (user?.role === "chef_bureau_repr") {\n    return <ChefReprDossiersView />;\n  }\n\n  if (user?.role === "inspecteur_chef") {\n    return <InspecteurDossiersView />;\n  }'
  );
}

// Safely remove the inline creation form for inspecteur
const inspecteurFormStrStart = '{/* ── CRÉATION DE DOSSIERS (Inspecteur uniquement) ── */}';
const inspecteurFormStrEnd = 'AutresForm />\n          </div>\n        </div>\n      )}';

const startIdx = code.indexOf(inspecteurFormStrStart);
if (startIdx !== -1) {
    let endIdx = code.indexOf(inspecteurFormStrEnd, startIdx);
    if (endIdx !== -1) {
        endIdx += inspecteurFormStrEnd.length;
        code = code.substring(0, startIdx) + code.substring(endIdx);
    }
}

// The InspecteurDossiersView component
const newInspecteurDossiersView = `
function InspecteurDossiersView() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState("mes_dossiers");

  const [searchRef, setSearchRef] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [filterStatus, setFilterStatus] = useState("tous");

  const [reprSearchDra, setReprSearchDra] = useState("");
  const [articlePopup, setArticlePopup] = useState<{dra:string, importateur:string, articles:any[]}|null>(null);

  const allDossiers = (rawDossiers || []) as Dossier[];

  const inspecteurDossiers = allDossiers.filter((d) => String(d.created_by) === String(user?.id) || String(d.inspecteur_id) === String(user?.id));
  const reprDossiers = allDossiers.filter((d) => d.representation_entry !== null && d.representation_entry !== undefined);

  const getCompletionStatus = (dossier: Dossier) => {
    const hasBasicInfo = !!(dossier.importateur && dossier.reference);
    const hasExtraData = !!(dossier.extra_data && Object.keys(dossier.extra_data).length > 0);
    const isAppured = dossier.status === "appure";
    return { createdByInspecteur: hasBasicInfo, completedBySecretary: hasExtraData, isAppured: isAppured };
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
    setHasSearched(true);
    toast.success(filteredDossiers.length + " dossier(s) trouvé(s).");
  };
  const handleReset = () => { setSearchRef(""); setStartDate(""); setEndDate(""); setFilterStatus("tous"); setHasSearched(false); };

  return (
    <div className="space-y-6">
      <PageHeader title="Mes Dossiers" description="Création, suivi et appurement final de vos dossiers douaniers." />

      <div className="flex gap-4 border-b border-border">
        <button onClick={() => setActiveTab("mes_dossiers")} className={\`pb-2 text-sm font-semibold transition-colors \${activeTab === "mes_dossiers" ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-foreground"}\`}>Mes Dossiers ({inspecteurDossiers.length})</button>
        <button onClick={() => setActiveTab("bureau_repr")} className={\`pb-2 text-sm font-semibold transition-colors \${activeTab === "bureau_repr" ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-foreground"}\`}>Bureau Représentation ({reprDossiers.length})</button>
      </div>

      {activeTab === "mes_dossiers" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <FileText className="h-4 w-4 text-accent" />
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Créer un nouveau dossier</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <DirectForm />
              <TransbordementForm />
              <VracForm />
              <LotForm />
              <PetrolierForm />
              <DechargementForm />
              <TraficForm />
              <ExportForm />
              <AutresForm />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-accent/[0.03] p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div><label className="text-xs text-muted-foreground">Référence dossier</label><Input value={searchRef} onChange={e=>setSearchRef(e.target.value)} placeholder="RD-XXXX" className="h-9 mt-1.5"/></div>
              <div><label className="text-xs text-muted-foreground">Date Début</label><Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="h-9 mt-1.5"/></div>
              <div><label className="text-xs text-muted-foreground">Date Fin</label><Input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="h-9 mt-1.5"/></div>
              <div><label className="text-xs text-muted-foreground">Statut</label><select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="flex h-9 w-full mt-1.5 rounded-md border border-input bg-background px-3 text-sm"><option value="tous">Tous</option><option value="brouillon">Brouillon</option><option value="complet">Complet</option><option value="appure">Appuré</option></select></div>
              <div className="flex items-end gap-2"><Button onClick={handleSearch} className="h-9 w-full">Rechercher</Button>{hasSearched && <Button variant="outline" onClick={handleReset} className="h-9">Reset</Button>}</div>
            </div>
          </div>
          
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-[10px] font-bold uppercase text-muted-foreground">
                <tr><th className="px-4 py-4">N°</th><th className="px-4 py-4">Référence</th><th className="px-4 py-4">Importateur</th><th className="px-4 py-4">Type</th><th className="px-4 py-4 text-center">Complétude</th><th className="px-4 py-4">Statut</th><th className="px-4 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDossiers.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucun dossier trouvé.</td></tr>}
                {filteredDossiers.map((d, i) => {
                  const comp = getCompletionStatus(d);
                  return (
                    <tr key={d.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">{i+1}</span></td>
                      <td className="px-4 py-4 font-mono text-xs font-bold">{d.reference}</td>
                      <td className="px-4 py-4">{d.importateur || "—"}</td>
                      <td className="px-4 py-4"><span className="rounded-full bg-muted px-2 py-0.5 text-[10px] capitalize">{d.type || "—"}</span></td>
                      <td className="px-4 py-4 text-center text-xs">{comp.createdByInspecteur?"✓":"-"} {comp.completedBySecretary?"✓":"⏱"} {comp.isAppured?"✓":"-"}</td>
                      <td className="px-4 py-4"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-4 text-right">
                        <Button size="sm" variant="ghost" onClick={() => navigate({ to: \`/app/dossiers/\${d.id}\` })} className="h-8 w-8 p-0 border border-accent/20 text-accent hover:bg-accent hover:text-white"><ArrowRight className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "bureau_repr" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-end gap-3">
            <div><label className="text-xs text-muted-foreground">Recherche DRA</label><Input value={reprSearchDra} onChange={e=>setReprSearchDra(e.target.value)} placeholder="Ex: DRA-..." className="h-9 w-56 mt-1.5" /></div>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-[10px] font-bold uppercase text-muted-foreground">
                <tr><th className="px-4 py-3">N°</th><th className="px-4 py-3">Réf DRA</th><th className="px-4 py-3">Importateur</th><th className="px-4 py-3">Bureau</th><th className="px-4 py-3 text-right">Articles</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReprDossiers.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucun dossier trouvé.</td></tr>}
                {filteredReprDossiers.map((d, i) => {
                  const repr = d.representation_entry || {};
                  const dra = repr.dra_reference || d.dra || "—";
                  const imp = repr.importateur || d.importateur || "—";
                  const bureau = \`\${repr.bureau_etranger_code||""} \${repr.bureau_etranger_nom||""}\`.trim() || d.bureauRepr || "—";
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
        </div>
      )}

      {articlePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setArticlePopup(null)}>
          <div className="relative w-full max-w-4xl mx-4 rounded-xl border bg-card shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <div><h3 className="font-semibold text-sm">Articles — DRA : <span className="font-mono text-accent">{articlePopup.dra}</span></h3><p className="text-xs text-muted-foreground">{articlePopup.importateur}</p></div>
              <button onClick={() => setArticlePopup(null)} className="h-8 w-8 hover:bg-muted rounded text-muted-foreground flex items-center justify-center">✕</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-auto">
              <table className="w-full text-xs text-left border">
                <thead className="bg-muted font-bold uppercase text-muted-foreground text-[10px]">
                  <tr><th className="p-2 border-b">Désignation</th><th className="p-2 border-b">Position Tarifaire</th><th className="p-2 border-b text-right">Poids (kg)</th><th className="p-2 border-b text-right">Qté</th><th className="p-2 border-b text-right">FOB</th></tr>
                </thead>
                <tbody className="divide-y">
                  {articlePopup.articles.length === 0 && <tr><td colSpan={5} className="p-4 text-center">Aucun article disponible</td></tr>}
                  {articlePopup.articles.map((a,i)=>(
                    <tr key={i}>
                      <td className="p-2 border-b">{a.designation||"—"}</td>
                      <td className="p-2 border-b font-mono text-accent">{a.position_tarifaire||a.position||"—"}</td>
                      <td className="p-2 border-b text-right">{a.poids||"—"}</td>
                      <td className="p-2 border-b text-right">{a.quantite||"—"}</td>
                      <td className="p-2 border-b text-right text-success font-bold">{a.fob||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t flex justify-end bg-muted/20"><Button variant="outline" size="sm" onClick={()=>setArticlePopup(null)}>Fermer</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

if (!code.includes('function InspecteurDossiersView()')) {
    code += '\n\n' + newInspecteurDossiersView;
} else {
    code = code.replace(/function InspecteurDossiersView\(\) \{[\s\S]*?(?=\n\n(?:function|\/\*))/s, newInspecteurDossiersView);
}

// Ensure ChefReprDossiersView is correct
const chefReprViewNew = `
function ChefReprDossiersView() {
  const { data: rawDossiersChef } = useApi(apiGetDossiers);
  const allDossiers = (rawDossiersChef || []) as Dossier[];
  const [searchDra, setSearchDra] = useState("");
  const [articlePopup, setArticlePopup] = useState<{dra:string, importateur:string, articles:any[]}|null>(null);

  const reprDossiers = allDossiers.filter((d) => d.representation_entry);

  const filteredDossiers = reprDossiers.filter((d) => {
    const dra = (d.representation_entry?.dra_reference || d.dra || "").toLowerCase();
    const matchesDra = searchDra ? dra.includes(searchDra.toLowerCase()) : true;
    return matchesDra;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Dossiers (Bureau Représentation)" description="Supervision des dossiers traités par votre opérateur de saisie." />
      
      <div className="flex gap-3 items-end bg-card p-4 rounded-xl border shadow-sm">
        <div><label className="text-xs text-muted-foreground block mb-1.5">Référence DRA</label><Input value={searchDra} onChange={e=>setSearchDra(e.target.value)} placeholder="DRA-..." className="h-9 w-64"/></div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 font-bold uppercase text-muted-foreground text-[10px]">
            <tr><th className="px-4 py-3">N°</th><th className="px-4 py-3">Importateur</th><th className="px-4 py-3">DRA Réf</th><th className="px-4 py-3">Incoterm</th><th className="px-4 py-3 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredDossiers.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Aucun dossier.</td></tr>}
            {filteredDossiers.map((d, i) => {
              const repr = d.representation_entry || {};
              const dra = repr.dra_reference || d.dra || "—";
              const imp = repr.importateur || d.importateur || "—";
              const allArticles = [...(d.articles||[]), ...(repr.articles||[])].filter((a,idx,arr)=>arr.findIndex(x=>x.id===a.id)===idx);
              return (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-[10px] text-accent font-semibold">{i+1}</span></td>
                  <td className="px-4 py-3 font-bold">{imp}</td>
                  <td className="px-4 py-3 font-mono font-bold text-accent">{dra}</td>
                  <td className="px-4 py-3">{repr.incoterm || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" className="h-8 text-xs border-accent/20 text-accent hover:bg-accent hover:text-white" onClick={() => setArticlePopup({ dra, importateur: imp, articles: allArticles })}>Afficher</Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {articlePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setArticlePopup(null)}>
          <div className="relative w-full max-w-4xl mx-4 rounded-xl border bg-card shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <div><h3 className="font-semibold text-sm">Articles — DRA : <span className="font-mono text-accent">{articlePopup.dra}</span></h3><p className="text-xs text-muted-foreground">{articlePopup.importateur}</p></div>
              <button onClick={() => setArticlePopup(null)} className="h-8 w-8 hover:bg-muted rounded text-muted-foreground flex items-center justify-center">✕</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-auto">
              <table className="w-full text-xs text-left border">
                <thead className="bg-muted font-bold uppercase text-muted-foreground text-[10px]">
                  <tr><th className="p-2 border-b">Désignation</th><th className="p-2 border-b">Position Tarifaire</th><th className="p-2 border-b text-right">Poids (kg)</th><th className="p-2 border-b text-right">Qté</th><th className="p-2 border-b text-right">FOB</th></tr>
                </thead>
                <tbody className="divide-y">
                  {articlePopup.articles.length === 0 && <tr><td colSpan={5} className="p-4 text-center">Aucun article.</td></tr>}
                  {articlePopup.articles.map((a,i)=>(
                    <tr key={i}>
                      <td className="p-2 border-b">{a.designation||"—"}</td>
                      <td className="p-2 border-b font-mono text-accent">{a.position_tarifaire||a.position||"—"}</td>
                      <td className="p-2 border-b text-right">{a.poids||"—"}</td>
                      <td className="p-2 border-b text-right">{a.quantite||"—"}</td>
                      <td className="p-2 border-b text-right text-success font-bold">{a.fob||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t flex justify-end bg-muted/20"><Button variant="outline" size="sm" onClick={()=>setArticlePopup(null)}>Fermer</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(/function ChefReprDossiersView\(\) \{[\s\S]*?(?=\n(?:export )?function|\n*$)/, chefReprViewNew);

fs.writeFileSync('src/routes/app.dossiers.tsx', code);
console.log('App dossiers patched successfully.');
