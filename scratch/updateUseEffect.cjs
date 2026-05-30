const fs = require('fs');
let c = fs.readFileSync('src/dashboards/inspecteur/DossierForms.tsx', 'utf8');
c = c.replace(/React\.useEffect/g, 'useEffect');
fs.writeFileSync('src/dashboards/inspecteur/DossierForms.tsx', c);
