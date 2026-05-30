const fs = require('fs');

const file = 'c:/Users/HP/Documents/sgdt/src/routes/app.dossiers.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the container of forms
const replacement = `<div className="flex flex-wrap gap-2">
            <DynamicDossierFormsContainer onSuccess={() => window.location.reload()} />
          </div>`;

content = content.replace(/<div className="flex flex-wrap gap-2">\s*<DirectForm \/>[\s\S]*?<AutresForm \/>\s*<\/div>/g, replacement);

fs.writeFileSync(file, content);
console.log("Replaced with regex.");
