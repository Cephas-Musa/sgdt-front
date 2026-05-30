const fs = require('fs');

let content = fs.readFileSync('src/dashboards/inspecteur/DossierForms.tsx', 'utf8');

// Add apiGetWarehouses to imports
content = content.replace('apiGetTypeDossiers } from "@/lib/api";', 'apiGetTypeDossiers, apiGetWarehouses } from "@/lib/api";');

// Add useWarehouses hook
const useWarehousesHook = `
function useWarehouses() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  useEffect(() => {
    apiGetWarehouses().then(res => setWarehouses(res)).catch(() => {});
  }, []);
  return warehouses;
}

const CommonFields = () => (
  <div className="col-span-2 grid grid-cols-2 gap-4 mb-2">
    <Field label="Référence dossier"><Input value="Généré à l'enregistrement" disabled className="bg-muted" /></Field>
    <Field label="Date"><Input value={new Date().toLocaleDateString('fr-FR')} disabled className="bg-muted" /></Field>
  </div>
);

const LocalisationField = ({ value, onChange, warehouses }: any) => (
  <Field label="Localisation / Entrepôt">
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Sélectionner l'entrepôt" /></SelectTrigger>
      <SelectContent>
        {warehouses.map((w: any) => (
          <SelectItem key={w.id} value={String(w.id)}>{w.nom}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Field>
);
`;

content = content.replace('export function DirectForm', useWarehousesHook + '\nexport function DirectForm');

// Now inject hook call into each form
const formNames = ['DirectForm', 'TransbordementForm', 'VracForm', 'LotForm', 'PetrolierForm', 'AutresForm', 'TraficForm', 'ExportForm'];

formNames.forEach(fn => {
  content = content.replace(new RegExp(`export function ${fn}\\(\\) \\{\\n  const typeId`), `export function ${fn}() {\n  const warehouses = useWarehouses();\n  const typeId`);
  
  // Replace <FormGrid> with <FormGrid>\n<CommonFields />
  content = content.replace(new RegExp(`(${fn}.*?<FormGrid>)`, 's'), `$1\n        <CommonFields />`);
});

// Replace Localisation text inputs with the new component
content = content.replace(/<Field label="Localisation"(.*?)><Input(.*?)onChange={e => handleChange\('localisation', e\.target\.value\)}(.*?)\/><\/Field>/g, '<LocalisationField warehouses={warehouses} value={formData.localisation} onChange={(v: string) => handleChange("localisation", v)} />');

fs.writeFileSync('src/dashboards/inspecteur/DossierForms.tsx', content);
