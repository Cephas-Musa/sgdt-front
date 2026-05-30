const fs = require('fs');

let content = fs.readFileSync('src/dashboards/inspecteur/DossierForms.tsx', 'utf8');

// Update API imports if missing apiGetNextReference
if (!content.includes('apiGetNextReference')) {
  content = content.replace('apiGetTypeDossiers, apiGetWarehouses }', 'apiGetTypeDossiers, apiGetWarehouses, apiGetNextReference }');
}

// Replace CommonFields with the stateful one
const newCommonFields = `
const CommonFields = () => {
  const [ref, setRef] = useState("Chargement...");
  useEffect(() => {
    apiGetNextReference().then(res => setRef(res.reference)).catch(() => setRef("RD-XXXX"));
  }, []);
  return (
    <div className="col-span-2 grid grid-cols-2 gap-4 mb-2">
      <Field label="Référence dossier"><Input value={ref} disabled className="bg-muted text-primary font-mono font-bold" /></Field>
      <Field label="Date"><Input value={new Date().toLocaleDateString('fr-FR')} disabled className="bg-muted" /></Field>
    </div>
  );
};

const DynamicTitres = ({ count, formData, setFormData }: any) => {
  const num = parseInt(count);
  if (!num || num < 1) return null;
  return (
    <div className="col-span-2 space-y-4 mt-2 p-4 border border-dashed rounded-md bg-muted/5">
      <h4 className="font-semibold text-sm text-primary/80">Détails des {num} Titres</h4>
      {Array.from({ length: num }).map((_, i) => (
        <div key={"titre-"+i} className="grid grid-cols-2 gap-4">
          <Field label={"Titre "+(i+1)}><Input placeholder={"N° Titre "+(i+1)} value={(formData.titres_details && formData.titres_details[i]?.numero) || ''} onChange={e => {
            const arr = [...(formData.titres_details || [])];
            if(!arr[i]) arr[i] = {};
            arr[i].numero = e.target.value;
            setFormData({...formData, titres_details: arr});
          }} /></Field>
          <Field label={"Date Titre "+(i+1)}><Input type="date" value={(formData.titres_details && formData.titres_details[i]?.date) || ''} onChange={e => {
            const arr = [...(formData.titres_details || [])];
            if(!arr[i]) arr[i] = {};
            arr[i].date = e.target.value;
            setFormData({...formData, titres_details: arr});
          }} /></Field>
        </div>
      ))}
    </div>
  );
};

const DynamicDeclarations = ({ count, formData, setFormData }: any) => {
  const num = parseInt(count);
  if (!num || num < 1) return null;
  return (
    <div className="col-span-2 space-y-4 mt-2 p-4 border border-dashed rounded-md bg-muted/5">
      <h4 className="font-semibold text-sm text-primary/80">Détails des {num} Déclarations</h4>
      {Array.from({ length: num }).map((_, i) => (
        <div key={"decl-"+i} className="grid grid-cols-2 gap-4">
          <Field label={"Déclaration "+(i+1)}><Input placeholder={"N° Déclaration "+(i+1)} value={(formData.declarations_details && formData.declarations_details[i]?.numero) || ''} onChange={e => {
            const arr = [...(formData.declarations_details || [])];
            if(!arr[i]) arr[i] = {};
            arr[i].numero = e.target.value;
            setFormData({...formData, declarations_details: arr});
          }} /></Field>
          <Field label={"Date Déclaration "+(i+1)}><Input type="date" value={(formData.declarations_details && formData.declarations_details[i]?.date) || ''} onChange={e => {
            const arr = [...(formData.declarations_details || [])];
            if(!arr[i]) arr[i] = {};
            arr[i].date = e.target.value;
            setFormData({...formData, declarations_details: arr});
          }} /></Field>
        </div>
      ))}
    </div>
  );
};
`;

content = content.replace(/const CommonFields = \(\) => \(\s*<div className="col-span-2 grid grid-cols-2 gap-4 mb-2">\s*<Field label="Référence dossier"><Input value="Généré à l'enregistrement" disabled className="bg-muted" \/><\/Field>\s*<Field label="Date"><Input value=\{new Date\(\)\.toLocaleDateString\('fr-FR'\)\} disabled className="bg-muted" \/><\/Field>\s*<\/div>\s*\);/s, newCommonFields);

const formNames = ['DirectForm', 'TransbordementForm', 'VracForm', 'LotForm', 'PetrolierForm', 'AutresForm', 'TraficForm', 'ExportForm'];

formNames.forEach(fn => {
  const regex = new RegExp("(export function " + fn + "\\(\\) \\{[\\s\\S]*?)(<\\/FormGrid>)");
  content = content.replace(regex, "$1  <DynamicTitres count={formData.nombre_titres} formData={formData} setFormData={setFormData} />\n        <DynamicDeclarations count={formData.nombre_declarations} formData={formData} setFormData={setFormData} />\n      $2");
});

fs.writeFileSync('src/dashboards/inspecteur/DossierForms.tsx', content);
