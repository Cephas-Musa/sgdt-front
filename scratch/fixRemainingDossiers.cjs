const fs = require('fs');

const filesToFix = [
    'c:/Users/HP/Documents/sgdt/src/dashboards/AgentPointageDash.tsx',
    'c:/Users/HP/Documents/sgdt/src/dashboards/BarriereControleDash.tsx',
    'c:/Users/HP/Documents/sgdt/src/dashboards/ChefBarriereDash.tsx',
    'c:/Users/HP/Documents/sgdt/src/dashboards/ChefEntrepotDouaneDash.tsx',
    'c:/Users/HP/Documents/sgdt/src/dashboards/ChefRechercheDash.tsx',
    'c:/Users/HP/Documents/sgdt/src/dashboards/VerificateurDash.tsx',
    'c:/Users/HP/Documents/sgdt/src/dashboards/inspecteur/SecretaryOperations.tsx',
    'c:/Users/HP/Documents/sgdt/src/routes/app.colisage.tsx',
    'c:/Users/HP/Documents/sgdt/src/routes/app.colisage.$dossierId.tsx',
    'c:/Users/HP/Documents/sgdt/src/components/PartnerFormDialog.tsx',
    'c:/Users/HP/Documents/sgdt/src/routes/app.localisation.tsx',
    'c:/Users/HP/Documents/sgdt/src/routes/app.representation.tsx'
];

for (const file of filesToFix) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // 1. Remove DOSSIERS from import
    content = content.replace(/import\s*\{[^}]*DOSSIERS[^}]*\}\s*from\s*["']@\/lib\/mock["'];?/, match => {
        let newMatch = match.replace(/\bDOSSIERS\b\s*,?\s*/, '');
        // If it's just import { } from ... or import { type ... } from ... maybe clean up if completely empty
        if (/import\s*\{\s*\}\s*from/.test(newMatch)) {
            return '';
        }
        return newMatch;
    });

    // 2. Inject useApi if missing
    if (!content.includes('import { useApi')) {
        content = content.replace(/(import .* from ['"]react['"];?)/, '$1\nimport { useApi, apiGetDossiers } from "@/lib/api";');
    } else if (!content.includes('apiGetDossiers')) {
         content = content.replace(/import\s*\{([^}]*useApi[^}]*)\}\s*from\s*["']@\/lib\/api["'];?/, (match, group1) => {
             return `import { ${group1}, apiGetDossiers } from "@/lib/api";`;
         });
    }

    // 3. Inject DOSSIERS definition inside the main component
    const compRegex = /export default function (\w+)\([^)]*\)\s*\{/;
    if (compRegex.test(content) && !content.includes('const { data: rawDossiers') && content.includes('DOSSIERS')) {
         content = content.replace(compRegex, (match) => {
             return `${match}\n  const { data: rawDossiers } = useApi(apiGetDossiers);\n  const DOSSIERS = (rawDossiers as any[]) || [];`;
         });
    }
    
    // special cases for components not default exported but use DOSSIERS
    const funcRegex = /function (\w+)\([^)]*\)\s*\{/g;
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
        const funcName = match[1];
        // naive approach: just inject at the top of the function if DOSSIERS is used somewhere inside.
        // It's safer to just let the specific files be handled or only inject in known functions.
    }

    fs.writeFileSync(file, content);
}

console.log("Fixed all other DOSSIERS imports.");
