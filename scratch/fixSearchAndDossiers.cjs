const fs = require('fs');

function fixAppDossiers() {
    const file = 'c:/Users/HP/Documents/sgdt/src/routes/app.dossiers.tsx';
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove DOSSIERS from import
    content = content.replace(/import\s*\{\s*DOSSIERS[^}]*\}\s*from\s*["']@\/lib\/mock["'];?/, match => {
        return match.replace(/\bDOSSIERS\s*,?\s*/, '');
    });

    // 2. Add inside SecretaireDossiersView
    const secRegex = /function SecretaireDossiersView\(\)\s*\{/;
    if (secRegex.test(content) && !content.includes('const { data: rawDossiersSec } = useApi(apiGetDossiers)')) {
        content = content.replace(secRegex, `function SecretaireDossiersView() {\n    const { data: rawDossiersSec } = useApi(apiGetDossiers);\n    const DOSSIERS = (rawDossiersSec as any[]) || [];`);
    }

    // 3. Add inside ChefReprDossiersView
    const chefRegex = /function ChefReprDossiersView\(\)\s*\{/;
    if (chefRegex.test(content) && !content.includes('const { data: rawDossiersChef } = useApi(apiGetDossiers)')) {
        content = content.replace(chefRegex, `function ChefReprDossiersView() {\n    const { data: rawDossiersChef } = useApi(apiGetDossiers);\n    const DOSSIERS = (rawDossiersChef as any[]) || [];`);
    }

    fs.writeFileSync(file, content);
    console.log("Fixed app.dossiers.tsx");
}

function fixOperateurSaisieDash() {
    const file = 'c:/Users/HP/Documents/sgdt/src/dashboards/OperateurSaisieDash.tsx';
    let content = fs.readFileSync(file, 'utf8');

    // Make the RD- prefix for the input
    const targetInput = `<Input placeholder="Recherche par rǸfǸrence?" value={searchRef} onChange={(e) => setSearchRef(e.target.value)} className="h-9 text-xs" />`;
    const targetInputVariations = [
        '<Input placeholder="Recherche par rǸfǸrence" value={searchRef} onChange={(e) => setSearchRef(e.target.value)} className="h-9 text-xs" />',
        '<Input placeholder="Recherche par rǸfǸrence..." value={searchRef} onChange={(e) => setSearchRef(e.target.value)} className="h-9 text-xs" />',
        '<Input placeholder="Recherche par rǸfǸrence…" value={searchRef} onChange={(e) => setSearchRef(e.target.value)} className="h-9 text-xs" />'
    ];

    const replacement = `
            <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent/40">
              <span className="flex h-9 items-center rounded-l-md border-r border-input bg-muted/60 px-3 text-sm font-semibold select-none">
                RD-
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={searchRef.replace(/^RD-/i, "")}
                onChange={(e) => setSearchRef("RD-" + e.target.value.replace(/\\D/g, "").slice(0, 4))}
                placeholder="0000"
                className="h-9 w-full flex-1 rounded-r-md bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/50"
              />
            </div>
    `;

    // Try finding the input
    let replaced = false;
    if (content.includes('value={searchRef} onChange={(e) => setSearchRef(e.target.value)}')) {
        content = content.replace(/<Input[^>]*value=\{searchRef\}[^>]*\/>/g, replacement);
        replaced = true;
    }

    if (replaced) {
        fs.writeFileSync(file, content);
        console.log("Fixed OperateurSaisieDash.tsx");
    } else {
        console.log("Could not find searchRef input in OperateurSaisieDash.tsx");
    }
}

fixAppDossiers();
fixOperateurSaisieDash();
