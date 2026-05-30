const fs = require('fs');
let c = fs.readFileSync('src/dashboards/inspecteur/DossierForms.tsx', 'utf8');

c = c.replace(/const DynamicTitres = \(\{\s*count,\s*formData,\s*setFormData\s*\}\s*:\s*any\)\s*=>\s*\{([\s\S]*?)\};/, `const DynamicTitres = ({ count, formData, setFormData }: any) => {
  const num = parseInt(count);
  
  React.useEffect(() => {
    if (formData.titres_details && formData.titres_details.length > (num || 0)) {
      setFormData({ ...formData, titres_details: formData.titres_details.slice(0, num || 0) });
    }
  }, [num]); // removed formData.titres_details to prevent infinite loops

  if (!num || num < 1) return null;
  return (
    <div className="col-span-2 space-y-4 mt-2 p-4 border border-dashed border-border rounded-lg bg-card text-card-foreground">
      <h4 className="font-semibold text-sm">📄 Détails des {num} Titre{num > 1 ? 's' : ''}</h4>
      {Array.from({ length: num }).map((_, i) => (
        <div key={"titre-" + i} className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded border border-border">
          <Field label={"Titre " + (i + 1)}><Input placeholder={"N° Titre " + (i + 1)} value={(formData.titres_details && formData.titres_details[i]?.numero) || ''} onChange={e => {
            const arr = [...(formData.titres_details || [])];
            if (!arr[i]) arr[i] = {};
            arr[i].numero = e.target.value;
            setFormData({ ...formData, titres_details: arr });
          }} /></Field>
          <Field label={"Date Titre " + (i + 1)}><Input type="date" value={(formData.titres_details && formData.titres_details[i]?.date) || ''} onChange={e => {
            const arr = [...(formData.titres_details || [])];
            if (!arr[i]) arr[i] = {};
            arr[i].date = e.target.value;
            setFormData({ ...formData, titres_details: arr });
          }} /></Field>
        </div>
      ))}
    </div>
  );
};`);

c = c.replace(/const DynamicDeclarations = \(\{\s*count,\s*formData,\s*setFormData\s*\}\s*:\s*any\)\s*=>\s*\{([\s\S]*?)\};/, `const DynamicDeclarations = ({ count, formData, setFormData }: any) => {
  const num = parseInt(count);
  
  React.useEffect(() => {
    if (formData.declarations_details && formData.declarations_details.length > (num || 0)) {
      setFormData({ ...formData, declarations_details: formData.declarations_details.slice(0, num || 0) });
    }
  }, [num]); // prevent infinite loops

  if (!num || num < 1) return null;
  return (
    <div className="col-span-2 space-y-4 mt-2 p-4 border border-dashed border-border rounded-lg bg-card text-card-foreground">
      <h4 className="font-semibold text-sm">📋 Détails des {num} Déclaration{num > 1 ? 's' : ''}</h4>
      {Array.from({ length: num }).map((_, i) => (
        <div key={"decl-" + i} className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded border border-border">
          <Field label={"Déclaration " + (i + 1)}><Input placeholder={"N° Déclaration " + (i + 1)} value={(formData.declarations_details && formData.declarations_details[i]?.numero) || ''} onChange={e => {
            const arr = [...(formData.declarations_details || [])];
            if (!arr[i]) arr[i] = {};
            arr[i].numero = e.target.value;
            setFormData({ ...formData, declarations_details: arr });
          }} /></Field>
          <Field label={"Date Déclaration " + (i + 1)}><Input type="date" value={(formData.declarations_details && formData.declarations_details[i]?.date) || ''} onChange={e => {
            const arr = [...(formData.declarations_details || [])];
            if (!arr[i]) arr[i] = {};
            arr[i].date = e.target.value;
            setFormData({ ...formData, declarations_details: arr });
          }} /></Field>
        </div>
      ))}
    </div>
  );
};`);

fs.writeFileSync('src/dashboards/inspecteur/DossierForms.tsx', c);
