const fs = require('fs');

const file = 'c:/Users/HP/Documents/sgdt/src/routes/app.dossiers.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `const inspecteurDossiers = allDossiers.filter(
      (d) => d.created_by === user?.id || d.inspecteur_id === user?.id
    );`;

const replacement = `const inspecteurDossiers = allDossiers.filter(
      (d) => String(d.created_by) === String(user?.id) || String(d.inspecteur_id) === String(user?.id)
    );`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    console.log("Replaced targetStr");
} else {
    console.log("Target string not found.");
}

fs.writeFileSync(file, content);
console.log("Saved.");
