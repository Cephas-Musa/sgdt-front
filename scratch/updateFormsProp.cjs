const fs = require('fs');
let c = fs.readFileSync('src/dashboards/inspecteur/DossierForms.tsx', 'utf8');

const forms = [
  { name: 'DirectForm', code: 'direct' },
  { name: 'TransbordementForm', code: 'transbordement' },
  { name: 'VracForm', code: 'vrac' },
  { name: 'LotForm', code: 'lot' },
  { name: 'PetrolierForm', code: 'petrolier' },
  { name: 'AutresForm', code: 'autre' },
  { name: 'TraficForm', code: 'trafic' },
  { name: 'ExportForm', code: 'export' },
  { name: 'DechargementForm', code: 'dechargement' },
  { name: 'AllegementForm', code: 'allegement' }
];

for (const form of forms) {
  // Replace definition
  const defRegex = new RegExp(`export function ${form.name}\\(\\) \\{`);
  c = c.replace(defRegex, `export function ${form.name}({ type }: { type?: any } = {}) {`);

  // Replace typeId variable assignment
  const typeIdRegex = new RegExp(`const typeId = useTypeDossierId\\("${form.code}"\\);`);
  c = c.replace(typeIdRegex, `const typeId = type?.id || useTypeDossierId("${form.code}");`);
}

fs.writeFileSync('src/dashboards/inspecteur/DossierForms.tsx', c);
