const fs = require('fs');

let c = fs.readFileSync('src/routes/app.dossiers.tsx', 'utf8');

c = c.replace(
  'const allDossiers = (rawDossiers as Dossier[] ?? []);',
  `const isAutoListRole = user?.role ? ['inspecteur', 'secretaire_inspecteur', 'directeur_provincial', 'directeur_general', 'super_admin', 'inspecteur_chef'].includes(user.role) : false;
  const allDossiers = (rawDossiers as Dossier[] ?? []);
  const historyDossiers = (rawHistory as Dossier[] ?? []);
  const displayDossiers = hasSearched ? (searchResults || []) : (isAutoListRole ? filteredDossiers : historyDossiers);`
);

c = c.replace(
  '{(searchResults || filteredDossiers.slice(0, 20)).map((d) => (',
  '{displayDossiers.slice(0, 20).map((d) => ('
);

c = c.replace(
  '{searchResults ? "Résultats de recherche" : "Dossiers Actifs"} : {searchResults ? searchResults.length : filteredDossiers.length}',
  '{hasSearched ? "Résultats de recherche" : (isAutoListRole ? "Dossiers Actifs" : "Historique Traités")} : {displayDossiers.length}'
);

fs.writeFileSync('src/routes/app.dossiers.tsx', c);
console.log('Successfully updated app.dossiers.tsx');
