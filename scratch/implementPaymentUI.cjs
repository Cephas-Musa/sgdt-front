const fs = require('fs');

// 1. Update DossierForms.tsx
let c = fs.readFileSync('src/dashboards/inspecteur/DossierForms.tsx', 'utf8');

// Replace { type }: { type?: any } = {} with { type, onSuccess }: { type?: any, onSuccess?: () => void } = {}
c = c.replace(/export function (\w+Form)\(\{ type \}: \{ type\?: any \} = \{\}\) \{/g, "export function $1({ type, onSuccess }: { type?: any, onSuccess?: () => void } = {}) {");

// Replace window.location.reload() with if (onSuccess) onSuccess()
c = c.replace(/window\.location\.reload\(\);/g, "if (onSuccess) onSuccess();");

// Add payment confirmation before try { await apiCreateDossier... }
// Find: if (!typeId) { toast.error("Type de dossier non trouvé"); return; }
// Then insert the confirmation right after it
const typeErrorRegex = /if \(\!typeId\) \{ toast\.error\("Type[^"]+"\);\s*return;\s*\}/g;

c = c.replace(typeErrorRegex, `if (!typeId) { toast.error("Type de dossier non trouvé"); return; }

    const tarif = type?.tarif || 0;
    const devise = type?.devise || 'USD';
    if (!window.confirm(\`Le tarif de création pour ce type de dossier est de \${tarif} \${devise}. Ce montant sera déduit de votre solde.\\n\\nVoulez-vous procéder au paiement et créer le dossier ?\`)) {
      toast.info("Création et paiement annulés.");
      return;
    }`);

fs.writeFileSync('src/dashboards/inspecteur/DossierForms.tsx', c);
console.log("DossierForms.tsx updated.");

// 2. Update app.dossiers.tsx
let app = fs.readFileSync('src/routes/app.dossiers.tsx', 'utf8');

// Extract reload function from useApi
// Find: const { data: rawDossiers, loading: dossiersLoading } = useApi(
app = app.replace(
  /const \{ data: rawDossiers, loading: dossiersLoading \} = useApi\(\s*\(\) => apiGetDossiers\(\),\s*\[\]\s*\);/,
  "const { data: rawDossiers, loading: dossiersLoading, reload: reloadDossiers } = useApi(\n    () => apiGetDossiers(),\n    []\n  );"
);

// Inject onSuccess={reloadDossiers} into all form instantiations
const formNames = [
  'DirectForm', 'TransbordementForm', 'VracForm', 'LotForm', 'PetrolierForm', 
  'AllegementForm', 'DechargementForm', 'TraficForm', 'ExportForm', 'AutresForm', 'GenericForm'
];

for (const f of formNames) {
  const regex = new RegExp(`<${f} key=\\{type\\.id\\} type=\\{type\\} />`, 'g');
  app = app.replace(regex, `<${f} key={type.id} type={type} onSuccess={reloadDossiers} />`);
}

// We should also check how GenericForm handles onSuccess
if (!app.includes("onSuccess?: () => void")) {
  app = app.replace(
    /function GenericForm\(\{ type \}: \{ type: \{ id: string; libelle: string; tarif: number; devise: string; code: string \} \}\) \{/,
    "function GenericForm({ type, onSuccess }: { type: { id: string; libelle: string; tarif: number; devise: string; code: string }, onSuccess?: () => void }) {"
  );
  
  app = app.replace(
    /window\.location\.reload\(\);/g,
    "if (onSuccess) onSuccess();"
  );

  const genericTypeError = /if \(\!importateur \|\| \!declarant\) \{/g;
  app = app.replace(genericTypeError, `if (!importateur || !declarant) {`);
  
  // Generic form doesn't use typeId directly before try {}, we can inject confirm before try {
  const tryRegex = /setLoading\(true\);\s*try \{/g;
  app = app.replace(tryRegex, `const tarif = type?.tarif || 0;
    const devise = type?.devise || 'USD';
    if (!window.confirm(\`Le tarif de création pour ce type de dossier est de \${tarif} \${devise}. Ce montant sera déduit de votre solde.\\n\\nVoulez-vous procéder au paiement et créer le dossier ?\`)) {
      toast.info("Création et paiement annulés.");
      return;
    }
    setLoading(true);
    try {`);
}

fs.writeFileSync('src/routes/app.dossiers.tsx', app);
console.log("app.dossiers.tsx updated.");
