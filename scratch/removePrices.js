const fs = require('fs');
let c = fs.readFileSync('src/dashboards/inspecteur/DossierForms.tsx', 'utf8');
c = c.replace(/ \(\$[0-9]+\)/g, '');
fs.writeFileSync('src/dashboards/inspecteur/DossierForms.tsx', c);
