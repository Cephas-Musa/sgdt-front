const fs = require('fs');

const file = 'c:/Users/HP/Documents/sgdt/src/routes/app.dossiers.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="flex flex-wrap gap-2">
            <DirectForm />
            <TransbordementForm />
            <VracForm />
            <LotForm />
            <PetrolierForm />
            <DechargementForm />
            <TraficForm />
            <ExportForm />
            <AutresForm />
          </div>`;

const targetStr2 = `<div className="flex flex-wrap gap-2">
          <DirectForm />
          <TransbordementForm />
          <VracForm />
          <LotForm />
          <PetrolierForm />
          <DechargementForm />
          <TraficForm />
          <ExportForm />
          <AutresForm />
        </div>`;

const replacement = `<div className="flex flex-wrap gap-2">
            <DynamicDossierFormsContainer onSuccess={() => window.location.reload()} />
          </div>`;

const replacement2 = `<div className="flex flex-wrap gap-2">
          <DynamicDossierFormsContainer onSuccess={() => window.location.reload()} />
        </div>`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    console.log("Replaced targetStr");
}

if (content.includes(targetStr2)) {
    content = content.replace(targetStr2, replacement2);
    console.log("Replaced targetStr2");
}

// Remove the unused form imports
const unusedImports = `import {
  DirectForm,
  TransbordementForm,
  VracForm,
  LotForm,
  PetrolierForm,
  DechargementForm,
  TraficForm,
  ExportForm,
  AutresForm,
} from "@/dashboards/inspecteur/forms";`;

content = content.replace(unusedImports, "");

fs.writeFileSync(file, content);
console.log("Saved.");
